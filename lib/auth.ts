import { hash, compare } from "bcryptjs"
import { sign, verify } from "jsonwebtoken"
import type { NextRequest, NextResponse } from "next/server"
import prisma from "./prisma"
import { NextAuthOptions, DefaultSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
    } & DefaultSession["user"]
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

// Get current user from request
export async function getCurrentUser(req: NextRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.headers.get("email") as string },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        image: true,
        role: true,
      },
    })

    return user
  } catch (error) {
    return null
  }
}

// Check if user is authenticated
export async function isAuthenticated(req: NextRequest) {
  const user = await getCurrentUser(req)
  return !!user
}

// Check if user is admin
export async function isAdmin(req: NextRequest) {
  const user = await getCurrentUser(req)
  return user?.role === "ADMIN"
}

// Check if email is verified
export async function isEmailVerified(req: NextRequest) {
  const user = await getCurrentUser(req)
  return !!user?.emailVerified
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            emailVerified: true,
            image: true,
          }
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Invalid credentials")
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string || null
        session.user.image = token.picture as string || null
      }
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

