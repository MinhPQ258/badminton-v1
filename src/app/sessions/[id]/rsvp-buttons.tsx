"use client"

import { useTransition, useOptimistic } from "react"
import { toggleRSVPAction } from "@/app/actions/rsvp"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

interface RSVPButtonsProps {
  sessionId: string
  currentStatus?: string
}

export default function RSVPButtons({ sessionId, currentStatus }: RSVPButtonsProps) {
  const [isPending, startTransition] = useTransition()
  
  const [optimisticStatus, addOptimisticStatus] = useOptimistic(
    currentStatus,
    (state: string | undefined, newStatus: string | undefined) => newStatus
  )

  const handleToggle = (status: 'going' | 'not_going') => {
    startTransition(async () => {
      addOptimisticStatus(optimisticStatus === status ? undefined : status)
      await toggleRSVPAction(sessionId, status)
    })
  }

  return (
    <div className="flex items-center gap-4 w-full px-2">
      <span className="text-sm font-medium whitespace-nowrap text-foreground">Xác nhận:</span>
      <select 
        value={optimisticStatus || ""}
        onChange={(e) => handleToggle(e.target.value as any)}
        disabled={isPending}
        className="flex-1 h-12 rounded-lg border border-border bg-card px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm appearance-none cursor-pointer"
      >
        <option value="" disabled>-- Chọn --</option>
        <option value="going">Tham gia (Có mặt)</option>
        <option value="not_going">Bận (Vắng mặt)</option>
      </select>
      {isPending && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground shrink-0" />}
    </div>
  )
}
