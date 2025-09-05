export default function AiRateLimitHelpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Rate Limit Troubleshooting</h1>
        <p className="text-muted-foreground max-w-prose">
          Steps to resolve rate limit errors and reduce request spikes.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Common fixes</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Wait a few minutes and retry your request.</li>
            <li>Reduce request frequency or batch requests.</li>
            <li>Switch to a different model or provider with higher quotas.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Provider specific guidance</h2>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="font-medium text-foreground mb-1">Check provider dashboards</div>
          <p className="text-muted-foreground">
            Consult your AI provider's dashboard for current quota status and limits. Verify model selection and tokens-per-minute caps.
          </p>
        </div>
      </section>
    </article>
  );
}
