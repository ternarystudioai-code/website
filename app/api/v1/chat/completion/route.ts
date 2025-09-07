import { NextRequest, NextResponse } from "next/server";

type RankedFile = { path: string; score: number };

// Lightweight heuristic ranking using last user message keywords and file path/content matches
function rankFilesByRelevance(
  messages: Array<{ role: string; content?: string }>,
  files: Array<{ path: string; content: string }>,
): RankedFile[] {
  const lastUser = [...messages].reverse().find((m) => m?.role === "user");
  const query = (lastUser?.content || "").toLowerCase();
  const qTokens = new Set(
    query
      .split(/[^a-z0-9_]+/i)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && t.length <= 64),
  );

  const scoreFile = (f: { path: string; content: string }): number => {
    const pathLc = f.path.toLowerCase();
    const contentLc = (f.content || "").toLowerCase();
    let score = 0;
    // Path-based boosts
    if (pathLc.includes("src/components")) score += 1.5;
    if (pathLc.includes("src/hooks")) score += 1.0;
    if (pathLc.includes("src/pages")) score += 1.0;
    if (pathLc.endsWith(".spec.ts") || pathLc.endsWith(".test.ts")) score += 0.3;

    // Token overlap in path
    for (const tok of qTokens) {
      if (pathLc.includes(tok)) score += 1.2;
    }
    // Token overlap in content (limited sampling)
    const snippet = contentLc.slice(0, 5000); // avoid heavy compute
    for (const tok of qTokens) {
      if (snippet.includes(tok)) score += 0.4;
    }
    // Exact phrase hints
    if (query && snippet.includes(query)) score += 2.0;
    return score;
    };

  const ranked = files.map((f) => ({ path: f.path, score: scoreFile(f) }));
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

// Allow larger payloads to accommodate Smart Context files
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Simplified configuration: all we need is the LiteLLM endpoint.
const LITELLM_ENDPOINT =
  process.env.LITELLM_BASE_URL || "https://litellm-proxy-mirulganteng.azurewebsites.net";

// Define available models for routing logic using the correct public model names.
const AVAILABLE_MODELS = [
  "gpt-3.5-turbo",
  "gemini/gemini-2.5-pro",
  "gemini/gemini-2.5-flash",
  "openrouter/meta-llama/llama-3-8b-instruct:free",
  "openrouter/mistralai/mistral-7b-instruct:free",
];

// --- Model Aliases and Auto Mode Logic ---
const MODEL_ALIASES: Record<string, string> = {
  // Alias gemini-1.5-pro to the correct gemini-2.5-pro public name
  "gemini-1.5-pro": "gemini/gemini-2.5-pro",
  // Ensure aliases point to the exact public model names
};

function resolveModel(requestedModel: string): string {
  // 1. Direct match
  if (AVAILABLE_MODELS.includes(requestedModel)) {
    return requestedModel;
  }

  // 2. Alias match
  const aliasedModel = MODEL_ALIASES[requestedModel];
  if (aliasedModel && AVAILABLE_MODELS.includes(aliasedModel)) {
    return aliasedModel;
  }

  // 3. Auto mode logic with a clear fallback path
  if (requestedModel === "auto") {
    // Prioritize models for "auto" mode based on the allowed list, using correct public names
    const autoPriority = [
      "gemini/gemini-2.5-pro",
      "gpt-3.5-turbo",
      "gemini/gemini-2.5-flash",
      "openrouter/meta-llama/llama-3-8b-instruct:free",
      "openrouter/mistralai/mistral-7b-instruct:free",
    ];
    for (const model of autoPriority) {
      if (AVAILABLE_MODELS.includes(model)) {
        console.log(`"auto" model resolved to: ${model}`);
        return model;
      }
    }
  }

  // 4. Ultimate fallback: return the first available model as a last resort.
  // This makes the system more resilient if preferred models are removed.
  console.warn(
    `Could not resolve model "${requestedModel}". Falling back to the first available model.`
  );
  return AVAILABLE_MODELS[0];
}

export async function OPTIONS() {
  const headers = new Headers();
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Ternary-Request-Id"
  );
  return new Response(null, { status: 200, headers });
}

export async function POST(req: NextRequest) {
  // Log the requested API endpoint URL
  console.log(
    "[API REQUEST]",
    req.method,
    req.nextUrl?.toString?.() || "(unknown)",
    "from",
    req.headers.get("x-forwarded-for") || "unknown"
  );
  const baseHeaders = new Headers();
  baseHeaders.set("Access-Control-Allow-Origin", "*");
  baseHeaders.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  baseHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Ternary-Request-Id"
  );

  const startTime = Date.now();
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: { message: "No API key provided", type: "authentication_error" } },
        { status: 401, headers: baseHeaders }
      );
    }

    const parsed = (await req.json().catch(() => ({}))) as any;
    const { model: requestedModel = "auto", messages, ...body } = parsed || {};
    // Log the raw payload received by this API
    try {
      const rawSize = Buffer.byteLength(JSON.stringify(parsed || {}), "utf8");
      console.log("[ENGINE] Incoming payload from app", {
        sizeBytes: rawSize,
        payload: parsed,
      });
    } catch {}
    const requestIdHeader = req.headers.get("x-ternary-request-id") || undefined;
    if (requestIdHeader) console.log("[REQUEST-ID]", requestIdHeader);

    // Basic validation for messages
    if (!Array.isArray(messages) || messages.some((m) => !m || !m.role)) {
      return NextResponse.json(
        { error: { message: "Invalid 'messages' format" } },
        { status: 400, headers: baseHeaders }
      );
    }

    // Engine contract: options and files arrive inside body.ternary_options with snake_case keys
    const ternaryOptions = (parsed?.ternary_options ?? {}) as {
      files?: { path: string; content: string }[];
      enable_lazy_edits?: boolean;
      enable_smart_files_context?: boolean;
      // Back-compat: allow camelCase if some client sends it
      enableLazyEdits?: boolean;
      enableSmartFilesContext?: boolean;
    };
    // Prefer snake_case; fallback to camelCase for compatibility
    const enableSmartFilesContext =
      ternaryOptions.enable_smart_files_context ?? ternaryOptions.enableSmartFilesContext ?? false;
    const providedFiles =
      Array.isArray(ternaryOptions.files) && ternaryOptions.files.length > 0
        ? (ternaryOptions.files as { path: string; content: string }[])
        : // ultimate fallback: accept legacy top-level files if present
          (Array.isArray((parsed as any)?.files) ? (parsed as any).files : undefined);

    const modelKey = resolveModel(requestedModel);

    if (!modelKey) {
      return NextResponse.json(
        { error: "Model not found or not available." },
        { status: 400, headers: baseHeaders }
      );
    }

    let finalMessages = messages;
    if (enableSmartFilesContext && providedFiles && providedFiles.length > 0) {
      console.log("Optimizing context with smart files...");
      finalMessages = await optimizeContextWithSmartFiles(messages, providedFiles);

      // Engine directive: ask the model to surface Codebase Context and ranked files
      const ranked = rankFilesByRelevance(messages, providedFiles).slice(0, 8);
      const rankedPaths = ranked.map((r: RankedFile) => r.path);

      const engineDirective = {
        role: "system",
        content:
          `You are integrated inside the Ternary App. When Smart Context is enabled, you MUST:
1) In your <think> section, include a short 'Ranked files' list with scores (path: score), based on the user's request.
2) At the top of your visible answer (right after </think>), output a <ternary-codebase-context files="${rankedPaths.join(", ")}"></ternary-codebase-context> tag listing the selected file paths (comma-separated). Do not explain this tag; just output it.
3) Use Ternary tags (<ternary-write>, <ternary-rename>, <ternary-delete>, <ternary-add-dependency>) for actions.
4) If you reference attachments like TERNARY_ATTACHMENT_X in your reasoning, ensure that when writing files you include their content inside <ternary-write> blocks so they persist.`,
      } as const;

      // Prepend engine directive so it doesn't get truncated by context
      finalMessages = [engineDirective, ...finalMessages];
    }

    // Construct the payload for LiteLLM, passing through all relevant options.
    // Filter unsupported parameters for OpenAI models
    let filteredBody = { ...body };
    const openaiModels = ["gpt-3.5-turbo"]; // Only include gpt-3.5-turbo for filtering
    if (openaiModels.includes(modelKey) && "thinking" in filteredBody) {
      // Drop 'thinking' param for OpenAI models
      const { thinking, ...rest } = filteredBody;
      filteredBody = rest;
    }
    const payload = {
      ...filteredBody,
      model: modelKey, // Ensure the resolved model is used
      messages: finalMessages, // Use the potentially modified messages
    };

    // Log the payload we will forward to the gateway
    try {
      const forwardSize = Buffer.byteLength(JSON.stringify(payload), "utf8");
      console.log("[ENGINE] Forwarding payload to gateway", {
        url: `${LITELLM_ENDPOINT}/chat/completions`,
        sizeBytes: forwardSize,
        payload,
      });
    } catch {}

    // Forward the request to the LiteLLM endpoint
    // Forward request id for tracing if present
    const requestId = req.headers.get("x-ternary-request-id") || undefined;

    const response = await fetch(`${LITELLM_ENDPOINT}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ...(requestId ? { "X-Ternary-Request-Id": requestId } : {}),
      },
      body: JSON.stringify(payload),
    });

    // Prepare response headers
    const outHeaders = new Headers(baseHeaders);
    if (requestId) outHeaders.set("X-Ternary-Request-Id", requestId);
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "content-encoding") {
        try {
          outHeaders.set(key, value);
        } catch {}
      }
    });

    if (body.stream && response.body) {
      // Log streaming response details without consuming body
      console.log("[ENGINE] Gateway response (streaming)", {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });
      // Strengthen SSE streaming behavior
      outHeaders.set("Cache-Control", "no-cache");
      outHeaders.set("Connection", "keep-alive");
      outHeaders.set("X-Accel-Buffering", "no");
      // For streaming responses, return the upstream body directly
      return new Response(response.body, { status: response.status, headers: outHeaders });
    } else {
      // For non-streaming responses, forward upstream body as-is when possible
      const text = await response.text();
      // Log gateway response body (non-streaming)
      console.log("[ENGINE] Gateway response (non-streaming) raw text length", text.length);
      try {
        const data = JSON.parse(text);
        // Log parsed JSON that will be forwarded to the app
        console.log("[ENGINE] Forwarding back to app (non-streaming JSON)", {
          status: response.status,
          ok: response.ok,
          bodySizeBytes: Buffer.byteLength(text, "utf8"),
          body: data,
        });
        // Pass through upstream payload while wrapping minimal metadata
        return NextResponse.json(
          {
            success: response.ok,
            message: response.statusText,
            responseObject: data,
            statusCode: response.status,
          },
          { status: response.status, headers: outHeaders }
        );
      } catch {
        // Upstream did not return JSON; forward raw text
        console.log("[ENGINE] Forwarding back to app (non-streaming TEXT)", {
          status: response.status,
          ok: response.ok,
          bodySizeBytes: Buffer.byteLength(text, "utf8"),
        });
        return new Response(text, { status: response.status, headers: outHeaders });
      }
    }
  } catch (error: any) {
    console.error("Error in chat completions:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message || "Internal server error",
          type: "internal_error",
        },
      },
      { status: 500, headers: baseHeaders }
    );
  }
}

// ✅ Optimized Smart Context function
async function optimizeContextWithSmartFiles(
  messages: any[],
  files: { path: string; content: string }[]
): Promise<any[]> {
  // Smarter trimming: cap number of files and total content size
  const MAX_FILES = 12;
  const MAX_TOTAL_CHARS = 200_000; // ~50k tokens rough upper bound
  const MAX_FILE_CHARS = 25_000;

  const trimmed: { path: string; content: string }[] = [];
  let total = 0;
  for (const f of files.slice(0, MAX_FILES)) {
    let c = f.content ?? "";
    if (c.length > MAX_FILE_CHARS) {
      c = c.slice(0, MAX_FILE_CHARS) + "\n[...TRUNCATED BY ENGINE FOR CONTEXT SIZE...]";
    }
    if (total + c.length > MAX_TOTAL_CHARS) break;
    trimmed.push({ path: f.path, content: c });
    total += c.length;
  }

  const filesContext = trimmed
    .map((file) => `File: ${file.path}\n\n\`\`\`\n${file.content}\n\`\`\`\n`)
    .join("\n---\n");

  const lastUserMessageIndex = messages.findLastIndex((m) => m.role === "user");

  if (lastUserMessageIndex !== -1) {
    const lastUserMessage = messages[lastUserMessageIndex];
    const updatedContent = `The user has provided the following file context. Use this information to inform your response. Do not explicitly mention that you are using this context unless asked.\n\nRelevant Codebase Context:\n${filesContext}\n\n---\n\nUser Request: ${lastUserMessage.content}`;

    const updatedMessages = [...messages];
    updatedMessages[lastUserMessageIndex] = {
      ...lastUserMessage,
      content: updatedContent,
    };
    return updatedMessages;
  } else {
    // Fallback if no user message is found (less likely)
    const systemMessage = {
      role: "system",
      content: `The user has provided the following file context. Use this information to inform your response. Do not explicitly mention that you are using this context unless asked.\n\nRelevant Codebase Context:\n${filesContext}`,
    };
    return [...messages, systemMessage];
  }
}
