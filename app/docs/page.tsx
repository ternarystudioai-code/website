export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-4">Documentation</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to the Ternary documentation. Navigate through the sidebar to explore different sections.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Getting Started</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Check out the releases section to see what's new in each version of Ternary.
        </p>
      </div>
    </div>
  );
}
