"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function AdminDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
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
      if (status === "loading") return
      
      if (!session) {
        router.push("/login")
        return
      }
      
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()
        
        if (!response.ok || !data.user || data.user.role !== "ADMIN") {
          router.push("/")
          return
        }
        setIsLoading(false)
      } catch (error) {
        console.error("Error checking admin status:", error)
        router.push("/")
      }
    }
    
    checkAdmin()
  }, [router, session, status])
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (isLoading) return
      
      try {
        // Fetch users
        const usersResponse = await fetch("/api/admin/users")
        const usersData = await usersResponse.json()
        
        if (usersResponse.ok) {
          setUsers(usersData.users || [])
        }
        
        // Fetch listings
        const listingsResponse = await fetch("/api/admin/listings")
        const listingsData = await listingsResponse.json()
        
        if (listingsResponse.ok) {
          setListings(listingsData.listings || [])
        }
        
        // Fetch reports
        const reportsResponse = await fetch("/api/admin/reports")
        const reportsData = await reportsResponse.json()
        
        if (reportsResponse.ok) {
          setReports(reportsData.reports || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      }
    }
    
    fetchDashboardData()
  }, [isLoading])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Users</h3>
          <p className="text-2xl">{users.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Listings</h3>
          <p className="text-2xl">{listings.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Reports</h3>
          <p className="text-2xl">{reports.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        {reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Reason</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report: any) => (
                  <tr key={report.id}>
                    <td className="px-4 py-2">{report.id}</td>
                    <td className="px-4 py-2">{report.reason}</td>
                    <td className="px-4 py-2">{report.status}</td>
                    <td className="px-4 py-2">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No reports found.</p>
        )}
      </div>
    </div>
  )
}

