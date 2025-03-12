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
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await context.params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        ...(session?.user ? {
          savedBy: {
            where: {
              userId: session.user.id
            }
          }
        } : {})
      }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Format dates and add saved status
    const formattedListing = {
      ...listing,
      availableFrom: listing.availableFrom.toISOString(),
      availableUntil: listing.availableUntil.toISOString(),
      createdAt: listing.createdAt.toISOString(),
      isSaved: session?.user ? listing.savedBy.length > 0 : false,
      savedBy: undefined // Remove the savedBy array from the response
    }

    return NextResponse.json({ listing: formattedListing })
  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json(
      { error: "Failed to fetch listing" },
      { status: 500 }
    )
  }
}

// PUT update a listing
export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = await context.params

    // Check if user is authenticated
    const session = await getServerSession(authOptions)

    if (!session?.user) {
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

    if (listing.userId !== session.user.id && !isUserAdmin) {
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
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.listing.delete({
      where: { id }
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
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const listing = await prisma.listing.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    console.log('Received update request:', body)

    // Validate required fields if publishing
    if (body.published === true) {
      const fullListing = await prisma.listing.findUnique({
        where: { id }
      })

      if (!fullListing) {
        return NextResponse.json({ error: "Listing not found" }, { status: 404 })
      }

      const requiredFields = ['title', 'description', 'price', 'address', 'bedrooms', 'bathrooms', 'availableFrom', 'availableUntil']
      const missingFields = requiredFields.filter(field => {
        const value = fullListing[field as keyof typeof fullListing]
        return value === null || value === undefined || value === ''
      })
      
      if (missingFields.length > 0) {
        return NextResponse.json({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          missingFields
        }, { status: 400 })
      }
    }

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id },
      data: {
        ...body,
        published: body.published ?? false,
        isDraft: body.isDraft ?? false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        ...(session?.user ? {
          savedBy: {
            where: {
              userId: session.user.id
            }
          }
        } : {})
      }
    })

    // Format dates and add saved status
    const formattedListing = {
      ...updatedListing,
      availableFrom: updatedListing.availableFrom.toISOString(),
      availableUntil: updatedListing.availableUntil.toISOString(),
      createdAt: updatedListing.createdAt.toISOString(),
      isSaved: session?.user ? updatedListing.savedBy?.length > 0 : false,
      savedBy: undefined // Remove the savedBy array from the response
    }

    console.log('Updated listing:', formattedListing)
    return NextResponse.json(formattedListing)
  } catch (error) {
    console.error("Error updating listing:", error)
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    )
  }
}

