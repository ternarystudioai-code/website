export type ReleaseMeta = {
  version: string;
  title: string;
  subtitle: string;
  slug: string;
  component: string; // module path used for dynamic import
};

export const releases: ReleaseMeta[] = [
  {
    version: "0.19.0-beta-1",
    title: "0.19.0 Beta 1",
    subtitle: "Beta release with experimental features",
    slug: "0.19.0-beta-1",
    component: "@/data/releases/components/0.19.0-beta-1",
  },
  {
    version: "0.19.0",
    title: "0.19.0",
    subtitle: "Experimental Docker support and new community templates",
    slug: "0.19.0",
    component: "@/data/releases/components/0.19.0",
  },
];
