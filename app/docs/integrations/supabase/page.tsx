export default function SupabaseIntegrationPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Supabase Integration</h1>
      <p>
        Connect your app to Supabase for authentication, database, and storage.
      </p>
      <h2 id="setup">Setup</h2>
      <ol>
        <li>Create a project in Supabase and note your project URL.</li>
        <li>Generate a service role key and a public anon key as needed.</li>
        <li>Configure environment variables in your app.</li>
      </ol>
      <h2 id="no-publishable-keys">No publishable keys</h2>
      <p>
        If no publishable keys are found for your project, verify you are connected to the correct Supabase account and project.
        Ensure your API keys are created and that your user has sufficient permissions.
      </p>
    </article>
  );
}
