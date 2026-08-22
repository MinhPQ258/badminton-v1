"use client"

import { useEffect, useRef } from "react"

export interface ActionSheetItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive"
}

interface ActionSheetProps {
  open: boolean
  onClose: () => void
  items: ActionSheetItem[]
  title?: string
}

export function ActionSheet({ open, onClose, items, title }: ActionSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-[fadeIn_150ms_ease-out]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-md mx-4 mb-[max(env(safe-area-inset-bottom),16px)] animate-[slideUp_200ms_ease-out] z-10"
      >
        {/* Actions group */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-xl border border-border">
          {title && (
            <div className="px-4 py-3 text-center border-b border-border">
              <p className="text-xs text-muted-foreground font-medium">{title}</p>
            </div>
          )}
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick()
                onClose()
              }}
              className={`w-full px-4 py-3.5 text-center text-[15px] font-medium transition-colors flex items-center justify-center gap-2.5
                ${index < items.length - 1 ? "border-b border-border" : ""}
                ${item.variant === "destructive"
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-primary hover:bg-primary/10"
                }
              `}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-2 bg-card rounded-2xl px-4 py-3.5 text-center text-[15px] font-semibold text-foreground hover:bg-secondary transition-colors shadow-xl border border-border"
        >
          Hủy
        </button>
      </div>
    </div>
  )
}
