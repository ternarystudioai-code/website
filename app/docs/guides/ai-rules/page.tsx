export default function AIRulesGuide() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Customizing AI Rules</h1>
        <p className="text-muted-foreground max-w-prose">
          You can steer the AI by defining clear rules and providing high quality context. This page explains recommended patterns.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Project-Level Rules</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Store canonical rules in your repository and reference them in prompts.</li>
            <li>Keep rules concise and outcome-focused.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Chat-Level Guidance</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Start new chats for distinct tasks to keep the model focused.</li>
            <li>
              Link to specific files (e.g., <code>src/components/MyWidget.tsx</code>) when asking the model to edit them.
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm">
          <div className="font-medium text-foreground mb-1">Tip</div>
          <p className="text-muted-foreground">
            Maintain a short checklist for rules you often reuse to keep prompts consistent across teams.
          </p>
        </div>
      </section>
    </article>
  );
}
