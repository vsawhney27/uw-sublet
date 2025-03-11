import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"


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
  isDraft: z.boolean().optional(),
})

// GET all listings with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const session = await getServerSession(authOptions)
    
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : 0
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 10000
    const bedrooms = searchParams.get("bedrooms")
    const availableFrom = searchParams.get("availableFrom")
    const availableUntil = searchParams.get("availableUntil")
    const amenities = searchParams.get("amenities")?.split(",") || []
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined
    const showDrafts = searchParams.get("showDrafts") === "true"
    const userOnly = searchParams.get("userOnly") === "true"

    // Base where clause
    let where: Prisma.ListingWhereInput = {
      price: {
        gte: minPrice,
        lte: maxPrice
      },
      ...(bedrooms && bedrooms !== "any" && {
        bedrooms: bedrooms === "4" ? { gte: 4 } : parseInt(bedrooms)
      }),
      ...(availableFrom && {
        availableFrom: { lte: new Date(availableFrom) }
      }),
      ...(availableUntil && {
        availableUntil: { gte: new Date(availableUntil) }
      }),
      ...(amenities.length > 0 && {
        amenities: { hasEvery: amenities }
      }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { address: { contains: search, mode: "insensitive" } }
        ]
      })
    }

    // Handle visibility based on authentication and request type
    if (userOnly && session?.user) {
      // Show all user's listings including drafts
      where.userId = session.user.id;
    } else {
      // Show published listings for everyone, and drafts only for the owner
      where.OR = [
        { published: true, isDraft: false },
        ...(session?.user ? [{ userId: session.user.id, isDraft: true }] : [])
      ];
    }

    console.log("Fetching listings with where clause:", where);

    const listings = await prisma.listing.findMany({
      where,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    console.log(`Found ${listings.length} listings`);

    // Format dates as ISO strings
    const formattedListings = listings.map(listing => ({
      ...listing,
      availableFrom: listing.availableFrom.toISOString(),
      availableUntil: listing.availableUntil.toISOString(),
      createdAt: listing.createdAt.toISOString()
    }))

    return NextResponse.json({ listings: formattedListings })
  } catch (error) {
    console.error("Error fetching listings:", error)
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 }
    )
  }
}

// POST create a new listing
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      isDraft = false,
    } = result.data

    // Ensure published and isDraft aren't both true
    if (published && isDraft) {
      return NextResponse.json(
        { error: "A listing cannot be both published and a draft" },
        { status: 400 }
      )
    }

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
        isDraft,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({ listing }, { status: 201 })
  } catch (error) {
    console.error("Create listing error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

