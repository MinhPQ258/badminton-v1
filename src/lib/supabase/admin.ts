import { createClient } from '@supabase/supabase-js'

// CẢNH BÁO: Client này bypass RLS. Chỉ dùng trong server-side code.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
