import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/sign-out-button"

export default async function ClientPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "client") redirect("/admin")

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Client Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.full_name ?? user.email}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-muted-foreground">
          Client dashboard — full UI coming in Step 6.
        </p>
      </main>
    </div>
  )
}
