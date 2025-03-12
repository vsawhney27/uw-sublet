import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET saved listings for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const savedListings = await prisma.savedListing.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Format dates as ISO strings and extract listing data
    const formattedListings = savedListings.map(saved => ({
      ...saved.listing,
      availableFrom: saved.listing.availableFrom.toISOString(),
      availableUntil: saved.listing.availableUntil.toISOString(),
      createdAt: saved.listing.createdAt.toISOString(),
      isSaved: true
    }))

    return NextResponse.json({ listings: formattedListings })
  } catch (error) {
    console.error("Error fetching saved listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved listings" },
      { status: 500 }
    )
  }
}

// POST save a listing
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { listingId } = body

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 })
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Check if already saved
    const existingSave = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: session.user.id,
          listingId
        }
      }
    })

    if (existingSave) {
      return NextResponse.json({ error: "Listing already saved" }, { status: 400 })
    }

    // Save the listing
    const savedListing = await prisma.savedListing.create({
      data: {
        userId: session.user.id,
        listingId
      },
      include: {
        listing: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ savedListing }, { status: 201 })
  } catch (error) {
    console.error("Error saving listing:", error)
    return NextResponse.json(
      { error: "Failed to save listing" },
      { status: 500 }
    )
  }
} 