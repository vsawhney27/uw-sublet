"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function VerifyEmail() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || isVerifying) {
        return
      }

      setIsVerifying(true) // Prevent multiple verification attempts

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Email verified successfully!")
        } else {
          setStatus("error")
          setMessage(data.error || "Failed to verify email")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Something went wrong")
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          {status === "loading" && (
            <div>
              <h2 className="text-2xl font-bold">Verifying your email...</h2>
              <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
              <p className="mt-2 text-gray-600">Your email has been successfully verified.</p>
              <Button
                className="mt-4 bg-red-700 hover:bg-red-800"
                onClick={() => router.push("/login")}
              >
                Log In
              </Button>
            </div>
          )}

          {status === "error" && (
            <div>
              <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <Button
                className="mt-4 bg-red-700 hover:bg-red-800"
                onClick={() => router.push("/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 