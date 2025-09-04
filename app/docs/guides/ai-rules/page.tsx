export default function AIRulesGuide() {
  return (
    <article className="prose dark:prose-invert">
      <h1>Customizing AI Rules</h1>
      <p>
        You can steer the AI by defining clear rules and providing high quality context. This page explains recommended patterns.
      </p>
      <h2>Project-Level Rules</h2>
      <ul>
        <li>Store canonical rules in your repository and reference them in prompts.</li>
        <li>Keep rules concise and outcome-focused.</li>
      </ul>
      <h2>Chat-Level Guidance</h2>
      <ul>
        <li>Start new chats for distinct tasks to keep the model focused.</li>
        <li>Link to specific files (e.g., <code>src/components/MyWidget.tsx</code>) when asking the model to edit them.</li>
      </ul>
    </article>
  );
}
