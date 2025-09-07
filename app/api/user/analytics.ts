import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// --- Authentication Middleware ---
async function authenticateUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    throw new Error("No API key provided");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("api_key", token)
    .single();

  if (error || !user) {
    throw new Error("Invalid API key");
  }

  return user;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Always set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Authenticate user
    const user = await authenticateUser(req);

    // Get usage analytics for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usageLogs, error: usageError } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (usageError) {
      console.error("Error fetching usage logs:", usageError);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }

    // Calculate analytics
    const totalRequests = usageLogs?.length || 0;
    const totalTokens =
      usageLogs?.reduce((sum, log) => sum + (log.tokens_used || 0), 0) || 0;
    const totalCost =
      usageLogs?.reduce((sum, log) => sum + (log.cost || 0), 0) || 0;

    // Feature usage breakdown
    const featureUsage = {
      lazy_edits:
        usageLogs?.filter((log) => log.features_used?.lazy_edits).length || 0,
      smart_context:
        usageLogs?.filter((log) => log.features_used?.smart_context).length ||
        0,
      regular:
        usageLogs?.filter(
          (log) =>
            !log.features_used?.lazy_edits && !log.features_used?.smart_context,
        ).length || 0,
    };

    // Model usage breakdown
    const modelUsage =
      usageLogs?.reduce(
        (acc, log) => {
          acc[log.model] = (acc[log.model] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ) || {};

    // Average response time
    const avgResponseTime =
      usageLogs?.length > 0
        ? usageLogs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) /
          usageLogs.length
        : 0;

    res.json({
      analytics: {
        period: "last_30_days",
        total_requests: totalRequests,
        total_tokens: totalTokens,
        total_cost: totalCost,
        feature_usage: featureUsage,
        model_usage: modelUsage,
        avg_response_time_ms: Math.round(avgResponseTime),
        budget_usage_percentage: Math.round(
          (user.spend / user.max_budget) * 100,
        ),
        budget_remaining: user.max_budget - user.spend,
        budget_reset_date: user.budget_reset_at,
      },
    });
  } catch (error: any) {
    console.error("Error in analytics endpoint:", error);
    res.status(401).json({
      error: {
        message: error.message || "Authentication failed",
        type: "authentication_error",
      },
    });
  }
}
