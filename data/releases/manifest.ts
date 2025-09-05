export type ReleaseMeta = {
  version: string;
  title: string;
  subtitle: string;
  slug: string;
  component: string; // module path used for dynamic import
};

export const releases: ReleaseMeta[] = [
  {
    version: "1.0.0-stable.1",
    title: "1.0.0-stable.1 Version",
    subtitle: "First release of ternary with all mvp working features",
    slug: "1.0.0-stable.1",
    component: "@/data/releases/components/1.0.0-stable.1",
  },
];
