export default function SupabaseIntegrationPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Supabase Integration</h1>
        <p className="text-muted-foreground max-w-prose">
          Connect your app to Supabase for authentication, database, and storage.
        </p>
      </header>

      <section className="space-y-3" id="setup">
        <h2 className="text-xl font-semibold">Setup</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Create a project in Supabase and note your project URL.</li>
            <li>Generate a service role key and a public anon key as needed.</li>
            <li>Configure environment variables in your app.</li>
          </ol>
        </div>
      </section>

      <section className="space-y-3" id="no-publishable-keys">
        <h2 className="text-xl font-semibold">No publishable keys</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <p className="text-muted-foreground">
            If no publishable keys are found for your project, verify you are connected to the correct Supabase account and project.
            Ensure your API keys are created and that your user has sufficient permissions.
          </p>
        </div>
      </section>
    </article>
  );
}
