export default function NodeJsHelpPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Node.js Troubleshooting</h1>
      <p>
        If Node.js is not detected or you encounter issues during installation, try the steps below.
      </p>
      <h2>Install or update Node.js</h2>
      <ul>
        <li>Download the latest LTS from the official website.</li>
        <li>After installing, restart your terminal and the app.</li>
        <li>Ensure your PATH includes the Node.js binary directory.</li>
      </ul>
      <h2>Verify installation</h2>
      <pre><code>node -v
npm -v</code></pre>
      <p>
        If the commands above fail, restart your machine and try again.
      </p>
    </article>
  );
}
