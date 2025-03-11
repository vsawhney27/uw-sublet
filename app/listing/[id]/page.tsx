import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ListingDetail } from "@/components/listing-detail"
import { redirect } from "next/navigation"

export default async function ListingPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  const listing = await prisma.listing.findUnique({
    where: {
      id: params.id,
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
              <p className="text-gray-500 mb-4">The listing you're looking for doesn't exist or has been removed.</p>
              <Link href="/">
                <Button className="bg-red-700 hover:bg-red-800">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If the listing is a draft and the viewer is not the owner, redirect to 404
  if (listing.isDraft && listing.userId !== session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-6 text-center">
              <h1 className="text-2xl font-bold mb-4">Listing Not Available</h1>
              <p className="text-gray-500 mb-4">This listing is currently not available for viewing.</p>
              <Link href="/">
                <Button className="bg-red-700 hover:bg-red-800">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <ListingDetail 
          listing={listing} 
          currentUser={session?.user || null}
        />
      </div>
    </div>
  )
}

