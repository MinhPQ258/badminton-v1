import { Users } from "lucide-react"

export default function MembersPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-semibold text-foreground">Thành viên</h1>
        </div>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <Users className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Quản lý thành viên</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Tính năng đang được phát triển. Bạn sẽ sớm có thể xem và quản lý danh sách thành viên cố định tại đây.
        </p>
      </div>
    </div>
  )
}
