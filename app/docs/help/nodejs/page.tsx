export default function NodeJsHelpPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Node.js Troubleshooting</h1>
        <p className="text-muted-foreground max-w-prose">
          If Node.js is not detected or you encounter issues during installation, try the steps below.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Install or update Node.js</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Download the latest LTS from the official website.</li>
            <li>After installing, restart your terminal and the app.</li>
            <li>Ensure your PATH includes the Node.js binary directory.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Verify installation</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <pre className="text-sm overflow-x-auto"><code>node -v
npm -v</code></pre>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <p className="text-muted-foreground">
            If the commands above fail, restart your machine and try again.
          </p>
        </div>
      </section>
    </article>
  );
}
