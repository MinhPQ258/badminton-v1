import Link from "next/link"
import { ChevronLeft, Users } from "lucide-react"

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center h-14 px-4">
          <Link href="/" className="text-slate-500 hover:text-slate-800 p-1 -ml-1">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-800 ml-2">Thành viên</h1>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <Users className="h-10 w-10 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Quản lý thành viên</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Tính năng đang được phát triển. Bạn sẽ sớm có thể xem và quản lý danh sách thành viên cố định tại đây.
        </p>
      </div>
    </div>
  )
}
