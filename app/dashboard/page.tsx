"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"

type Profile = {
  id: string
  name?: string | null
  plan?: string | null
  status?: string | null
  current_period_end?: string | null
}

type Order = {
  order_id: string
  amount: number
  currency: string
  plan: string | null
  billing_cycle: string | null
  status: string | null
  paid_at: string | null
  created_at: string | null
}

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

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "billing", label: "Billing" },
  { id: "devices", label: "Devices" },
  { id: "api", label: "API & Tokens" },
  { id: "usage", label: "Usage" },
  { id: "security", label: "Security" },
] as const

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [devices, setDevices] = useState<DeviceRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const scrollTo = (id: string) => {
    const el = sectionRefs.current[id]
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Typed ref setter to avoid returning a value from the ref callback
  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    sectionRefs.current[id] = el
  }

  const refreshDevices = async () => {
    const supabase = getSupabaseBrowser()
    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session) return
    const accessToken = sessionData.session.access_token
    const res = await fetch("/api/devices/list", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return
    const json = await res.json()
    setDevices(json.devices || [])
  }

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    let mounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          router.replace("/login")
          return
        }
        const user = data.session.user
        const { data: profileRows } = await supabase
          .from("profiles")
          .select("id, name, plan, status, current_period_end")
          .eq("id", user.id)
          .limit(1)
        if (mounted) setProfile(profileRows?.[0] || { id: user.id })

        const { data: orderRows } = await supabase
          .from("orders")
          .select(
            "order_id, amount, currency, plan, billing_cycle, status, paid_at, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)
        if (mounted) setOrders(orderRows || [])

        await refreshDevices()
      } catch (e: any) {
        setError(e.message || "Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [router])

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
    await refreshDevices()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="opacity-70">Loading dashboard…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 p-6">
        {/* Sidebar */}
        <aside className="sticky top-4 self-start rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 h-fit">
          <div className="text-sm font-semibold mb-2">Dashboard</div>
          <nav className="space-y-1 text-sm">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-zinc-800/60"
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="space-y-8">
          {/* Overview */}
          <section id="overview" ref={setRef("overview")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-zinc-400">User ID</div>
                <div className="font-mono break-all">{profile?.id}</div>
              </div>
              {profile?.name && (
                <div>
                  <div className="text-zinc-400">Name</div>
                  <div>{profile.name}</div>
                </div>
              )}
              <div>
                <div className="text-zinc-400">Plan</div>
                <div>{profile?.plan ?? "free"}</div>
              </div>
              <div>
                <div className="text-zinc-400">Status</div>
                <div>{profile?.status ?? "inactive"}</div>
              </div>
              <div>
                <div className="text-zinc-400">Current period end</div>
                <div>{profile?.current_period_end ? new Date(profile.current_period_end).toLocaleString() : "-"}</div>
              </div>
            </div>
          </section>

          {/* Billing */}
          <section id="billing" ref={setRef("billing")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Billing</h2>
            {orders.length === 0 ? (
              <div className="text-zinc-400 text-sm">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-zinc-400">
                    <tr>
                      <th className="py-2 pr-4">Order ID</th>
                      <th className="py-2 pr-4">Plan</th>
                      <th className="py-2 pr-4">Cycle</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Paid at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.order_id} className="border-t border-zinc-800">
                        <td className="py-2 pr-4 font-mono break-all">{o.order_id}</td>
                        <td className="py-2 pr-4">{o.plan ?? "-"}</td>
                        <td className="py-2 pr-4">{o.billing_cycle ?? "-"}</td>
                        <td className="py-2 pr-4">{o.amount} {o.currency}</td>
                        <td className="py-2 pr-4">{o.status ?? "-"}</td>
                        <td className="py-2 pr-4">{o.paid_at ? new Date(o.paid_at).toLocaleString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Devices */}
          <section id="devices" ref={setRef("devices")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Devices</h2>
            {devices.length === 0 ? (
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
                    {devices.map((d) => (
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
          </section>

          {/* API & Tokens */}
          <section id="api" ref={setRef("api")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">API & Tokens</h2>
            <div className="text-sm text-zinc-400">Coming soon: create/revoke personal tokens, view scopes.</div>
          </section>

          {/* Usage */}
          <section id="usage" ref={setRef("usage")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Usage</h2>
            <div className="text-sm text-zinc-400">Coming soon: model credits, API calls, recent activity.</div>
          </section>

          {/* Security */}
          <section id="security" ref={setRef("security")} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <div className="text-sm text-zinc-400">Coming soon: login sessions, 2FA, email preferences.</div>
          </section>
        </main>
      </div>
    </div>
  )
}
