import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { sendVerificationEmail } from "@/lib/email"

// Validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .email("Invalid email")
    .refine((email) => email.endsWith("@wisc.edu"), {
      message: "You must use a valid @wisc.edu email address",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  try {
    console.log("Starting signup process...")
    const body = await req.json()
    console.log("Received signup request for email:", body.email)

    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      console.log("Validation failed:", result.error.errors)
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log("User already exists:", email)
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    console.log("Generated verification token")

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
      },
    })
    console.log("User created successfully:", user.id)

    // Send verification email
    console.log("Attempting to send verification email to:", email)
    const emailResult = await sendVerificationEmail(email, verificationToken)
    console.log("Email sending result:", emailResult)

    if (!emailResult.success) {
      console.error("Failed to send verification email:", emailResult.error)
      // Don't fail the signup process, just log the error
    }

    return NextResponse.json(
      {
        message: "User created successfully. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

