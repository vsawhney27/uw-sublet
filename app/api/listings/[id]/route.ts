import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

// Validation schema for updating a listing
const updateListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  published: z.boolean().optional(),
  isDraft: z.boolean().optional(),
})

// GET listing by ID
export async function GET(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Get listing with user info
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(listing)
  } catch (error) {
    console.error("Get listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT update a listing
export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Check if user owns the listing
    if (listing.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()

    // Validate input
    const result = updateListingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const { title, description, price, published, isDraft } = result.data

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(published !== undefined && { published }),
        ...(isDraft !== undefined && { isDraft }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Update listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE listing by ID
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get listing
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true },
    })

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      )
    }

    // Check if user owns the listing or is admin
    const userIsAdmin = await isAdmin()
    if (listing.userId !== user.id && !userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete listing
    await prisma.listing.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PATCH update listing status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    // Extract ID from URL using Next.js conventions
    const id = request.nextUrl.pathname.split("/").pop()

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Check if user is authenticated and is an admin
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { published } = body

    if (published === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Update listing status
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: { published },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(updatedListing)
  } catch (error) {
    console.error("Update listing status error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

