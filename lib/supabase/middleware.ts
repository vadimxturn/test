import { createServerClient } from "@supabase/ssr"
import { type SupabaseClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"
import type { CookieOptions } from "@supabase/ssr"
import type { Database } from "@/lib/types/database"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  // See lib/supabase/server.ts for explanation of the `unknown` cast
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  ) as unknown as SupabaseClient<Database>

  // Must use getUser() (not getSession()) — validates token with Supabase server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")

  if (!user && !isPublicPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = "/login"
    return NextResponse.redirect(loginUrl)
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const role = profile?.role

    // Redirect away from login if already authenticated
    if (pathname === "/login" || pathname === "/") {
      const dest = request.nextUrl.clone()
      dest.pathname = role === "admin" ? "/admin" : "/client"
      return NextResponse.redirect(dest)
    }

    // Enforce role boundaries
    if (role === "client" && pathname.startsWith("/admin")) {
      const dest = request.nextUrl.clone()
      dest.pathname = "/client"
      return NextResponse.redirect(dest)
    }

    if (role === "admin" && pathname.startsWith("/client")) {
      const dest = request.nextUrl.clone()
      dest.pathname = "/admin"
      return NextResponse.redirect(dest)
    }
  }

  return response
}
