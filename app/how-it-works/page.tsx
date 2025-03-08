"use client"

import { Search, Home, Key } from "lucide-react"

export default function HowItWorks() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">How Badger Sublets Works</h1>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-lg">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Search className="h-8 w-8 text-red-700" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Search</h2>
          <p className="text-gray-600">
            Browse through verified listings from UW-Madison students. Filter by price, 
            location, dates, and amenities to find your perfect sublet.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-lg">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-red-700" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Connect</h2>
          <p className="text-gray-600">
            Message verified UW-Madison students directly through our platform. 
            Ask questions, schedule viewings, and get all the details you need.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white shadow-lg">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-red-700" />
          </div>
          <h2 className="text-xl font-semibold mb-4">Move In</h2>
          <p className="text-gray-600">
            Finalize your sublet agreement and move into your new home. 
            Our platform makes the entire process simple and secure.
          </p>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Why Choose Badger Sublets?</h2>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Verified UW-Madison Students</h3>
            <p className="text-gray-600">
              Every listing on our platform is from a verified UW-Madison student, 
              ensuring a safe and trustworthy subletting experience.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Secure Communication</h3>
            <p className="text-gray-600">
              Our built-in messaging system keeps your contact information private 
              until you're ready to share it.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">
              Simple search filters, detailed listings, and a streamlined process 
              make finding your next home hassle-free.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 