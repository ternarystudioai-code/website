"use client"

import { useEffect, useMemo, useState } from "react"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

type DeviceRow = {
  id: string
  name: string | null
  platform: string | null
  last_seen_at: string | null
  created_at: string | null
  updated_at: string | null
  token: {
    revoked_at?: string | null
    last_used_at?: string | null
    created_at?: string | null
  } | null
}

export default function DevicesPage() {
  const [rows, setRows] = useState<DeviceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    try {
      const supabase = getSupabaseBrowser()
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        window.location.href = "/login"
        return
      }
      const accessToken = sessionData.session.access_token
      const res = await fetch("/api/devices/list", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to load")
      setRows(json.devices || [])
    } catch (e: any) {
      console.error(e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const revoke = async (device_id: string) => {
    if (!confirm("Revoke this device's token?")) return
    const supabase = getSupabaseBrowser()
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) return
    const accessToken = sessionData.session.access_token
    const res = await fetch("/api/devices/revoke", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ device_id }),
    })
    if (!res.ok) {
      const text = await res.text()
      alert(text)
      return
    }
    await refresh()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Devices</h1>
        {loading ? (
          <div className="text-sm text-zinc-400">Loading…</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : rows.length === 0 ? (
          <div className="text-sm text-zinc-400">No devices linked.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-zinc-400">
                <tr>
                  <th className="py-2 pr-4">Device</th>
                  <th className="py-2 pr-4">Platform</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2 pr-4">Last used</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id} className="border-t border-zinc-800">
                    <td className="py-2 pr-4">{d.name || d.id}</td>
                    <td className="py-2 pr-4">{d.platform || "-"}</td>
                    <td className="py-2 pr-4">{d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-4">{d.token?.last_used_at ? new Date(d.token.last_used_at).toLocaleString() : "-"}</td>
                    <td className="py-2 pr-4">{d.token?.revoked_at ? "revoked" : "active"}</td>
                    <td className="py-2 pr-4">
                      <Button size="sm" variant="secondary" disabled={!!d.token?.revoked_at} onClick={() => revoke(d.id)}>
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
