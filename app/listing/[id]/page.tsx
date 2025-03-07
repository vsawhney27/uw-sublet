import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { ListingDetail } from "@/components/listing-detail"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Map } from "@/components/map"
import { MessageForm } from "@/components/message-form"
import { EmailForm } from "@/components/email-form"
import { formatDate } from "@/lib/utils"

export default async function ListingPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
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
    notFound()
  }

  // Convert session user to the expected type
  const currentUser = session?.user ? {
    id: session.user.id,
    name: session.user.name || null,
    email: session.user.email,
    image: session.user.image || null,
  } : null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link href="/listings" className="text-red-700 hover:underline mb-6 inline-block">
          &larr; Back to listings
        </Link>
        <ListingDetail 
          listing={listing} 
          currentUser={currentUser}
        />
      </div>
    </div>
  )
}

