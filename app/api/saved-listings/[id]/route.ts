import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const id = context.params.id

    if (!id) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 })
    }

    // Check if the listing exists and is saved by the user
    const savedListing = await prisma.savedListing.findFirst({
      where: {
        listingId: id,
        userId: session.user.id
      }
    })

    if (!savedListing) {
      return NextResponse.json({ error: "Listing not found in saved listings" }, { status: 404 })
    }

    // Delete the saved listing
    await prisma.savedListing.delete({
      where: {
        id: savedListing.id
      }
    })

    return NextResponse.json({ message: "Listing unsaved successfully" })
  } catch (error) {
    console.error("Error unsaving listing:", error)
    return NextResponse.json(
      { error: "Failed to unsave listing" },
      { status: 500 }
    )
  }
} 