export function getBaseUrlFromHeaders(host?: string) {
  const envBase = process.env.NEXT_PUBLIC_BASE_URL;
  if (envBase) return envBase.replace(/\/$/, "");
  const h = host || "localhost:3000";
  const proto = h.startsWith("localhost") ? "http" : "https";
  return `${proto}://${h}`;
}

export async function generateLiteLLMKey({
  plan,
  emailOrUserId,
  key_alias,
}: {
  plan: string;
  emailOrUserId: string;
  key_alias?: string;
}) {
  const userId = (emailOrUserId || "user")
    .toString()
    .replace(/[^a-zA-Z0-9_-]/g, "_");
  const alias = key_alias || `pro-user-${userId}`;

  const payload: any = {
    user_id: userId,
    key_alias: alias,
    models: [],
    max_budget: 0,
    metadata: { userId, plan },
    rpm_limit: 0,
    tpm_limit: 0,
    budget_duration: "30d",
    max_parallel_requests: 20,
  };

  if (plan === "hobby") {
    payload.max_budget = 100;
    payload.rpm_limit = 60;
    payload.tpm_limit = 1000;
  } else if (plan === "pro") {
    payload.max_budget = 15;
    payload.rpm_limit = 30;
    payload.tpm_limit = 75000;
  } else if (plan === "team") {
    payload.max_budget = 60;
    payload.rpm_limit = 75;
    payload.tpm_limit = 200000;
  } else {
    throw new Error("Invalid plan");
  }

  const resp = await fetch(
    "https://litellm-proxy-mirulganteng.azurewebsites.net/key/generate",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LITELLM_ADMIN_KEY ?? ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || !data?.key) {
    throw new Error(
      `Failed to generate API key: ${resp.status} ${JSON.stringify(data)}`,
    );
  }
  return data.key as string;
}
