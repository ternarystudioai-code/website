export type OS = "windows" | "mac" | "linux";
export type Arch = "arm64" | "x64" | null;

export function detectPlatform(): { os: OS | null; arch: Arch } {
  if (typeof navigator === "undefined") return { os: null, arch: null };
  const ua = navigator.userAgent.toLowerCase();
  const platform = (navigator.platform || "").toLowerCase();

  let os: OS | null = null;
  if (ua.includes("windows")) os = "windows";
  else if (ua.includes("mac os") || ua.includes("macintosh") || platform.includes("mac")) os = "mac";
  else if (ua.includes("linux")) os = "linux";

  let arch: Arch = null;
  if (ua.includes("arm64") || ua.includes("aarch64") || ua.includes("apple silicon")) arch = "arm64";
  else if (ua.includes("x86_64") || ua.includes("win64") || ua.includes("x64") || ua.includes("amd64")) arch = "x64";

  return { os, arch };
}

export type Asset = {
  id: number;
  name: string;
  size: number;
  content_type: string;
  download_url: string;
};

export type Release = {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  assets: Asset[];
};

export function formatBytes(bytes: number) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function matchesName(name: string, needles: string[]) {
  const lower = name.toLowerCase();
  return needles.some((n) => lower.includes(n));
}

export function pickAssetForPlatform(release: Release, os: OS | null, arch: Arch): Asset | null {
  if (!release || !release.assets || !os) return null;
  const assets = release.assets;

  if (os === "windows") {
    // Prefer .exe or .msi for Windows
    const preferred = assets.find((a) => /\.exe$/i.test(a.name));
    if (preferred) return preferred;
    const msi = assets.find((a) => /\.msi$/i.test(a.name));
    if (msi) return msi;
  }

  if (os === "mac") {
    // Prefer dmg, then zip. Consider arch hints.
    const candidates = assets.filter((a) => /\.(dmg|zip)$/i.test(a.name));
    if (arch === "arm64") {
      const arm = candidates.find((a) => matchesName(a.name, ["arm64", "aarch64", "apple-silicon", "apple"]));
      if (arm) return arm;
    }
    if (arch === "x64") {
      const x64 = candidates.find((a) => matchesName(a.name, ["x64", "amd64", "intel"]));
      if (x64) return x64;
    }
    // fallback
    if (candidates[0]) return candidates[0];
  }

  if (os === "linux") {
    // Prefer AppImage, then .deb, then .rpm, then .tar.gz
    const appImage = assets.find((a) => /\.appimage$/i.test(a.name));
    if (appImage) return appImage;
    const deb = assets.find((a) => /\.deb$/i.test(a.name));
    if (deb) return deb;
    const rpm = assets.find((a) => /\.rpm$/i.test(a.name));
    if (rpm) return rpm;
    const targz = assets.find((a) => /\.tar\.gz$/i.test(a.name));
    if (targz) return targz;
  }

  return assets[0] ?? null;
}
