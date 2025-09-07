import { NextApiRequest, NextApiResponse } from "next";
// Supabase removed. All user info now comes from LiteLLM only.

// --- Authentication Middleware ---
async function authenticateUser(req: NextApiRequest) {
  // No longer needed. Auth is handled by LiteLLM.
  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
    // Forward request to LiteLLM Proxy /user/info
    const authHeader = req.headers.authorization || "";
    const apiKey = authHeader.replace("Bearer ", "");
    if (!apiKey) {
      throw new Error("No API key provided");
    }
    const proxyRes = await fetch(
      process.env.LITELLM_BASE_URL
        ? `${process.env.LITELLM_BASE_URL}/user/info`
        : "https://litellm-proxy-mirulganteng.azurewebsites.net/user/info",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await proxyRes.json();
    if (!proxyRes.ok) {
      throw new Error(
        data.error?.message || "Failed to fetch user info from LiteLLM"
      );
    }
    res.json(data);
  } catch (error: any) {
    console.error("Error in user info endpoint:", error);
    res.status(401).json({
      error: {
        message: error.message || "Authentication failed",
        type: "authentication_error",
      },
    });
  }
}
