"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { logoutAction } from "@/app/actions/auth"
import {
  Moon, Sun, ChevronRight, Lock, LogOut, User,
} from "lucide-react"
import ProfileEditModal from "./profile-edit-modal"
import ChangePasswordModal from "./change-password-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface SettingsClientProps {
  user: {
    fullName: string
    username: string
    email: string
  }
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showProfileEdit, setShowProfileEdit] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => setMounted(true), [])

  const handleLogout = async () => {
    setLoggingOut(true)
    const form = document.createElement("form")
    form.method = "POST"
    form.action = ""
    // Using server action directly
    await logoutAction()
  }

  // Avatar gradient từ chữ cái đầu
  const initial = user.fullName.charAt(0).toUpperCase()

  return (
    <>
      <div className="min-h-screen bg-secondary flex flex-col transition-colors duration-300">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-center h-14 px-4">
            <h1 className="text-lg font-semibold text-foreground">Cài đặt</h1>
          </div>
        </header>

        <div className="flex-1 p-4 max-w-md mx-auto w-full space-y-6">
          
          {/* Section: Thông tin cá nhân */}
          <div>
            <button
              onClick={() => setShowProfileEdit(true)}
              className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 hover:bg-card/80 transition-colors text-left"
            >
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary via-emerald-400 to-cyan-400 flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0 shadow-lg shadow-primary/20">
                {initial}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-base truncate">{user.fullName}</p>
                <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </button>
          </div>

          {/* Section: Tài khoản */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-4">
              Tài khoản
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setShowChangePassword(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/60 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="flex-1 text-[15px] font-medium text-foreground">Đổi mật khẩu</span>
                <ChevronRight className="w-4.5 h-4.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Section: Giao diện */}
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 ml-4">
              Giao diện
            </h2>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  theme === 'dark' 
                    ? 'bg-indigo-500/15 text-indigo-400' 
                    : 'bg-amber-500/15 text-amber-500'
                }`}>
                  {mounted && theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-medium text-foreground">Chế độ tối</span>
                </div>
                {mounted && (
                  <button
                    type="button"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-[28px] w-[50px] flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card ${
                      theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                    role="switch"
                    aria-checked={theme === 'dark'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-[2px] ${
                        theme === 'dark' ? 'translate-x-[24px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section: Đăng xuất */}
          <div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-destructive/5 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="flex-1 text-[15px] font-medium text-destructive">Đăng xuất</span>
              </button>
            </div>
          </div>

          {/* App version */}
          <p className="text-center text-xs text-muted-foreground/50 pt-4 pb-8">
            Badminton Club v0.1.0
          </p>
        </div>
      </div>

      {/* Modals */}
      <ProfileEditModal
        open={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        currentFullName={user.fullName}
      />
      <ChangePasswordModal
        open={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?"
        confirmText="Đăng xuất"
        variant="destructive"
        loading={loggingOut}
      />
    </>
  )
}
