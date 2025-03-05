import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { generateToken, setAuthCookie } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Update user to mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    })

    // Generate JWT token
    const jwtToken = generateToken({ id: user.id, email: user.email })

    // Create response
    const response = NextResponse.redirect(new URL("/", req.url))

    // Set auth cookie
    setAuthCookie(response, jwtToken)

    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

