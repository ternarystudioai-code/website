export default function MobileAppGuide() {
  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Build a Mobile App with Capacitor</h1>
        <p className="text-muted-foreground max-w-prose">
          Use Capacitor to turn your web app into a hybrid mobile app for iOS and Android.
        </p>
      </header>

      <section className="space-y-3" id="upgrade-your-app">
        <h2 className="text-xl font-semibold">Upgrade Your App</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>Install Capacitor packages: <code>pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android</code></li>
            <li>Initialize: <code>npx cap init "YourApp" "com.example.yourapp" --web-dir=dist</code></li>
            <li>Add platforms: <code>npx cap add ios && npx cap add android</code></li>
          </ol>
          <p className="mt-3 text-sm text-muted-foreground">
            After building your web assets, run <code>npx cap sync</code> and open the native projects in Xcode or Android Studio.
          </p>
        </div>
      </section>

      <section className="space-y-3" id="troubleshooting">
        <h2 className="text-xl font-semibold">Troubleshooting</h2>
        <div className="rounded-xl border border-border/60 bg-background/60 backdrop-blur p-4">
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li>Ensure Xcode/Android Studio is installed and up to date.</li>
            <li>Run <code>npx cap doctor</code> to diagnose common issues.</li>
            <li>If sync fails, try <code>npx cap clean</code> then <code>npx cap sync</code>.</li>
          </ul>
        </div>
      </section>
    </article>
  );
}
