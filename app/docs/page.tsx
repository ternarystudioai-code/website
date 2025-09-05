export default function DocsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
        <p className="text-base text-muted-foreground max-w-prose">
          Welcome to the Ternary docs. Use the sidebar to browse sections, or jump into the most helpful areas below.
        </p>
      </header>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="/docs/guides/debugging"
          className="group rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4 transition-colors hover:bg-muted/40"
        >
          <div className="mb-1 text-sm font-medium text-muted-foreground">Guide</div>
          <h3 className="text-lg font-semibold group-hover:text-foreground">Debugging</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Learn recommended workflows and tools for diagnosing issues quickly.
          </p>
        </a>

        <a
          href="/docs/releases"
          className="group rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4 transition-colors hover:bg-muted/40"
        >
          <div className="mb-1 text-sm font-medium text-muted-foreground">Releases</div>
          <h3 className="text-lg font-semibold group-hover:text-foreground">What’s New</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse version highlights and detailed changelogs.
          </p>
        </a>
      </section>

      {/* Getting Started blurb */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <p className="text-muted-foreground max-w-prose">
          Start with guides for setup, then explore templates and integrations to accelerate your workflow.
        </p>
      </section>
    </div>
  );
}
