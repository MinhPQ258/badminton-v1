"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Users, Plus, Receipt, Settings } from "lucide-react"

export default function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages
  if (pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/auth')) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={`flex flex-col items-center justify-center w-16 h-full ${pathname === '/' ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}>
          <Home className={`h-6 w-6 mb-1 ${pathname === '/' ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Trang chủ</span>
        </Link>
        
        <Link href="/members" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/members') ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}>
          <Users className={`h-6 w-6 mb-1 ${pathname.startsWith('/members') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Thành viên</span>
        </Link>
        
        <Link href="/sessions/new" className="relative -top-5 flex flex-col items-center justify-center">
          <div className="bg-blue-600 text-white h-14 w-14 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 hover:bg-blue-700 transition-colors">
            <Plus className="h-7 w-7" />
          </div>
        </Link>
        
        <Link href="/expenses" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/expenses') ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}>
          <Receipt className={`h-6 w-6 mb-1 ${pathname.startsWith('/expenses') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Chi phí</span>
        </Link>
        
        <Link href="/settings" className={`flex flex-col items-center justify-center w-16 h-full ${pathname.startsWith('/settings') ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}>
          <Settings className={`h-6 w-6 mb-1 ${pathname.startsWith('/settings') ? 'stroke-[2.5px]' : ''}`} />
          <span className="text-[10px]">Cài đặt</span>
        </Link>
      </div>
    </div>
  )
}
