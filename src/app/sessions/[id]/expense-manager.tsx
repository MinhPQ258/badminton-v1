"use client"

import { useState, useTransition, useRef, useOptimistic } from "react"
import { addExpenseAction, deleteExpenseAction, settleSessionAction, recalculateCostAction } from "@/app/actions/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, CheckCircle, Receipt, X } from "lucide-react"

export default function ExpenseManager({ 
  sessionId, 
  expenses, 
  isCreator,
  status,
  canSettle = false
}: { 
  sessionId: string, 
  expenses: any[],
  isCreator: boolean,
  status: string,
  canSettle?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  const isSettled = status === 'settled'

  // Cấu hình Optimistic UI cho danh sách khoản chi
  const [optimisticExpenses, addOptimisticExpense] = useOptimistic(
    expenses,
    (state, action: { type: 'add' | 'delete', payload: any }) => {
      if (action.type === 'add') {
        return [...state, { ...action.payload, id: `temp-${Date.now()}`, created_at: new Date().toISOString() }]
      }
      if (action.type === 'delete') {
        return state.filter(e => e.id !== action.payload)
      }
      return state
    }
  )
  
  const handleAddExpense = (formData: FormData) => {
    setError(null)
    const label = formData.get("label") as string
    const amountStr = formData.get("amount") as string
    const amount = parseInt(amountStr.replace(/[^0-9]/g, ''), 10)
    
    if (!label || isNaN(amount)) return;

    // Đóng modal và reset form ngay lập tức cho mượt
    closeModal()
    formRef.current?.reset()

    startTransition(async () => {
      // 1. Cập nhật UI ngay lập tức
      addOptimisticExpense({ type: 'add', payload: { label, amount, session_id: sessionId } })
      
      // 2. Gửi request lên server
      const result = await addExpenseAction(formData)
      if (!result?.success) {
        setError(result?.error || "Lỗi")
        openModal() // Mở lại nếu lỗi
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa khoản chi này? Hệ thống sẽ tự tính lại tiền chia.")) {
      startTransition(async () => {
        addOptimisticExpense({ type: 'delete', payload: id })
        const result = await deleteExpenseAction(id, sessionId)
        if (!result?.success) setError(result?.error || "Lỗi")
      })
    }
  }

  const openModal = () => {
    dialogRef.current?.showModal()
  }

  const closeModal = () => {
    dialogRef.current?.close()
  }

  const handleSettle = () => {
    if (confirm("Chốt sổ sẽ khóa buổi đánh: Không cho thêm chi phí. Tuy nhiên, nếu điểm danh nhầm bạn vẫn có thể tính lại. Bạn có chắc chắn?")) {
      startTransition(async () => {
        const result = await settleSessionAction(sessionId)
        if (!result?.success) setError(result?.error || "Lỗi")
      })
    }
  }

  const handleRecalculate = () => {
    if (confirm("Hệ thống sẽ tính lại số tiền chia đều dựa trên danh sách điểm danh và các khoản chi hiện tại. Bạn có chắc chắn?")) {
      startTransition(async () => {
        const result = await recalculateCostAction(sessionId)
        if (!result?.success) setError(result?.error || "Lỗi")
        else alert("Đã tính toán lại thành công!")
      })
    }
  }

  const totalCost = optimisticExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      
      {/* Header controls for Admin */}
      {isCreator && !isSettled && (
        <div className="flex justify-between items-center pb-2 border-b border-border">
          <span className="text-sm text-muted-foreground font-medium">Danh sách các khoản chi</span>
          <Button onClick={openModal} size="sm" variant="secondary" className="hover:bg-secondary/80">
            <Plus className="h-4 w-4 mr-1" /> Thêm khoản chi
          </Button>
        </div>
      )}

      {/* Danh sách chi phí */}
      {optimisticExpenses.length > 0 ? (
        <div className="space-y-2 mt-2">
          {optimisticExpenses.map((expense) => (
            <div key={expense.id} className={`flex justify-between items-center p-3 bg-card rounded-lg border border-border shadow-sm transition-all hover:border-border ${expense.id.toString().startsWith('temp') ? 'opacity-70' : ''}`}>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{expense.label}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(expense.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-foreground">{expense.amount.toLocaleString('vi-VN')} đ</span>
                {isCreator && !isSettled && (
                  <button 
                    type="button"
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center p-3 bg-blue-900 rounded-lg font-bold text-white border border-blue-800 mt-2 transition-all">
            <span>Tổng cộng:</span>
            <span>{totalCost.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      ) : (
          <div className="p-8 mt-2 text-center text-sm text-muted-foreground bg-secondary rounded-lg border border-dashed border-border">
            <Receipt className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            Chưa có khoản chi phí nào được ghi nhận.
          </div>
      )}

      {/* Modal / Popup thêm chi phí */}
      <dialog 
        ref={dialogRef}
        className="p-0 bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm m-auto rounded-xl w-full max-w-sm overflow-hidden"
      >
        <div className="bg-card flex flex-col w-full">
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h3 className="font-semibold text-lg text-foreground">Thêm khoản chi</h3>
            <button onClick={closeModal} className="text-muted-foreground hover:text-muted-foreground bg-secondary hover:bg-secondary p-1 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form action={handleAddExpense} ref={formRef} className="p-4 space-y-4">
            <input type="hidden" name="session_id" value={sessionId} />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Tên khoản chi</label>
              <Input name="label" placeholder="VD: Tiền sân, Tiền cầu..." required autoFocus className="bg-secondary focus:bg-card" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Số tiền (VNĐ)</label>
              <Input name="amount" type="number" placeholder="VD: 200000" required className="bg-secondary focus:bg-card text-lg font-medium" />
            </div>
            
            <div className="pt-2 flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                Hủy
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Nút chốt sổ */}
      {isCreator && optimisticExpenses.length > 0 && !isSettled && (
        <div className="pt-4 border-t border-border mt-4">
          <Button 
            onClick={handleSettle}
            disabled={isPending || !canSettle}
            className="w-full bg-blue-600 hover:bg-blue-700 font-medium py-6 rounded-xl shadow-sm hover:shadow transition-all disabled:bg-muted disabled:text-muted-foreground"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isPending ? "Đang xử lý..." : (!canSettle ? "Chưa đến thời gian chốt sổ" : "Chốt sổ & Tính tiền")}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            * Sau khi chốt sổ, hệ thống sẽ chia đều tiền cho số người thực tế có mặt.
          </p>
        </div>
      )}

      {/* Nút Tính lại chi phí */}
      {isCreator && isSettled && (
        <div className="pt-4 border-t border-border mt-4">
          <Button 
            onClick={handleRecalculate}
            disabled={isPending}
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-6 rounded-xl transition-all disabled:opacity-50"
          >
            <Receipt className="h-5 w-5 mr-2" />
            {isPending ? "Đang tính lại..." : "Tính toán lại chi phí"}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            * Dùng chức năng này khi bạn lỡ điểm danh nhầm và muốn cập nhật lại bảng chia tiền.
          </p>
        </div>
      )}
    </div>
  )
}
