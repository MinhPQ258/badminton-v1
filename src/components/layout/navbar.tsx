import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { logoutAction } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import UserMenu from "@/components/user-menu"

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-blue-600">
            🏸 Badminton Club
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium text-slate-700 hover:text-blue-600">
              Trang chủ
            </Link>
            <Link href="/sessions" className="text-sm font-medium text-slate-700 hover:text-blue-600">
              Buổi đánh
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu userName={user.user_metadata?.full_name || user.email || "Khách"} />
        </div>
      </div>
    </header>
  )
}
