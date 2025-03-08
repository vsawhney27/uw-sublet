"use client"

import { GraduationCap, Users, Building, Shield } from "lucide-react"

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">About Badger Sublets</h1>

      <div className="max-w-4xl mx-auto">
        {/* Mission Statement */}
        <div className="text-center mb-16">
          <p className="text-xl text-gray-700 leading-relaxed">
            Badger Sublets was created by UW-Madison students for UW-Madison students, 
            with the mission of simplifying the subletting process in the campus community.
          </p>
        </div>

        {/* Key Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <GraduationCap className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-lg font-semibold">Student-Focused</h3>
            </div>
            <p className="text-gray-600">
              Built with a deep understanding of student housing needs and the unique 
              challenges of the UW-Madison rental market.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-lg font-semibold">Community-Driven</h3>
            </div>
            <p className="text-gray-600">
              Created to foster a trusted network of Badgers helping Badgers find 
              their ideal housing solutions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-lg font-semibold">Local Expertise</h3>
            </div>
            <p className="text-gray-600">
              Developed with intimate knowledge of Madison's neighborhoods and 
              the specific needs of the campus community.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-red-700" />
              </div>
              <h3 className="text-lg font-semibold">Trust & Safety</h3>
            </div>
            <p className="text-gray-600">
              Built with security and verification features to ensure a safe 
              and trustworthy subletting experience.
            </p>
          </div>
        </div>

        {/* Origin Story */}
        <div className="bg-white p-8 rounded-lg shadow-lg mb-16">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-600 mb-4">
            Badger Sublets emerged from firsthand experience with the challenges of student housing 
            at UW-Madison. As Computer Sciences students, we saw an opportunity to leverage technology 
            to solve a common problem in our community.
          </p>
          <p className="text-gray-600">
            What started as a project to help fellow students has grown into a comprehensive 
            platform that connects the UW-Madison community, making the subletting process 
            more accessible and efficient for everyone.
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-gray-600">
            Have questions or suggestions? We're always looking to improve the platform 
            for our community.
          </p>
          <a 
            href="mailto:contact@badgersublets.com" 
            className="inline-block mt-4 px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
} 