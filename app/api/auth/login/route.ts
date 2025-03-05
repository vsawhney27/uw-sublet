import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { verifyPassword, generateToken, setAuthCookie } from "@/lib/auth"

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { email, password } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 403 })
    }

    // Generate JWT token
    const token = generateToken({ id: user.id, email: user.email })

    // Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })

    // Set auth cookie
    setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

