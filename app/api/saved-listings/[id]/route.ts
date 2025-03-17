import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

// DELETE saved listing by ID
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing saved listing ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get saved listing
    const savedListing = await prisma.savedListing.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!savedListing) {
      return NextResponse.json(
        { error: "Saved listing not found" },
        { status: 404 }
      )
    }

    // Check if user owns the saved listing
    if (savedListing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete saved listing
    await prisma.savedListing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete saved listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
} 