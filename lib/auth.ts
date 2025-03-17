import { hash, compare } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import type { NextRequest, NextResponse } from "next/server"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getServerSession } from "next-auth/next"
import { prisma } from "./prisma"
import { User } from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"

declare module "next-auth" {
  interface User {
    role?: string
  }
  interface Session {
    user: User & {
      role?: string
    }
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

// Compare password with hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: any): string {
  return sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" })
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return verify(token, process.env.JWT_SECRET!)
  } catch (error) {
    return null
  }
}

// Set auth cookie
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

// Auth config with credentials provider
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: '/login'
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        if (!user.password) {
          return null
        }

        const passwordMatch = await compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    // Add role to JWT token
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        }
      }
      return token
    },
    // Add role to session
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        }
      }
    }
  }
}

// Get current session
export async function getCurrentSession() {
  return await getServerSession(authOptions)
}

// Get current user from session
export async function getCurrentUser() {
  try {
    const session = await getCurrentSession()

    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch {
    return null
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getCurrentSession()
  return !!session?.user
}

// Check if user is admin
export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "ADMIN"
}

// Check if email is verified
export async function isEmailVerified(req: NextRequest) {
  const user = await getCurrentUser()
  return !!user?.emailVerified
}

