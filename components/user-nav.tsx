"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

export function UserNav() {
  const { data: session, status } = useSession()

  // Debug session status
  useEffect(() => {
    console.log("UserNav - Session status:", status)
    console.log("UserNav - Session data:", session)
  }, [session, status])

  if (status === "loading") {
    return (
      <div className="flex gap-4">
        <Button variant="outline" className="bg-white text-red-700 hover:bg-gray-100" disabled>
          Loading...
        </Button>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="flex gap-4">
        <Link href="/login">
          <Button variant="outline" className="bg-white text-red-700 hover:bg-gray-100">
            Log In
          </Button>
        </Link>
        <Link href="/signup">
          <Button className="bg-white text-red-700 hover:bg-gray-100">Sign Up</Button>
        </Link>
      </div>
    )
  }

  const displayName = session.user.name || session.user.email?.split('@')[0] || "User"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <UserCircle className="h-8 w-8 text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{displayName}</p>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link href="/account">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/messages">Messages</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/create-listing">Create Listing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            console.log("Logging out...")
            signOut()
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 