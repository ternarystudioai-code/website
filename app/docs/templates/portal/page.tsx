export default function PortalTemplateDocsPage() {
  return (
    <article className="prose dark:prose-invert max-w-none">
      <h1>Portal Template</h1>
      <p>
        Use the Portal template to scaffold a full-stack app with database migrations.
      </p>
      <h2 id="create-a-database-migration">Create a database migration</h2>
      <ol>
        <li>Make schema changes in your Prisma schema or SQL files.</li>
        <li>Run your migration generator script or use the in-app migration action.</li>
        <li>Commit the generated migration.</li>
      </ol>
    </article>
  );
}
