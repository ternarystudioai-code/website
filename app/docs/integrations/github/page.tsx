export default function GitHubIntegrationPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>GitHub Integration</h1>
      <p>
        Connect your app to a GitHub repository to sync code changes and manage versions.
      </p>
      <h2 id="setup">Setup</h2>
      <ol>
        <li>Start the GitHub device flow from within the app.</li>
        <li>Authorize access in your browser.</li>
        <li>Select or create a repository and branch.</li>
      </ol>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>If you see push rejected or non-fast-forward errors, pull the latest changes or force push only if necessary.</li>
        <li>Ensure your token has required repo scopes.</li>
        <li>Verify the selected branch exists and you have push access.</li>
      </ul>
    </article>
  );
}
