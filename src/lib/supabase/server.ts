import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '../../../types/supabase'

export async function createClient() {
  // Bản Next 15+ trở lên là cookieStore phải có await nhé
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Cái catch này để bỏ qua lỗi nếu hàm này bị gọi từ Server Component 
            // (vì Server Component không có quyền set cookie, chỉ có Route Handler/Actions mới set được)
          }
        },
      },
    }
  )
}
