"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Plus, Receipt, Settings } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages and session detail pages
  const isAuth = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')
  const isSessionDetail = pathname.startsWith('/sessions/') && pathname !== '/sessions/new' && !pathname.endsWith('/edit')
  
  if (isAuth || isSessionDetail) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border pb-safe z-40">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
          <Home className={`h-6 w-6 mb-1 ${pathname === '/' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Trang chủ</span>
        </Link>
        
        <Link href="/members" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/members') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
          <Users className={`h-6 w-6 mb-1 ${pathname.startsWith('/members') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Thành viên</span>
        </Link>
        
        <Link href="/sessions/new" className="relative -top-5 flex flex-col items-center justify-center group">
          <div className="bg-primary text-primary-foreground h-14 w-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.4)] border-4 border-background group-hover:scale-105 transition-transform">
            <Plus className="h-7 w-7" />
          </div>
        </Link>
        
        <Link href="/expenses" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/expenses') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
          <Receipt className={`h-6 w-6 mb-1 ${pathname.startsWith('/expenses') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Chi phí</span>
        </Link>
        
        <Link href="/settings" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/settings') ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground transition-colors'}`}>
          <Settings className={`h-6 w-6 mb-1 ${pathname.startsWith('/settings') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Cài đặt</span>
        </Link>
      </div>
    </div>
  )
}
