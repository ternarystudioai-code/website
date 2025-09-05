export default function RoadmapPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Roadmap</h1>
        <p className="text-muted-foreground max-w-prose">
          Here's a high-level look at what we're building next. Timelines are tentative and subject to change.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Near Term</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Improved update flow and release channels.</li>
            <li>Additional starter templates.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Future</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Deeper mobile support and device integrations.</li>
            <li>Enhanced observability for AI prompts and outputs.</li>
          </ul>
        </div>
      </section>
    </article>
  );
}
