"use client"

import { usePathname } from "next/navigation"

export default function ConditionalNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Hide on auth pages and session detail pages (but not /sessions/new)
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')
  const isSessionDetail = pathname.startsWith('/sessions/') && pathname !== '/sessions/new' && !pathname.endsWith('/edit')
  
  if (isAuth || isSessionDetail) {
    return null
  }
  
  return <>{children}</>
}
