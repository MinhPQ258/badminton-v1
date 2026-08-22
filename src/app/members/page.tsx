import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getMembersAction } from "@/app/actions/member"
import MemberListClient from "./member-list-client"

export default async function MembersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Lấy role của user hiện tại
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const currentUserRole = profile?.role || "member"

  // Fetch danh sách thành viên
  const result = await getMembersAction()
  const members = result.success && result.data ? result.data : []

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground">Thành viên</h1>
        </div>
      </header>

      <div className="flex-1">
        <MemberListClient
          members={members}
          currentUserRole={currentUserRole}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
