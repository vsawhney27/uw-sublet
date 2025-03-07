"use client"

import Link from "next/link"
import { UserNav } from "./user-nav"

export function Header() {
  return (
    <header className="bg-red-700 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl">
            Badger Sublets
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/listings" className="hover:underline">
            Browse Listings
          </Link>
          <Link href="/how-it-works" className="hover:underline">
            How It Works
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
        </nav>
        <UserNav />
      </div>
    </header>
  )
} 