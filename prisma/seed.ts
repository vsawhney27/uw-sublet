import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@wisc.edu' },
    update: {},
    create: {
      email: 'test@wisc.edu',
      name: 'Test User',
      password: 'hashed_password', // In production, this should be properly hashed
      emailVerified: new Date(),
      role: 'USER',
    },
  })

  // Create some test listings
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
        amenities: ['Washer/Dryer', 'Parking', 'Air Conditioning'],
        images: ['/placeholder.svg'],
        userId: user.id,
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
        amenities: ['Heat Included', 'Water Included', 'Internet'],
        images: ['/placeholder.svg'],
        userId: user.id,
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
        amenities: ['Furnished', 'Parking', 'Laundry'],
        images: ['/placeholder.svg'],
        isRoomSublet: true,
        totalRoommates: 3,
        roommateGenders: 'mixed',
        userId: user.id,
      },
    }),
  ])

  console.log({ user, listings })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 