export default function SelectComponentUpgrade() {
  return (
    <article className="prose dark:prose-invert">
      <h1>Enable Select Component to Edit</h1>
      <p>
        This upgrade installs the component tagger Vite plugin so you can select a component in the running app and jump straight to its source in the editor.
      </p>
      <h2>Install</h2>
      <pre><code>pnpm add -D @dyad-sh/react-vite-component-tagger
# or
npm install --save-dev --legacy-peer-deps @dyad-sh/react-vite-component-tagger</code></pre>
      <h2>Configure Vite</h2>
      <p>
        Add <code>dyadComponentTagger()</code> to your Vite <code>plugins</code> array and ensure the plugin is imported.
      </p>
    </article>
  );
}
