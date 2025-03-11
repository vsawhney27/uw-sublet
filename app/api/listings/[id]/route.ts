import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isAdmin } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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

// GET a single listing by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

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
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error("Get listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// PUT update a listing
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if user is authenticated
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the listing
    const listing = await prisma.listing.findUnique({
      where: { id },
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Check if user is the owner or an admin
    const isUserAdmin = await isAdmin(req)

    if (listing.userId !== user.id && !isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const result = updateListingSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
    }

    const {
      title,
      description,
      price,
      address,
      bedrooms,
      bathrooms,
      availableFrom,
      availableUntil,
      amenities,
      images,
      published,
    } = result.data

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(address && { address }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(availableFrom && { availableFrom: new Date(availableFrom) }),
        ...(availableUntil && { availableUntil: new Date(availableUntil) }),
        ...(amenities && { amenities }),
        ...(images && { images }),
        ...(published !== undefined && { published }),
      },
    })

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error("Update listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// DELETE a listing
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.listing.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Listing deleted successfully" })
  } catch (error) {
    console.error("Delete listing error:", error)
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    )
  }
}

// PATCH update a listing
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()

    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...body,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({ listing: updatedListing })
  } catch (error) {
    console.error("Update listing error:", error)
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    )
  }
}

