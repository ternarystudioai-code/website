export default function MobileAppGuide() {
  return (
    <article className="prose dark:prose-invert">
      <h1>Build a Mobile App with Capacitor</h1>
      <p>
        Use Capacitor to turn your web app into a hybrid mobile app for iOS and Android.
      </p>
      <h2 id="upgrade-your-app">Upgrade Your App</h2>
      <ol>
        <li>Install Capacitor packages: <code>pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android</code></li>
        <li>Initialize: <code>npx cap init "YourApp" "com.example.yourapp" --web-dir=dist</code></li>
        <li>Add platforms: <code>npx cap add ios && npx cap add android</code></li>
      </ol>
      <p>
        After building your web assets, run <code>npx cap sync</code> and open the native projects in Xcode or Android Studio.
      </p>
      <h2 id="troubleshooting">Troubleshooting</h2>
      <ul>
        <li>Ensure Xcode/Android Studio is installed and up to date.</li>
        <li>Run <code>npx cap doctor</code> to diagnose common issues.</li>
        <li>If sync fails, try <code>npx cap clean</code> then <code>npx cap sync</code>.</li>
      </ul>
    </article>
  );
}
