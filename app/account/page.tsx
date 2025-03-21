"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ListingCard } from "@/components/listing-card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Shield, ListFilter } from "lucide-react"
import type { Listing } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type ListingWithDates = Listing & {
  availableFrom: string
  availableUntil: string
  createdAt: string
  totalRoommates: number | undefined
  roommateGenders: string | undefined
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [listings, setListings] = useState<ListingWithDates[]>([])
  const [savedListings, setSavedListings] = useState<ListingWithDates[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Too Weak",
    color: "bg-red-500",
  })
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user) {
      setProfileData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }))
    }

    const fetchListings = async () => {
      try {
        console.log("Fetching user listings...");
        const [listingsResponse, savedResponse] = await Promise.all([
          fetch("/api/listings?userOnly=true"),
          fetch("/api/saved-listings")
        ])
        
        if (!listingsResponse.ok) {
          throw new Error("Failed to fetch listings")
        }
        
        const listingsData = await listingsResponse.json()
        console.log("Fetched listings:", listingsData.listings);
        setListings(listingsData.listings)
        
        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          console.log("Fetched saved listings:", savedData.listings);
          setSavedListings(savedData.listings)
        }
      } catch (error) {
        console.error("Error fetching listings:", error)
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchListings()
    }
  }, [status, router, session])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (profileData.newPassword !== profileData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update password")
      }

      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully.",
      })

      // Clear password fields
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please check your current password and try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const calculatePasswordStrength = (password: string) => {
    let score = 0
    
    // Length check (up to 2 points)
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Number check
    if (/[0-9]/.test(password)) score += 1
    
    // Special character check
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    const strengthMap = {
      0: { label: "Too Weak", color: "bg-red-500" },
      1: { label: "Weak", color: "bg-orange-500" },
      2: { label: "Medium", color: "bg-yellow-500" },
      3: { label: "Strong", color: "bg-green-500" },
      4: { label: "Very Strong", color: "bg-green-600" },
    }

    setPasswordStrength({
      score,
      label: strengthMap[Math.min(score, 4) as keyof typeof strengthMap].label,
      color: strengthMap[Math.min(score, 4) as keyof typeof strengthMap].color,
    })
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      })
      
      signOut({ callbackUrl: '/' })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  const drafts = listings.filter(listing => listing.isDraft)
  const published = listings.filter(listing => listing.published && !listing.isDraft)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session?.user?.name}</h1>
              <p className="text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          <Tabs defaultValue="listings" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
              <TabsTrigger value="listings">My Listings</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Published Listings ({published.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {published.map((listing) => (
                        <ListingCard key={listing.id} {...listing} />
                      ))}
                      {published.length === 0 && (
                        <p className="text-gray-500 col-span-2">No published listings yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Draft Listings ({drafts.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {drafts.map((listing) => (
                        <ListingCard key={listing.id} {...listing} />
                      ))}
                      {drafts.length === 0 && (
                        <p className="text-gray-500 col-span-2">No draft listings.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Saved Listings ({savedListings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {savedListings.map((listing) => (
                      <ListingCard key={listing.id} {...listing} />
                    ))}
                    {savedListings.length === 0 && (
                      <p className="text-gray-500 col-span-2">No saved listings yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={session?.user?.email || ""}
                        readOnly
                        disabled
                        className="mt-1 bg-gray-100"
                      />
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={profileData.currentPassword}
                        onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={profileData.newPassword}
                        onChange={(e) => {
                          setProfileData({ ...profileData, newPassword: e.target.value });
                          calculatePasswordStrength(e.target.value);
                        }}
                        required
                      />
                      {/* Password strength indicator */}
                      <div className="mt-2">
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-full rounded-full ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Password strength: {passwordStrength.label}
                        </p>
                      </div>
                      {/* Password requirements */}
                      <ul className="text-sm text-gray-600 mt-2 space-y-1">
                        <li>• At least 8 characters</li>
                        <li>• At least one number</li>
                        <li>• At least one special character</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={profileData.confirmPassword}
                        onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>

                  <div className="mt-8 space-y-4 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      className="w-full" 
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Account
                    </Button>
                  </div>

                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex space-x-2 justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDeleteAccount()
                            setShowDeleteConfirm(false)
                          }}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 