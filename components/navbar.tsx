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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-red-700">
              BadgerSublets
            </Link>

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                    Browse
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[200px] gap-3 p-4">
                      <ListItem
                        href="/listings"
                        title="All Listings"
                      >
                        Browse all available sublets
                      </ListItem>
                      <ListItem
                        href="/listings?type=room"
                        title="Room Sublets"
                      >
                        Find individual rooms for rent
                      </ListItem>
                      <ListItem
                        href="/listings?type=apartment"
                        title="Apartment Sublets"
                      >
                        Browse full apartment sublets
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {user && (
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className={navigationMenuTriggerStyle()}>
                      Manage
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[200px] gap-3 p-4">
                        <ListItem
                          href="/create-listing"
                          title="Create Listing"
                        >
                          Post a new sublet listing
                        </ListItem>
                        <ListItem
                          href="/my-listings"
                          title="My Listings"
                        >
                          Manage your posted listings
                        </ListItem>
                        <ListItem
                          href="/messages"
                          title="Messages"
                        >
                          View and respond to messages
                        </ListItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <UserNav />
        </div>
      </div>
    </nav>
  )
} 