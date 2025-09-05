import { CodeTabs } from "@/components/ui/code-tabs";

export default function SelectComponentUpgrade() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Enable Select Component to Edit</h1>
        <p className="text-muted-foreground max-w-prose">
          Install the component tagger Vite plugin so you can select a component in the running app and jump straight to its source in the editor.
        </p>
      </header>

      <section className="space-y-3" id="install">
        <h2 className="text-xl font-semibold">Install</h2>
        <CodeTabs
          tabs={[
            { id: "pnpm", label: "pnpm", code: "pnpm add -D @ternary-sh/react-vite-component-tagger" },
            { id: "npm", label: "npm", code: "npm install --save-dev --legacy-peer-deps @ternary-sh/react-vite-component-tagger" },
            { id: "yarn", label: "yarn", code: "yarn add -D @ternary-sh/react-vite-component-tagger" },
            { id: "bun", label: "bun", code: "bun add -d @ternary-sh/react-vite-component-tagger" },
          ]}
          initialId="pnpm"
        />
      </section>

      <section className="space-y-3" id="configure-vite">
        <h2 className="text-xl font-semibold">Configure Vite</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <p className="text-muted-foreground">
            Add <code>ternaryComponentTagger()</code> to your Vite <code>plugins</code> array and ensure the plugin is imported.
          </p>
        </div>
      </section>
    </article>
  );
}
