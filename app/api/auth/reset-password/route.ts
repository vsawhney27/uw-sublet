import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const result = resetPasswordSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { token, password } = result.data

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        tokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password and clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
        tokenExpiry: null,
      },
    })

    return NextResponse.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 