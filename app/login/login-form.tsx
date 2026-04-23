"use client"

import { useActionState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { signInWithMagicLink, signInWithPassword } from "./actions"
import type { ActionResult } from "./actions"

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email"),
})

type PasswordFormValues = z.infer<typeof passwordSchema>
type MagicLinkFormValues = z.infer<typeof magicLinkSchema>

function PasswordForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    signInWithPassword,
    null
  )

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  })

  return (
    <Form {...form}>
      <form action={action} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {state && "error" in state && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  )
}

function MagicLinkForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    signInWithMagicLink,
    null
  )

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  })

  if (state && "success" in state) {
    return (
      <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-sm text-center">
        {state.success}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form action={action} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {state && "error" in state && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending link…" : "Send magic link"}
        </Button>
      </form>
    </Form>
  )
}

export function LoginForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Welcome back</CardTitle>
        <CardDescription>Choose how you'd like to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="password">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="password" className="flex-1">
              Password
            </TabsTrigger>
            <TabsTrigger value="magic" className="flex-1">
              Magic link
            </TabsTrigger>
          </TabsList>
          <TabsContent value="password">
            <PasswordForm />
          </TabsContent>
          <TabsContent value="magic">
            <MagicLinkForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
