"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function SignUp() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [step, setStep] = useState(1)
  const [verificationSent, setVerificationSent] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email is a wisc.edu address
    if (!email.endsWith("@wisc.edu")) {
      setError("You must use a valid @wisc.edu email address")
      return
    }

    // Move to step 2
    setStep(2)
    setError("")
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      console.log("Sending signup request...")
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()
      console.log("Signup response:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account")
      }

      // Show success message and wait for 3 seconds before redirecting
      setVerificationSent(true)
      setError("")
      
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Signup error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong")
      setVerificationSent(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Link href="/" className="text-2xl font-bold text-red-700">
              BadgerSublets
            </Link>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "First, enter your UW-Madison email" : "Complete your account setup"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verificationSent && (
            <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Account created! Please check your email to verify your account. Redirecting to login page...
              </AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">UW-Madison Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@wisc.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  You must use your @wisc.edu email to verify you're a UW student
                </p>
              </div>
              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800">
                Continue
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full bg-red-700 hover:bg-red-800" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-red-700 hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

