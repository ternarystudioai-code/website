export default function DebuggingGuide() {
  return (
    <article className="prose dark:prose-invert">
      <h1>Debugging Tips</h1>
      <p>
        This guide shares practical tips to debug issues quickly when working with your app and the Dyad runtime.
      </p>
      <h2>General Advice</h2>
      <ul>
        <li>Reproduce the issue in the smallest possible example.</li>
        <li>Check the console and server logs for errors and stack traces.</li>
        <li>Use verbose logging in problem areas to capture context.</li>
      </ul>
      <h2>Electron / App Logs</h2>
      <ul>
        <li>From the app, open Help → Open Logs Folder to inspect recent logs.</li>
        <li>Search for handler names like <code>chat_handlers</code> or <code>template_handlers</code>.</li>
      </ul>
      <h2>Frontend (Vite/Next.js)</h2>
      <ul>
        <li>Use the browser devtools Network tab to validate API calls.</li>
        <li>Confirm environment variables are set correctly.</li>
      </ul>
      <p>
        If you are still stuck, open a discussion or bug report with as much detail as possible.
      </p>
    </article>
  );
}
