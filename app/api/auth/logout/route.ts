import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" })

  // Clear auth cookie
  response.cookies.set({
    name: "auth_token",
    value: "",
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  })

  return response
}

