"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

export default function LinkVerifyPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"checking"|"ready"|"redirecting"|"error">("checking")
  const [error, setError] = useState<string|undefined>()

  const code = useMemo(() => sp.get("code") || "", [sp])

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setStatus("redirecting")
        const q = new URLSearchParams({ from: "app", verify: "1", code })
        router.push(`/login?${q.toString()}`)
      } else {
        setStatus("ready")
      }
    }).catch((e) => {
      console.error(e)
      setError("Failed to check session")
      setStatus("error")
    })
  }, [code, router])

  const approve = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        const q = new URLSearchParams({ from: "app", verify: "1", code })
        router.push(`/login?${q.toString()}`)
        return
      }
      const accessToken = sessionData.session.access_token
      const res = await fetch("/api/link/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      const json = await res.json()
      // Show a small confirmation
      alert("Device linked. You can return to the app.")
      console.log(json)
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to confirm link")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-2xl font-bold mb-2">Verify device link</h1>
        <p className="text-sm text-zinc-400 mb-4">Code: <span className="font-mono">{code}</span></p>
        {status === "ready" && (
          <Button className="w-full" onClick={approve}>Approve</Button>
        )}
        {status === "checking" && <div className="text-sm text-zinc-400">Checking session…</div>}
        {status === "redirecting" && <div className="text-sm text-zinc-400">Redirecting to login…</div>}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>
    </div>
  )
}
