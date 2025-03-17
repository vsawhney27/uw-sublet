import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DeleteListingForm } from "@/components/forms/DeleteListingForm"

type ListingData = {
  listing: {
    id: string
    title: string
    userId: string
  }
} | {
  redirect: string
}

async function getListingData(id: string): Promise<ListingData> {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { redirect: "/auth/signin" }
  }

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      userId: true,
    },
  })

  if (!listing) {
    return { redirect: "/404" }
  }

  // Check if user owns the listing or is admin
  const userIsAdmin = session.user.role === "ADMIN"
  if (listing.userId !== session.user.id && !userIsAdmin) {
    return { redirect: "/403" }
  }

  return { listing }
}

type Props = {
  params: { id: string }
}

export default async function DeleteListingPage(props: Props) {
  const { params } = props

  if (!params?.id) {
    redirect("/404")
  }

  const result = await getListingData(params.id)

  if ("redirect" in result) {
    redirect(result.redirect)
  }

  return (
    <div className="container max-w-2xl py-6">
      <DeleteListingForm listing={result.listing} />
    </div>
  )
} 