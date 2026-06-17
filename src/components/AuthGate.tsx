import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { addSubscription } from "@/lib/storage"
import type { Session } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

async function migrateLocalStorage() {
  const raw = localStorage.getItem("subscriptions")
  if (!raw) return
  try {
    const subs = JSON.parse(raw)
    if (!Array.isArray(subs)) return
    for (const s of subs) {
      await addSubscription({
        id: s.id ?? crypto.randomUUID(),
        name: s.name,
        price: s.price,
        billingCycle: s.billingCycle,
        billingDay: s.billingDay,
        billingMonth: s.billingMonth,
        paymentMethod: s.paymentMethod,
        category: s.category,
        createdAt: s.createdAt ?? new Date().toISOString(),
      })
    }
    localStorage.removeItem("subscriptions")
  } catch {
  }
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [dismissed, setDismissed] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signedUp, setSignedUp] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  if (session || dismissed) return <>{children}</>

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setSubmitting(true)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) { setAuthError(error.message); return }
        await migrateLocalStorage()
        setSignedUp(true)
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setAuthError(error.message); return }
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (signedUp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <button
            type="button"
            className="text-sm underline text-foreground"
            onClick={() => { setSignedUp(false); setMode("signin") }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center">Subscription Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {authError && (
            <p className="text-sm text-destructive">{authError}</p>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground">
          {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
          <button
            type="button"
            className="underline text-foreground"
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setAuthError(null) }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
        <p className="text-sm text-center text-muted-foreground">
          <button
            type="button"
            className="underline"
            onClick={() => setDismissed(true)}
          >
            Continue without signing in
          </button>
        </p>
      </div>
    </div>
  )
}
