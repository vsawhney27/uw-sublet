"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingReports: 0,
  })
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [reports, setReports] = useState([])
  const [userSearch, setUserSearch] = useState("")
  const [listingSearch, setListingSearch] = useState("")
  const [reportFilter, setReportFilter] = useState("PENDING")
  const [selectedReport, setSelectedReport] = useState(null)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState({ type: "", id: "" })
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        
        if (!response.ok || !data.user || data.user.role !== "ADMIN") {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAdmin()
  }, [router])
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isLoading) return
      
      try {
        // Fetch stats
        const statsResponse = await fetch("/api/admin/stats")
        const statsData = await statsResponse.json()
        
        if (statsResponse.ok) {
          setStats(statsData)
        }
        
        // Fetch users
        const usersResponse = await fetch("/api/admin/users")
        const usersData = await usersResponse.json()
        
        if (usersResponse.ok) {
          setUsers(usersData.users)
        }
        
        // Fetch listings
        const listingsResponse = await fetch("/api/admin/listings")
        const listingsData = await listingsResponse.json()
        
        if (listingsResponse.ok) {
          setListings(listingsData.listings)
        }
        
        // Fetch reports
        const reportsResponse = await fetch(`/api/admin/reports?status=${reportFilter}`)
        const reportsData = await reportsResponse.json()
        
        if (reportsResponse.ok) {
          setReports(reportsData.reports)
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
    
    fetchDashboardData()
  }, [isLoading, reportFilter])
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }
  
  // Handle report status update
  const handleReportStatusUpdate = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })
      
      if (response.ok) {
        // Refresh reports
        const reportsResponse = await fetch(`/api/admin/reports?status=${reportFilter}`)
        const reportsData = await reportsResponse.json()
        
        if (reportsResponse.ok) {
          setReports(reportsData.reports)
        }
      }
    } catch (error) {
      console.error("Error updating report:", error)
    }
  }
}

