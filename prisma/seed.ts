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
        title: '2BR Apartment near State Street',
        description: 'Beautiful 2 bedroom apartment located just steps away from State Street. Perfect for students!',
        price: 1200,
        address: '123 State St, Madison, WI 53703',
        bedrooms: 2,
        bathrooms: 1,
        availableFrom: new Date('2024-05-15'),
        availableUntil: new Date('2024-08-15'),
        amenities: ['Washer/Dryer', 'Parking', 'AC', 'Dishwasher'],
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Studio on University Ave',
        description: 'Cozy studio apartment on University Ave. All utilities included!',
        price: 900,
        address: '456 University Ave, Madison, WI 53703',
        bedrooms: 1,
        bathrooms: 1,
        availableFrom: new Date('2024-06-01'),
        availableUntil: new Date('2024-08-31'),
        amenities: ['Utilities Included', 'Furnished', 'AC'],
        images: [
          'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'
        ],
        userId: testUser.id,
      },
    }),
    prisma.listing.create({
      data: {
        title: 'Room in 4BR House',
        description: 'Private room available in a 4 bedroom house near campus. Great roommates!',
        price: 650,
        address: '789 W Johnson St, Madison, WI 53703',
        bedrooms: 4,
        bathrooms: 2,
        availableFrom: new Date('2024-05-20'),
        availableUntil: new Date('2024-08-20'),
        amenities: ['Washer/Dryer', 'Parking', 'AC', 'Furnished'],
        images: [
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2070&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1486304873000-235643847519?q=80&w=2089&auto=format&fit=crop'
        ],
        userId: testUser.id,
        isRoomSublet: true,
        totalRoommates: 3,
        roommateGenders: 'mixed',
      },
    }),
  ])

  console.log({ yourUser, testUser, listings })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 