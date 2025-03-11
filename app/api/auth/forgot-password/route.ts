import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/email"

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = forgotPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { email } = result.data

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal whether a user exists or not
    if (!user) {
      return NextResponse.json({ message: "If an account exists with this email, you will receive password reset instructions." })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: resetToken,
        tokenExpiry,
      },
    })

    // Send reset email
    await sendPasswordResetEmail(email, resetToken)

    return NextResponse.json({
      message: "If an account exists with this email, you will receive password reset instructions.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 