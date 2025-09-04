export default function AiRateLimitHelpPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>AI Rate Limit Troubleshooting</h1>
      <p>
        If you encounter rate limit errors, try the following steps.
      </p>
      <h2>Common fixes</h2>
      <ul>
        <li>Wait a few minutes and retry your request.</li>
        <li>Reduce request frequency or batch requests.</li>
        <li>Switch to a different model or provider with higher quotas.</li>
      </ul>
      <h2>Provider specific guidance</h2>
      <p>
        Consult your AI provider's dashboard for current quota status and limits.
      </p>
    </article>
  );
}
