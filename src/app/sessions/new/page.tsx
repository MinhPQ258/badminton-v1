"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createSessionAction } from "@/app/actions/session"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, Clock, MapPin, ArrowLeft } from "lucide-react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Set default start time to today at 18:00
  const defaultStartDate = new Date()
  defaultStartDate.setHours(18, 0, 0, 0)
  
  const [startTime, setStartTime] = useState<Date | null>(defaultStartDate)
  
  // End time defaults to 2 hours after start time
  const getEndTime = (start: Date | null) => {
    if (!start) return null
    const d = new Date(start)
    d.setHours(d.getHours() + 2)
    return d
  }
  
  const [endTime, setEndTime] = useState<Date | null>(getEndTime(defaultStartDate))
  const [location, setLocation] = useState("")

  const handleStartTimeChange = (date: Date | null) => {
    setStartTime(date)
    if (date) {
      setEndTime(getEndTime(date))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    
    // Convert dates back to local ISO string format that the action expects
    const formatLocalISO = (d: Date | null) => {
      if (!d) return ""
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }
    
    formData.append("start_time", formatLocalISO(startTime))
    formData.append("end_time", formatLocalISO(endTime))
    formData.append("location", location)

    const result = await createSessionAction(formData)
    
    if (!result?.success) {
      setError(result?.error || "Đã xảy ra lỗi")
      setLoading(false)
    } else if (result.data) {
      router.push(`/sessions/${result.data.id}`)
      router.refresh()
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại trang chủ
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Tạo buổi đánh mới
          </CardTitle>
          <CardDescription>
            Lên lịch cho một buổi đánh cầu lông. Bạn sẽ là người tổ chức của buổi này.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="start_time">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Thời gian bắt đầu
                </label>
                <DatePicker
                  id="start_time"
                  selected={startTime}
                  onChange={handleStartTimeChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Giờ"
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="end_time">
                  <Clock className="h-4 w-4 text-muted-foreground" /> Thời gian kết thúc
                </label>
                <DatePicker
                  id="end_time"
                  selected={endTime}
                  onChange={(date: Date | null) => setEndTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="Giờ"
                  dateFormat="dd/MM/yyyy HH:mm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Mặc định kéo dài 2 tiếng</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex items-center gap-2" htmlFor="location">
                <MapPin className="h-4 w-4 text-muted-foreground" /> Địa điểm sân
              </label>
              <Input
                id="location"
                name="location"
                type="text"
                placeholder="VD: Sân Cầu Lông Viettel, Sân số 2"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t pt-6">
            <Link href="/">
              <Button variant="outline" type="button">Hủy</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo buổi đánh"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
