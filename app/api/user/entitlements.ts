import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../src/lib/supabase";
import { createClient } from "@supabase/supabase-js";

// Create admin client for user lookup
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface PlanInfo {
  tier: "free" | "pro" | "plus";
  source: string; // e.g., 'default' | 'trial' | 'midtrans' | 'stripe'
  current_period_end?: string;
}

interface Entitlements {
  figma_import: boolean;
  branded_model: boolean;
  premium_templates: boolean;
  workflow_runner: boolean;
  team_features: boolean;
}

interface EntitlementsResponse {
  user: UserProfile;
  plan: PlanInfo;
  entitlements: Entitlements;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EntitlementsResponse | { error: string }>
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session from cookies
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user profile and plan info (fields defined in Supabase migration)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, plan, status, current_period_end")
      .eq("id", session.user.id)
      .single();

    // Determine trial status
    const now = new Date();
    const currentPeriodEnd = profile?.current_period_end
      ? new Date(profile.current_period_end)
      : undefined;
    const isTrialPlan =
      (profile?.plan || "free").toLowerCase() === "free-trial" ||
      (profile?.plan || "free").toLowerCase() === "trial" ||
      (profile?.status || "").toLowerCase().includes("trial");
    const isTrialActive = isTrialPlan && currentPeriodEnd && currentPeriodEnd > now;

    // Compute effective tier and source
    const effectiveTier: "free" | "pro" | "plus" = isTrialActive
      ? "pro"
      : (profile?.plan === "pro" ? "pro" : profile?.plan === "plus" ? "plus" : "free");
    const planSource = isTrialActive ? "trial" : "default";

    const response: EntitlementsResponse = {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || session.user.email!,
      },
      plan: {
        tier: effectiveTier,
        source: planSource,
        current_period_end: profile?.current_period_end,
      },
      entitlements: {
        // Basic entitlements based on effective tier (trial treated as pro)
        figma_import: effectiveTier !== "free",
        branded_model: effectiveTier !== "free",
        premium_templates: effectiveTier !== "free",
        workflow_runner: effectiveTier === "plus",
        team_features: effectiveTier === "plus",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get entitlements error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
