import { getSessionById } from "@/app/actions/session"
import { getRSVPsForSession } from "@/app/actions/rsvp"
import { getAttendancesForSession } from "@/app/actions/attendance"
import { getExpensesForSession } from "@/app/actions/expense"
import { getGuestsForSession } from "@/app/actions/guest"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, ClipboardList, Receipt } from "lucide-react"
import RSVPButtons from "./rsvp-buttons"
import AttendanceList from "./attendance-list"
import ExpenseManager from "./expense-manager"
import SessionInfoCard from "./session-info-card"
import MemberActions from "./member-actions"

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getSessionById(resolvedParams.id)
  
  if (!session) notFound()

  const rsvps = await getRSVPsForSession(resolvedParams.id)
  const attendances = await getAttendancesForSession(resolvedParams.id)
  const expenses = await getExpensesForSession(resolvedParams.id)
  const guests = await getGuestsForSession(resolvedParams.id)
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isCreator = user?.id === session.created_by
  const currentUserRSVP = rsvps.find((r: any) => r.user_id === user?.id)
  const goingUsers = rsvps.filter((r: any) => r.status === 'going')
  
  // Chỉ hiển thị cho admin, hoặc hiển thị cho thành viên nếu đã chốt sổ (settled)
  const showExpenses = isCreator || session.status === 'settled'

  return (
    <div className="w-full flex flex-col h-[calc(100dvh-4rem)] overflow-hidden bg-slate-50">
      
      {/* HEADER (Cố định ở trên) */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 sm:px-6 z-10 shadow-sm relative">
        <div className="max-w-3xl mx-auto flex items-center">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" /> Quay lại
          </Link>
        </div>
      </div>

      {/* CONTENT (Khu vực có thể cuộn) */}
      <div className="flex-1 overflow-y-auto w-full">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 space-y-6 pb-8">
          <SessionInfoCard 
            session={session} 
            rsvps={rsvps}
            attendances={attendances}
            guests={guests}
            isCreator={isCreator}
            currentUserId={user?.id || ""}
          />

          <MemberActions
            session={session} 
            rsvps={rsvps}
            attendances={attendances}
            guests={guests}
            isCreator={isCreator}
            currentUserId={user?.id || ""}
          />

          {/* Quản lý Thu Chi */}
          {showExpenses && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-slate-600" /> Quản lý thu chi
                </CardTitle>
                {!isCreator && <CardDescription>Danh sách chi phí được công khai minh bạch</CardDescription>}
              </CardHeader>
              <CardContent className="pt-4 bg-slate-50/50">
                <ExpenseManager 
                  sessionId={session.id} 
                  expenses={expenses} 
                  isCreator={isCreator} 
                  status={session.status} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* FOOTER (Cố định ở dưới) */}
      <div className="shrink-0 bg-white border-t border-slate-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)] pb-[max(env(safe-area-inset-bottom),0px)] z-10 relative">
        <div className="max-w-3xl mx-auto p-4 sm:px-6 flex items-center justify-center">
          <RSVPButtons sessionId={session.id} currentStatus={currentUserRSVP?.status} />
        </div>
      </div>
    </div>
  )
}
