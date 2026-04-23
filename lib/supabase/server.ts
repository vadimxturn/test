import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import type { CookieOptions } from "@supabase/ssr"
import type { Database } from "@/lib/types/database"

export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies()

  // createServerClient return type is mismatched against supabase-js@2.104.1 generics
  // due to @supabase/ssr@0.6.1 being built against an older peer. Cast via unknown.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component — cookie mutations are ignored here
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>
}

/** Service-role client — bypasses RLS. Only for server-side email/webhook triggers. */
export function createServiceClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
