"use client"

import Link from "next/link"
import { getSupportEmail } from "@/lib/email"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmailForm } from "@/components/email-form"
import { useState } from "react"

export function Footer() {
  const supportEmail = "support@badgersublets.com"
  const [showEmailDialog, setShowEmailDialog] = useState(false)

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">BadgerSublets</h3>
            <p className="text-sm">
              The easiest way to find and list sublets near UW-Madison campus.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="hover:text-white transition-colors">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/create-listing" className="hover:text-white transition-colors">
                  Create Listing
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>
            <p className="text-sm">
              Questions or concerns?{" "}
              <button
                onClick={() => setShowEmailDialog(true)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                {supportEmail}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>© {new Date().getFullYear()} BadgerSublets. All rights reserved.</p>
          <p className="mt-2">Not affiliated with the University of Wisconsin-Madison.</p>
        </div>
      </div>

      {/* Support Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
          </DialogHeader>
          <EmailForm isSupport={true} />
        </DialogContent>
      </Dialog>
    </footer>
  )
} 