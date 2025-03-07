import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST() {
  try {
    // Create test listings
    const testListings = [
      {
        title: "Spacious 2BR Near Campus",
        description: "Beautiful 2 bedroom apartment just minutes from campus. Features modern appliances and a large balcony.",
        price: 1200,
        bedrooms: 2,
        bathrooms: 1,
        address: "123 State Street, Madison, WI",
        availableFrom: new Date("2024-06-01"),
        availableUntil: new Date("2024-08-31"),
        amenities: ["Furnished", "Washer/Dryer", "Air Conditioning"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
        userId: "test-user-id" // You'll need to replace this with a valid user ID
      },
      {
        title: "Cozy Studio Downtown",
        description: "Perfect studio apartment in the heart of downtown Madison. Walking distance to State Street and campus.",
        price: 800,
        bedrooms: 0,
        bathrooms: 1,
        address: "456 W Johnson St, Madison, WI",
        availableFrom: new Date("2024-05-15"),
        availableUntil: new Date("2024-08-15"),
        amenities: ["Furnished", "Utilities Included"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
        userId: "test-user-id" // You'll need to replace this with a valid user ID
      },
      {
        title: "Luxury 3BR House",
        description: "Stunning 3 bedroom house with modern amenities. Perfect for a group of students or young professionals.",
        price: 2200,
        bedrooms: 3,
        bathrooms: 2,
        address: "789 University Ave, Madison, WI",
        availableFrom: new Date("2024-06-01"),
        availableUntil: new Date("2024-07-31"),
        amenities: ["Furnished", "Washer/Dryer", "Parking", "Air Conditioning"],
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
        userId: "test-user-id" // You'll need to replace this with a valid user ID
      }
    ]

    // Create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        email: "test@example.com",
        name: "Test User",
        password: "hashed_password", // In a real app, this should be properly hashed
        emailVerified: new Date()
      }
    })

    // Create the listings with the test user ID
    const createdListings = await Promise.all(
      testListings.map(listing =>
        prisma.listing.create({
          data: {
            ...listing,
            userId: testUser.id
          }
        })
      )
    )

    return NextResponse.json({
      message: "Test data seeded successfully",
      listings: createdListings
    })
  } catch (error) {
    console.error("Error seeding test data:", error)
    return NextResponse.json(
      { error: "Failed to seed test data" },
      { status: 500 }
    )
  }
} 