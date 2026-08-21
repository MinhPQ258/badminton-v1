"use client"

import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground">Cài đặt</h1>
        </div>
      </header>
      
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 ml-2 mt-4">Giao diện</h2>
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 bg-card">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-500'}`}>
                  {mounted && theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">Chế độ tối (Dark Mode)</span>
                  <span className="text-xs text-muted-foreground">Chuyển đổi giao diện Sáng / Tối</span>
                </div>
              </div>
              
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    theme === 'dark' ? 'bg-primary' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={theme === 'dark'}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
