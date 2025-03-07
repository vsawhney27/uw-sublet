import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { User } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 })
    }

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: { 
        verificationToken: token,
      }
    }) as User | null

    if (!user) {
      return NextResponse.json({ error: "Invalid verification token" }, { status: 400 })
    }

    // Check if token has expired
    if (user.tokenExpiry && user.tokenExpiry < new Date()) {
      return NextResponse.json({ 
        error: "Verification link has expired. Please sign up again to receive a new verification email." 
      }, { status: 400 })
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null, // Clear the token
        tokenExpiry: null, // Clear the expiry
      },
    })

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

