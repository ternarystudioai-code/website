export default function GitHubIntegrationPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">GitHub Integration</h1>
        <p className="text-muted-foreground max-w-prose">
          Connect your app to a GitHub repository to sync code changes and manage versions.
        </p>
      </header>

      <section className="space-y-3" id="setup">
        <h2 className="text-xl font-semibold">Setup</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Start the GitHub device flow from within the app.</li>
            <li>Authorize access in your browser.</li>
            <li>Select or create a repository and branch.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-3" id="troubleshooting">
        <h2 className="text-xl font-semibold">Troubleshooting</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>If you see push rejected or non-fast-forward errors, pull the latest changes or force push only if necessary.</li>
            <li>Ensure your token has required repo scopes.</li>
            <li>Verify the selected branch exists and you have push access.</li>
          </ul>
        </div>
      </section>
    </article>
  );
}
