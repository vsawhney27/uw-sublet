import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// GET current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'

