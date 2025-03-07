"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"

export default function AccountPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch("/api/user")
          const data = await response.json()
          setUser(data)
          setEditedName(data.name || "")
        } catch (error) {
          console.error("Error fetching user:", error)
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [session])

  const handleUpdateName = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editedName }),
      })

      if (response.ok) {
        setUser({ ...user, name: editedName })
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating name:", error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Enter your name"
                        />
                        <Button onClick={handleUpdateName} className="bg-red-700 hover:bg-red-800">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Input value={user.name || ""} disabled />
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input value={user.email} disabled />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <Input 
                    value={user.emailVerified ? "Verified" : "Unverified"} 
                    disabled 
                    className={user.emailVerified ? "text-green-600" : "text-red-600"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have {user.listings?.length || 0} active listings
                </p>
                <Button 
                  onClick={() => router.push("/create-listing")}
                  className="w-full bg-red-700 hover:bg-red-800"
                >
                  Create New Listing
                </Button>
                <Button 
                  onClick={() => router.push("/listings?filter=my")}
                  variant="outline"
                  className="w-full"
                >
                  View My Listings
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  You have {user.receivedMessages?.length || 0} unread messages
                </p>
                <Button 
                  onClick={() => router.push("/messages")}
                  variant="outline"
                  className="w-full"
                >
                  View Messages
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => router.push("/change-password")}
                  variant="outline"
                  className="w-full"
                >
                  Change Password
                </Button>
                <Button 
                  onClick={() => router.push("/delete-account")}
                  variant="destructive"
                  className="w-full"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 