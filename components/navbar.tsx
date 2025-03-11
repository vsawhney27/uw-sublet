"use client"

import * as React from "react"
import Link from "next/link"
import { UserNav } from "./user-nav"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavbarProps {
  user?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-red-700 border-b-[6px] border-red-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-white">Badger Sublets</span>
            </Link>
            <div className="hidden md:flex space-x-8">
              <Link href="/listings" className="text-white hover:text-gray-200">
                Browse
              </Link>
              <Link href="/how-it-works" className="text-white hover:text-gray-200">
                How it Works
              </Link>
              <Link href="/create-listing" className="text-white hover:text-gray-200">
                List Your Space
              </Link>
              <Link href="/about" className="text-white hover:text-gray-200">
                About
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-white border-2 border-white hover:bg-red-800 hover:text-black hover:border-black">
                    <Avatar className="h-8 w-8 mr-2 bg-white text-red-700">
                      <AvatarFallback>{user.name?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuItem asChild className="hover:bg-gray-100">
                    <Link href="/messages" className="w-full text-gray-700">Messages</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gray-100">
                    <Link href="/my-listings" className="w-full text-gray-700">My Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gray-100">
                    <Link href="/saved" className="w-full text-gray-700">Saved Listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-gray-100">
                    <Link href="/account" className="w-full text-gray-700">Account Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-600 hover:bg-gray-100 hover:text-red-700 cursor-pointer">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" className="text-white border-2 border-white hover:bg-red-800 hover:text-black hover:border-black">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost" className="text-white border-2 border-white hover:bg-red-800 hover:text-black hover:border-black">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 