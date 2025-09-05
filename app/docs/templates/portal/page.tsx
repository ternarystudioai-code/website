export default function PortalTemplateDocsPage() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Portal Template</h1>
        <p className="text-muted-foreground max-w-prose">
          Use the Portal template to scaffold a full-stack app with database migrations.
        </p>
      </header>

      <section className="space-y-3" id="create-a-database-migration">
        <h2 className="text-xl font-semibold">Create a database migration</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Make schema changes in your Prisma schema or SQL files.</li>
            <li>Run your migration generator script or use the in-app migration action.</li>
            <li>Commit the generated migration.</li>
          </ol>
        </div>
      </section>
    </article>
  );
}
