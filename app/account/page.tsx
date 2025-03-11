"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  const drafts = listings.filter(listing => listing.isDraft)
  const published = listings.filter(listing => !listing.isDraft)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Listings</h1>
          <Link href="/create-listing">
            <Button className="bg-red-700 hover:bg-red-800">
              Create New Listing
            </Button>
          </Link>
        </div>

        {drafts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Drafts</h2>
            <div className="grid gap-4">
              {drafts.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/listing/${listing.id}`} className="text-lg font-semibold hover:text-red-700">
                          {listing.title}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">
                          Created {format(new Date(listing.createdAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-gray-700 mt-2">${listing.price}/month • {listing.bedrooms} BR</p>
                      </div>
                      <div className="space-x-2">
                        <Link href={`/listing/${listing.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={`/listing/${listing.id}/delete`}>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {published.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Published Listings</h2>
            <div className="grid gap-4">
              {published.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/listing/${listing.id}`} className="text-lg font-semibold hover:text-red-700">
                          {listing.title}
                        </Link>
                        <p className="text-gray-500 text-sm mt-1">
                          Published {format(new Date(listing.createdAt), "MMM d, yyyy")}
                        </p>
                        <p className="text-gray-700 mt-2">${listing.price}/month • {listing.bedrooms} BR</p>
                      </div>
                      <div className="space-x-2">
                        <Link href={`/listing/${listing.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={`/listing/${listing.id}/delete`}>
                          <Button variant="destructive" size="sm">Delete</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {listings.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">You haven't created any listings yet.</p>
              <Link href="/create-listing" className="mt-4 inline-block">
                <Button className="bg-red-700 hover:bg-red-800">
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 