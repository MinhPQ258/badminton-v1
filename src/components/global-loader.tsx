"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function GlobalLoader() {
  const [showCancel, setShowCancel] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Show cancel button after 4 seconds
    const timer = setTimeout(() => {
      setShowCancel(true)
    }, 4000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-xl flex flex-col items-center max-w-[80vw]">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-foreground font-medium text-center">Đang tải dữ liệu...</p>
        
        {showCancel && (
          <div className="mt-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs text-muted-foreground mb-3 text-center">Kết nối có vẻ chậm. Bạn có muốn quay lại?</p>
            <Button variant="outline" size="sm" onClick={() => router.back()} className="border-border">
              Hủy thao tác
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
