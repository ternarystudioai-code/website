export default function PrivacyPolicyPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground max-w-prose">
          This is a placeholder privacy policy for your migrated documentation site. Customize this page with your real policy text.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What we collect</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <p className="text-muted-foreground">
            Describe what telemetry or analytics you collect and how you handle user data.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Opt in and opt out</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <p className="text-muted-foreground">
            Explain how users can opt-in or opt-out of telemetry and what the default is.
          </p>
        </div>
      </section>
    </article>
  );
}
