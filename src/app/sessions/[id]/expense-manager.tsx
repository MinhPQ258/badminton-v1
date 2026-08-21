"use client"

import { useState, useTransition, useRef, useOptimistic } from "react"
import { addExpenseAction, deleteExpenseAction, settleSessionAction } from "@/app/actions/expense"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus, CheckCircle, Receipt, X } from "lucide-react"

export default function ExpenseManager({ 
  sessionId, 
  expenses, 
  isCreator,
  status 
}: { 
  sessionId: string, 
  expenses: any[],
  isCreator: boolean,
  status: string
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
      if (result?.error) {
        setError(result.error)
        openModal() // Mở lại nếu lỗi
      }
    })
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa khoản chi này? Hệ thống sẽ tự tính lại tiền chia.")) {
      startTransition(async () => {
        addOptimisticExpense({ type: 'delete', payload: id })
        const result = await deleteExpenseAction(id, sessionId)
        if (result?.error) setError(result.error)
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
    if (confirm("Chốt sổ sẽ khóa buổi đánh: Không cho thêm chi phí, không cho sửa điểm danh nữa. Bạn có chắc chắn?")) {
      startTransition(async () => {
        const result = await settleSessionAction(sessionId)
        if (result?.error) setError(result.error)
      })
    }
  }

  const totalCost = optimisticExpenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-4">
      {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}
      
      {/* Header controls for Admin */}
      {isCreator && !isSettled && (
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <span className="text-sm text-slate-500 font-medium">Danh sách các khoản chi</span>
          <Button onClick={openModal} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> Thêm khoản chi
          </Button>
        </div>
      )}

      {/* Danh sách chi phí */}
      {optimisticExpenses.length > 0 ? (
        <div className="space-y-2 mt-2">
          {optimisticExpenses.map((expense) => (
            <div key={expense.id} className={`flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-slate-300 ${expense.id.toString().startsWith('temp') ? 'opacity-70' : ''}`}>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800">{expense.label}</span>
                <span className="text-xs text-slate-500">
                  {new Date(expense.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-900">{expense.amount.toLocaleString('vi-VN')} đ</span>
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
          <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-lg font-bold text-blue-900 border border-blue-100 mt-2 transition-all">
            <span>Tổng cộng:</span>
            <span>{totalCost.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      ) : (
          <div className="p-8 mt-2 text-center text-sm text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <Receipt className="h-8 w-8 mx-auto text-slate-300 mb-2 opacity-50" />
            Chưa có khoản chi phí nào được ghi nhận.
          </div>
      )}

      {/* Modal / Popup thêm chi phí */}
      <dialog 
        ref={dialogRef}
        className="p-0 bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm m-auto rounded-xl w-full max-w-sm overflow-hidden"
      >
        <div className="bg-white flex flex-col w-full">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <h3 className="font-semibold text-lg text-slate-800">Thêm khoản chi</h3>
            <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form action={handleAddExpense} ref={formRef} className="p-4 space-y-4">
            <input type="hidden" name="session_id" value={sessionId} />
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tên khoản chi</label>
              <Input name="label" placeholder="VD: Tiền sân, Tiền cầu..." required autoFocus className="bg-slate-50 focus:bg-white" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Số tiền (VNĐ)</label>
              <Input name="amount" type="number" placeholder="VD: 200000" required className="bg-slate-50 focus:bg-white text-lg font-medium" />
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
        <div className="pt-4 border-t border-slate-200 mt-4">
          <Button 
            onClick={handleSettle}
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 font-medium py-6 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {isPending ? "Đang xử lý..." : "Chốt sổ & Tính tiền"}
          </Button>
          <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
            * Sau khi chốt sổ, hệ thống sẽ chia đều tiền cho số người thực tế có mặt. Không thể thêm sửa xóa chi phí nữa.
          </p>
        </div>
      )}
    </div>
  )
}
