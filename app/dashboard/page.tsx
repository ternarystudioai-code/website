"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase-browser"

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

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    let mounted = true

    async function init() {
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

      setLoading(false)
    }

    init()
    return () => {
      mounted = false
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="opacity-70">Loading dashboard…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-xl font-semibold mb-4">Profile</h2>
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

        <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
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
      </div>
    </div>
  )
}
