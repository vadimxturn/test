"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const magicLinkSchema = z.object({
  email: z.string().email(),
})

export type ActionResult = { error: string } | { success: string }

export async function signInWithPassword(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }

  redirect("/")
}

export async function signInWithMagicLink(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") })

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) return { error: error.message }

  return { success: "Check your email — a magic link is on its way." }
}
