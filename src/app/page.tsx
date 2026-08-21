import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getUpcomingSessions, getRecentSessions } from "@/app/actions/session"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CalendarDays, MapPin, Users, PlusCircle, ArrowRight, CheckCircle2 } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const upcomingSessions = await getUpcomingSessions()
  const recentSessions = await getRecentSessions()

  const allSessionIds = [...upcomingSessions, ...recentSessions].map(s => s.id)
  
  const { data: rsvps } = await supabase
    .from('session_rsvps')
    .select('session_id, user_id, status')
    .in('session_id', allSessionIds)
    
  const rsvpsData = rsvps || []

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const getMyStatusBadge = (status: string | null) => {
    if (status === 'going') return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium border border-green-200">Bạn: Tham gia</span>
    if (status === 'not_going') return <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium border border-red-200">Bạn: Bận</span>
    return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs border border-slate-200">Chưa xác nhận</span>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Xin chào, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Chào mừng bạn đến với CLB Cầu Lông</p>
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
            <h2 className="text-xl font-semibold text-slate-900">Buổi đánh sắp tới</h2>
            <Link href="/sessions" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Xem tất cả <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((session) => {
                const goingCount = rsvpsData.filter(r => r.session_id === session.id && r.status === 'going').length
                const myStatus = rsvpsData.find(r => r.session_id === session.id && r.user_id === user?.id)?.status || null
                
                return (
                  <Link href={`/sessions/${session.id}`} key={session.id} className="block group">
                    <Card className="h-full hover:shadow-md transition-all hover:border-blue-300">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <CardDescription><span className="font-medium text-blue-600">Sắp diễn ra</span></CardDescription>
                          {getMyStatusBadge(myStatus)}
                        </div>
                        <CardTitle className="text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">{formatDate(session.start_time)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-4 text-sm text-slate-600 space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{session.venue || 'Chưa cập nhật địa điểm'}</span>
                        </div>
                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-slate-700">{goingCount} <span className="font-normal text-slate-500 text-xs">đăng ký</span></span>
                          </div>
                          <div className="h-4 w-px bg-slate-300"></div>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-slate-700">{session.total_attendees || 0} <span className="font-normal text-slate-500 text-xs">điểm danh</span></span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-1">Chưa có buổi đánh nào</h3>
                <p className="text-slate-500 mb-4 max-w-sm">Hiện tại câu lạc bộ chưa có lịch đánh cầu nào sắp tới. Bạn có thể tạo buổi đánh mới để mời mọi người.</p>
                <Link href="/sessions/new">
                  <Button variant="outline">Tạo buổi đánh đầu tiên</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Lịch sử gần đây</h2>
          
          <Card>
            <CardContent className="p-0">
              {recentSessions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentSessions.map((session) => {
                    const goingCount = rsvpsData.filter(r => r.session_id === session.id && r.status === 'going').length
                    
                    return (
                      <Link key={session.id} href={`/sessions/${session.id}`} className="block p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                            {new Date(session.start_time).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                            {session.status === 'settled' ? 'Đã quyết toán' : 'Hoàn thành'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500 flex justify-between items-center mt-2">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1" title="Số đăng ký">
                              <Users className="w-3 h-3 text-slate-400" /> {goingCount}
                            </span>
                            <span className="flex items-center gap-1" title="Đã điểm danh">
                              <CheckCircle2 className="w-3 h-3 text-green-500" /> {session.total_attendees || 0}
                            </span>
                          </div>
                          {session.cost_per_person && (
                            <span className="font-medium text-slate-700">
                              {session.cost_per_person.toLocaleString('vi-VN')}đ / người
                            </span>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  Chưa có lịch sử buổi đánh
                </div>
              )}
            </CardContent>
            {recentSessions.length > 0 && (
              <CardFooter className="p-4 pt-0 border-t mt-2">
                <Link href="/sessions?tab=history" className="text-sm text-blue-600 hover:underline w-full text-center mt-3 block">
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
