export default function DebuggingGuide() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Debugging Tips</h1>
        <p className="text-muted-foreground max-w-prose">
          Practical techniques to isolate and resolve issues quickly when working with your app and the Ternary runtime.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">General Advice</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Reproduce the issue in the smallest possible example.</li>
            <li>Check the console and server logs for errors and stack traces.</li>
            <li>Use verbose logging in problem areas to capture context.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Electron / App Logs</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>From the app, open Help → Open Logs Folder to inspect recent logs.</li>
            <li>
              Search for handler names like <code>chat_handlers</code> or <code>template_handlers</code>.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Frontend (Vite/Next.js)</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Use the browser devtools Network tab to validate API calls.</li>
            <li>Confirm environment variables are set correctly.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="font-medium text-foreground mb-1">Need help?</div>
          <p className="text-muted-foreground">Open a discussion or bug report with reproduction steps and logs.</p>
        </div>
      </section>
    </article>
  );
}
