import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create your user account
  const yourPassword = await hash("password123", 12) // You can change this password
  const yourUser = await prisma.user.upsert({
    where: { email: 'vsawhney@wisc.edu' },
    update: {},
    create: {
      email: 'vsawhney@wisc.edu',
      name: 'Veer Sawhney',
      password: yourPassword,
      emailVerified: new Date('2025-03-07T23:19:33.407Z'),
      role: 'USER',
    },
  })

  // Create test user account
  const testPassword = await hash("password123", 12)
  const testUser = await prisma.user.upsert({
    where: { email: 'test@wisc.edu' },
    update: {},
    create: {
      email: 'test@wisc.edu',
      name: 'Test User',
      password: testPassword,
      emailVerified: new Date('2025-03-07T23:19:33.407Z'),
      role: 'USER',
    },
  })

  // Create test listings
  const listings = await Promise.all([
    prisma.listing.create({
      data: {
        title: 'Luxury Studio Downtown',
        description: 'Modern studio apartment in the heart of downtown. Features high-end finishes and amazing city views. Perfect for young professionals!',
        price: 1100,
        address: '100 State St, Madison, WI 53703',
        bedrooms: 0,
        bathrooms: 1,
        availableFrom: new Date('2024-06-01'),
        availableUntil: new Date('2024-08-31'),
        amenities: ['Furnished', 'Washer/Dryer', 'Parking', 'Air Conditioning', 'Dishwasher', 'Gym', 'Pool'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Cozy 1BR near Campus',
        description: 'Charming 1 bedroom apartment just 5 minutes walk from campus. All utilities included!',
        price: 850,
        address: '456 University Ave, Madison, WI 53703',
        bedrooms: 1,
        bathrooms: 1,
        availableFrom: new Date('2024-05-15'),
        availableUntil: new Date('2024-08-15'),
        amenities: ['Utilities Included', 'Air Conditioning', 'Internet Included'],
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Spacious 3BR House with Yard',
        description: 'Beautiful 3 bedroom house with a large backyard. Perfect for a group of friends or family. Close to shopping and restaurants.',
        price: 2200,
        address: '789 Monroe St, Madison, WI 53711',
        bedrooms: 3,
        bathrooms: 2.5,
        availableFrom: new Date('2024-06-01'),
        availableUntil: new Date('2024-07-31'),
        amenities: ['Washer/Dryer', 'Parking', 'Air Conditioning', 'Dishwasher', 'Pets Allowed', 'Yard'],
        images: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb',
          'https://images.unsplash.com/photo-1486304873000-235643847519'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Room in 4BR Student House',
        description: 'Private room available in a friendly student house. Great location near campus with awesome roommates!',
        price: 600,
        address: '123 W Gorham St, Madison, WI 53703',
        bedrooms: 4,
        bathrooms: 2,
        availableFrom: new Date('2024-05-20'),
        availableUntil: new Date('2024-08-20'),
        amenities: ['Furnished', 'Washer/Dryer', 'Air Conditioning', 'Internet Included'],
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
        ],
        userId: testUser.id,
        isRoomSublet: true,
        totalRoommates: 3,
        roommateGenders: 'mixed',
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Female Only: Room in 3BR Apartment',
        description: 'One room available in all-female apartment. Clean, quiet environment perfect for serious students.',
        price: 700,
        address: '567 W Johnson St, Madison, WI 53703',
        bedrooms: 3,
        bathrooms: 2,
        availableFrom: new Date('2024-06-15'),
        availableUntil: new Date('2024-08-31'),
        amenities: ['Furnished', 'Washer/Dryer', 'Air Conditioning', 'Gym', 'Pool'],
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
        ],
        userId: testUser.id,
        isRoomSublet: true,
        totalRoommates: 2,
        roommateGenders: 'all-female',
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Affordable Studio near Capitol',
        description: 'Budget-friendly studio apartment near the Capitol. Basic amenities included.',
        price: 750,
        address: '321 E Mifflin St, Madison, WI 53703',
        bedrooms: 0,
        bathrooms: 1,
        availableFrom: new Date('2024-07-01'),
        availableUntil: new Date('2024-08-31'),
        amenities: ['Utilities Included', 'Air Conditioning'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Luxury 2BR with Lake View',
        description: 'High-end 2 bedroom apartment with stunning lake views. Recently renovated with modern amenities.',
        price: 2500,
        address: '888 Langdon St, Madison, WI 53703',
        bedrooms: 2,
        bathrooms: 2,
        availableFrom: new Date('2024-06-01'),
        availableUntil: new Date('2024-07-31'),
        amenities: ['Furnished', 'Washer/Dryer', 'Air Conditioning', 'Dishwasher', 'Gym', 'Pool', 'Balcony', 'Parking'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Room in Graduate House',
        description: 'Quiet room available in a house shared with graduate students. Perfect for serious academics.',
        price: 800,
        address: '432 Spring St, Madison, WI 53715',
        bedrooms: 4,
        bathrooms: 2,
        availableFrom: new Date('2024-05-15'),
        availableUntil: new Date('2024-08-31'),
        amenities: ['Washer/Dryer', 'Air Conditioning', 'Internet Included', 'Study Room'],
        images: [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
        ],
        userId: testUser.id,
        isRoomSublet: true,
        totalRoommates: 3,
        roommateGenders: 'mixed',
      },
    })
  ])

  console.log({ testUser, listings })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 