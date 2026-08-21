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
    <div className="flex gap-3 w-full">
      <Button 
        className={`flex-1 h-12 text-base font-medium justify-center transition-all duration-200 border-2 ${optimisticStatus === 'going' ? 'border-primary' : 'border-border'}`} 
        variant={optimisticStatus === 'going' ? 'default' : 'outline'}
        onClick={() => handleToggle('going')}
        disabled={isPending}
      >
        {isPending && optimisticStatus !== 'going' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />} Tham gia
      </Button>
      <Button 
        className={`flex-1 h-12 text-base font-medium justify-center transition-all duration-200 border-2 ${optimisticStatus === 'not_going' ? 'border-destructive' : 'border-border'}`} 
        variant={optimisticStatus === 'not_going' ? 'destructive' : 'outline'}
        onClick={() => handleToggle('not_going')}
        disabled={isPending}
      >
        {isPending && optimisticStatus !== 'not_going' ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />} Bận
      </Button>
    </div>
  )
}
