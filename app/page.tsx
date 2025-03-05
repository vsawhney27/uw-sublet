import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-red-700 text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl">BadgerSublets</span>
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
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-red-700 to-red-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Find Your Perfect Sublet at UW-Madison</h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              A safe and secure platform exclusively for UW students to sublet apartments
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/listings">
                <Button size="lg" className="bg-white text-red-700 hover:bg-gray-100">
                  Browse Listings
                </Button>
              </Link>
              <Link href="/create-listing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-red-600">
                  Post Your Sublet
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-3">Verify Your UW Email</h3>
                <p className="text-gray-600">
                  Sign up with your @wisc.edu email to confirm you're a UW-Madison student.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-3">Create or Browse Listings</h3>
                <p className="text-gray-600">
                  Post your apartment for sublet or browse available options from fellow Badgers.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-red-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-3">Connect Safely</h3>
                <p className="text-gray-600">Message verified UW students and arrange your sublet with confidence.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Featured Listings</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                  <div className="h-48 bg-gray-200">
                    <img
                      src={`/placeholder.svg?height=200&width=400&text=Apartment+${i}`}
                      alt={`Apartment ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">2 Bedroom Near Campus</h3>
                    <p className="text-gray-600 mb-2">$800/month • Available May-August</p>
                    <p className="text-gray-600 mb-4">Walking distance to Union South and Engineering Campus</p>
                    <Link href={`/listing/${i}`}>
                      <Button className="w-full bg-red-700 hover:bg-red-800">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/listings">
                <Button variant="outline" className="border-red-700 text-red-700 hover:bg-red-50">
                  View All Listings <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BadgerSublets</h3>
              <p className="text-gray-300">The safe way for UW-Madison students to find and list sublets.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/listings" className="text-gray-300 hover:text-white">
                    Browse Listings
                  </Link>
                </li>
                <li>
                  <Link href="/create-listing" className="text-gray-300 hover:text-white">
                    Post a Sublet
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-gray-300 hover:text-white">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-300">Questions or feedback? Reach out to us at support@badgersublets.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>© {new Date().getFullYear()} BadgerSublets. Not affiliated with the University of Wisconsin-Madison.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

