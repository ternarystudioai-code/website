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
  source: string;
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

    // Get user profile and plan info
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    // Default to free plan if no profile or error
    const planTier = profile?.plan_tier || "free";
    const planSource = profile?.plan_source || "default";

    const response: EntitlementsResponse = {
      user: {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.full_name || session.user.email!,
      },
      plan: {
        tier: planTier,
        source: planSource,
        current_period_end: profile?.current_period_end,
      },
      entitlements: {
        // Basic entitlements based on plan
        figma_import: planTier !== "free",
        branded_model: planTier !== "free",
        premium_templates: planTier !== "free",
        workflow_runner: planTier === "plus",
        team_features: planTier === "plus",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Get entitlements error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
