declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: any) => void
          onPending?: (result: any) => void
          onError?: (error: any) => void
          onClose?: () => void
        }
      ) => void
    }
  }
}

let snapLoaded = false

function getBaseSnapUrl(env?: string) {
  return env === "production"
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com"
}

export async function loadSnapScript(clientKey: string, env?: string): Promise<void> {
  if (snapLoaded && window.snap) return

  const base = getBaseSnapUrl(env || process.env.NEXT_PUBLIC_MIDTRANS_ENV)
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = `${base}/snap/snap.js`
    script.async = true
    script.setAttribute("data-client-key", clientKey)
    script.onload = () => {
      snapLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error("Failed to load Midtrans snap.js"))
    document.head.appendChild(script)
  })
}

export type SnapCheckoutInput = {
  amount: number
  items?: Array<{ id?: string; price: number; quantity: number; name: string }>
  customer?: {
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
  }
  metadata?: Record<string, any>
}

export async function startSnapCheckout(input: SnapCheckoutInput) {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
  const env = process.env.NEXT_PUBLIC_MIDTRANS_ENV || "sandbox"

  if (!clientKey) throw new Error("Missing NEXT_PUBLIC_MIDTRANS_CLIENT_KEY")

  await loadSnapScript(clientKey, env)

  const res = await fetch("/api/payments/midtrans/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create transaction failed: ${text}`)
  }

  const json = await res.json()
  const token: string | undefined = json?.token
  if (!token) throw new Error("No token returned from server")

  window.snap?.pay(token, {
    onSuccess: (result) => {
      console.log("Midtrans success", result)
    },
    onPending: (result) => {
      console.log("Midtrans pending", result)
    },
    onError: (error) => {
      console.error("Midtrans error", error)
      alert("Payment failed. Please try again.")
    },
    onClose: () => {
      console.warn("Midtrans popup closed without completing payment")
    },
  })
}
