import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "./providers"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { NavWrapper } from "@/components/nav-wrapper"
import { Footer } from "@/components/footer"

// Load Inter font
const inter = Inter({ subsets: ["latin"] })

// App metadata
export const metadata: Metadata = {
  title: "Badger Sublets - UW-Madison Student Sublet Platform",
  description: "A safe and secure platform for UW-Madison students to sublet apartments",
  generator: 'v0.dev'
}

// Root layout with Google Maps and providers
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()

  return (
    <html lang="en" className="h-full">
      <head>
        {apiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geocoding`}
            strategy="beforeInteractive"
          />
        )}
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <Providers>
          <NavWrapper />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'