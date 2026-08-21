import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, MapPin, Users, PlusCircle, ArrowLeft } from "lucide-react"

export default async function SessionsListPage() {
  const supabase = await createClient()
  
  // Lấy tất cả sessions sắp tới
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'upcoming')
    .order('start_time', { ascending: true })

  // Lấy tất cả sessions đã qua
  const { data: pastSessions } = await supabase
    .from('sessions')
    .select('*')
    .in('status', ['completed', 'settled'])
    .order('start_time', { ascending: false })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Tất cả buổi đánh
          </h1>
        </div>
        <Link href="/sessions/new">
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Tạo buổi mới
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-600" /> Sắp diễn ra
          </h2>
          
          {upcomingSessions && upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSessions.map((session) => (
                <Link key={session.id} href={`/sessions/${session.id}`} className="block h-full">
                  <Card className="hover:shadow-md transition-shadow h-full cursor-pointer hover:border-blue-300">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-1">{formatDate(session.start_time)}</CardTitle>
                      <CardDescription>
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mt-1">Sắp diễn ra</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{session.venue || 'Chưa có địa điểm'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{session.total_attendees || 0} người tham gia</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Không có buổi đánh nào sắp tới.</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-600" /> Đã qua
          </h2>
          
          {pastSessions && pastSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastSessions.map((session) => (
                <Link key={session.id} href={`/sessions/${session.id}`} className="block h-full">
                  <Card className="hover:bg-slate-50 transition-colors h-full opacity-80">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base line-clamp-1">{formatDate(session.start_time)}</CardTitle>
                      <CardDescription>
                        {session.status === 'settled' ? (
                          <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full mt-1">Đã quyết toán</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full mt-1">Hoàn thành</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1"><Users className="w-4 h-4 text-slate-400" /> {session.total_attendees || 0}</span>
                        {session.cost_per_person && (
                          <span className="font-medium">{session.cost_per_person.toLocaleString('vi-VN')} đ/người</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Chưa có lịch sử.</p>
          )}
        </section>
      </div>
    </div>
  )
}
