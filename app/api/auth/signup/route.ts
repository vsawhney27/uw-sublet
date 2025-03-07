import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Create user with token expiry
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        tokenExpiry,
      },
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken)

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

