"use client"

import Link from "next/link"
import { UserNav } from "./user-nav"

export function Header() {
  return (
    <header className="bg-red-700 text-white sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold text-xl hover:text-white/80 transition-colors">
            Badger Sublets
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/listings" className="hover:text-white/80 transition-colors">
              Browse Listings
            </Link>
            <Link href="/how-it-works" className="hover:text-white/80 transition-colors">
              How It Works
            </Link>
            <Link href="/about" className="hover:text-white/80 transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-white/80 transition-colors">
              FAQ
            </Link>
          </nav>
        </div>
        <UserNav />
      </div>
    </header>
  )
} 