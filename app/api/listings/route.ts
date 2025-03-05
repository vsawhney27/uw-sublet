import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getCurrentUser, isEmailVerified } from "@/lib/auth"


// Validation schema for creating/updating a listing
const listingSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  price: z.number().positive("Price must be positive"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  bedrooms: z.number().int().min(0, "Bedrooms must be 0 or more"),
  bathrooms: z.number().min(0.5, "Bathrooms must be 0.5 or more"),
  availableFrom: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format for availableFrom",
  }),
  availableUntil: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format for availableUntil",
  }),
  amenities: z.array(z.string()),
  images: z.array(z.string()).optional(),
  published: z.boolean().optional(),
})

// GET all listings with optional filters
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams

    // Parse filters
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined
    const bedrooms = searchParams.get("bedrooms") ? Number(searchParams.get("bedrooms")) : undefined
    const availableFrom = searchParams.get("availableFrom") || undefined
    const availableUntil = searchParams.get("availableUntil") || undefined
    const amenities = searchParams.get("amenities")?.split(",") || undefined
    const search = searchParams.get("search") || undefined

    // Build where clause
    const where: any = {
      published: true,
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice }
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice }
    }

    if (bedrooms !== undefined) {
      where.bedrooms = bedrooms
    }

    if (availableFrom) {
      where.availableUntil = { gte: new Date(availableFrom) }
    }

    if (availableUntil) {
      where.availableFrom = { lte: new Date(availableUntil) }
    }

    if (amenities && amenities.length > 0) {
      where.amenities = { hasEvery: amenities }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get listings
    const listings = await prisma.listing.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("Get listings error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

// POST create a new listing
export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated and email is verified
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const isVerified = await isEmailVerified(req)

    if (!isVerified) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 })
    }

    const body = await req.json()

    // Validate input
    const result = listingSchema.safeParse(body)
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
      images = [],
      published = true,
    } = result.data

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price,
        address,
        bedrooms,
        bathrooms,
        availableFrom: new Date(availableFrom),
        availableUntil: new Date(availableUntil),
        amenities,
        images,
        published,
        userId: user.id,
      },
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error("Create listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

