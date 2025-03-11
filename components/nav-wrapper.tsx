"use client"

import { useSession } from "next-auth/react"
import { Navbar } from "./navbar"

export function NavWrapper() {
  const { data: session } = useSession()
  
  return <Navbar user={session?.user} />
} 