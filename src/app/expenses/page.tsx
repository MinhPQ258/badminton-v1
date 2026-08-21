import { Receipt } from "lucide-react"

export default function ExpensesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-slate-800">Quỹ & Chi phí</h1>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-amber-100 p-4 rounded-full mb-4">
          <Receipt className="h-10 w-10 text-amber-600" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Quản lý quỹ nhóm</h2>
        <p className="text-slate-500 text-sm max-w-xs">
          Tính năng đang được phát triển. Tại đây sẽ hiển thị tổng số tiền quỹ, các khoản thu chi và lịch sử đóng tiền.
        </p>
      </div>
    </div>
  )
}
