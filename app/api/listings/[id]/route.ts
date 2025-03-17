import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"

// Validation schema for updating a listing
const updateListingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z.string().min(20, "Description must be at least 20 characters").optional(),
  price: z.number().positive("Price must be positive").optional(),
  address: z.string().min(5, "Address must be at least 5 characters").optional(),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or more").optional(),
  bathrooms: z.number().min(0.5, "Bathrooms must be 0.5 or more").optional(),
  availableFrom: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format for availableFrom",
    })
    .optional(),
  availableUntil: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format for availableUntil",
    })
    .optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  published: z.boolean().optional(),
})

// GET listing by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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

// PUT update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.json()
    const {
      title,
      description,
      price,
      address,
      startDate,
      endDate,
      images,
      published,
      isDraft,
    } = body

    // Validate required fields
    if (!title || !description || !price || !address || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user is admin
    const userIsAdmin = await isAdmin()

    // Get listing
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

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        title,
        description,
        price,
        address,
        availableFrom: new Date(startDate),
        availableUntil: new Date(endDate),
        images,
        published: userIsAdmin ? published : listing.published,
        isDraft,
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
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

// PATCH update listing status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.json()
    const { published } = body

    // Check if user is admin
    const userIsAdmin = await isAdmin()
    if (!userIsAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
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

