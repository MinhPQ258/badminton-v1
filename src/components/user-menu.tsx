"use client"

import { useState, useRef, useEffect } from "react"
import { LogOut, User, UserCircle } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

export default function UserMenu({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-50">
          <div className="px-4 py-2 border-b border-slate-50 mb-1">
            <p className="text-sm font-medium text-foreground truncate">{userName}</p>
          </div>
          
          <button 
            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-secondary flex items-center gap-2 transition-colors"
            onClick={() => {
              setIsOpen(false)
              alert("Tính năng sửa thông tin sẽ được cập nhật sớm!")
            }}
          >
            <User className="h-4 w-4" /> Sửa thông tin
          </button>
          
          <form action={logoutAction}>
            <button 
              type="submit" 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
