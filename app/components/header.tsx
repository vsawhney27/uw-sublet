import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navbar } from "./navbar"

export async function Header() {
  const session = await getServerSession(authOptions)
  
  return <Navbar user={session?.user} />
} 