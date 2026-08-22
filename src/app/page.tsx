import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getUpcomingSessions, getRecentSessions } from "@/app/actions/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CalendarDays, PlusCircle, ArrowRight } from "lucide-react"
import SessionCard from "./(home)/session-card"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const upcomingSessions = await getUpcomingSessions()
  const recentSessions = await getRecentSessions()

  const allSessionIds = [...upcomingSessions, ...recentSessions].map(s => s.id)
  
  const { data: rsvps } = await supabase
    .from('session_rsvps')
    .select('session_id, user_id, status, profiles ( full_name )')
    .in('session_id', allSessionIds)
    
  const rsvpsData = rsvps || []

  const { data: attendances } = await supabase
    .from('session_attendances')
    .select('session_id, user_id, attended, profiles ( full_name )')
    .in('session_id', allSessionIds)
    .eq('attended', true)

  const attendancesData = attendances || []

  const { data: guests } = await supabase
    .from('session_guests')
    .select('id, session_id, name')
    .in('session_id', allSessionIds)

  const guestsData = guests || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Xin chào, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">Chào mừng bạn đến với CLB Cầu Lông</p>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Tạo buổi đánh
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-foreground">Buổi đánh sắp tới</h2>
            <Link href="/sessions" className="text-sm text-primary hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((session) => {
                const goingCount = rsvpsData.filter(r => r.session_id === session.id && r.status === 'going').length
                const myStatus = rsvpsData.find(r => r.session_id === session.id && r.user_id === user?.id)?.status || null
                const sessionRsvps = rsvpsData.filter(r => r.session_id === session.id)
                
                const sessionAttendances = attendancesData.filter(a => a.session_id === session.id)
                const sessionGuests = guestsData.filter(g => g.session_id === session.id)
                
                return (
                  <SessionCard
                    key={session.id}
                    session={session}
                    goingCount={goingCount}
                    myStatus={myStatus}
                    currentUserId={user?.id || ""}
                    rsvpUsers={sessionRsvps as any}
                    attendances={sessionAttendances as any}
                    guests={sessionGuests as any}
                    variant="upcoming"
                  />
                )
              })}
            </div>
          ) : (
            <Card className="bg-secondary border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">Chưa có buổi đánh nào</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">Hiện tại câu lạc bộ chưa có lịch đánh cầu nào sắp tới. Bạn có thể tạo buổi đánh mới để mời mọi người.</p>
                <Link href="/sessions/new">
                  <Button variant="outline">Tạo buổi đánh đầu tiên</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Lịch sử gần đây</h2>
          
          <Card>
            <CardContent className="p-0">
              {recentSessions.length > 0 ? (
                <div className="divide-y divide-border">
                  {recentSessions.map((session) => {
                    const goingCount = rsvpsData.filter(r => r.session_id === session.id && r.status === 'going').length
                    const sessionRsvps = rsvpsData.filter(r => r.session_id === session.id)
                    
                    const sessionAttendances = attendancesData.filter(a => a.session_id === session.id)
                    const sessionGuests = guestsData.filter(g => g.session_id === session.id)
                    
                    return (
                      <SessionCard
                        key={session.id}
                        session={session}
                        goingCount={goingCount}
                        myStatus={null}
                        currentUserId={user?.id || ""}
                        rsvpUsers={sessionRsvps as any}
                        attendances={sessionAttendances as any}
                        guests={sessionGuests as any}
                        variant="recent"
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Chưa có lịch sử buổi đánh
                </div>
              )}
            </CardContent>
            {recentSessions.length > 0 && (
              <CardFooter className="p-4 pt-0 border-t mt-2">
                <Link href="/sessions?tab=history" className="text-sm text-primary hover:underline w-full text-center mt-3 block">
                  Xem toàn bộ lịch sử
                </Link>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
