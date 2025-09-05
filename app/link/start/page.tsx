"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

export default function LinkStartPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"checking"|"ready"|"redirecting"|"error">("checking")
  const [error, setError] = useState<string|undefined>()

  const params = useMemo(() => {
    const state = sp.get("state") || crypto.randomUUID()
    const return_uri = sp.get("return_uri") || "ternary://link/callback"
    const device_name = sp.get("device_name") || undefined
    const platform = sp.get("platform") || undefined
    const app_version = sp.get("app_version") || undefined
    return { state, return_uri, device_name, platform, app_version }
  }, [sp])

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setStatus("redirecting")
        const q = new URLSearchParams({ from: "app", return_uri: params.return_uri, state: params.state })
        router.push(`/login?${q.toString()}`)
      } else {
        setStatus("ready")
      }
    }).catch((e) => {
      console.error(e)
      setError("Failed to check session")
      setStatus("error")
    })
  }, [params.return_uri, params.state, router])

  const approve = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        const q = new URLSearchParams({ from: "app", return_uri: params.return_uri, state: params.state })
        router.push(`/login?${q.toString()}`)
        return
      }
      const accessToken = sessionData.session.access_token
      const res = await fetch("/api/link/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(params),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      // API will respond with a JSON containing redirect, we navigate there (deeplink)
      const json = await res.json()
      if (json.redirect) {
        window.location.href = json.redirect as string
      }
    } catch (e: any) {
      console.error(e)
      setError(e.message || "Failed to approve link")
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h1 className="text-2xl font-bold mb-2">Link this device</h1>
        <p className="text-sm text-zinc-400 mb-4">Approve to link this device to your account.</p>
        <div className="text-sm text-zinc-300 space-y-1 mb-4">
          <div><span className="text-zinc-500">State:</span> {params.state}</div>
          {params.device_name && <div><span className="text-zinc-500">Device:</span> {params.device_name}</div>}
          {params.platform && <div><span className="text-zinc-500">Platform:</span> {params.platform}</div>}
          {params.app_version && <div><span className="text-zinc-500">App:</span> {params.app_version}</div>}
          <div><span className="text-zinc-500">Return to app:</span> {params.return_uri}</div>
        </div>
        {status === "ready" && (
          <Button className="w-full" onClick={approve}>Approve and return to app</Button>
        )}
        {status === "checking" && <div className="text-sm text-zinc-400">Checking session…</div>}
        {status === "redirecting" && <div className="text-sm text-zinc-400">Redirecting to login…</div>}
        {error && <div className="mt-3 text-sm text-red-400">{error}</div>}
      </div>
    </div>
  )
}
