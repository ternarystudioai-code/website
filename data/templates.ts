export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  githubUrl?: string;
  isOfficial: boolean;
  isExperimental?: boolean;
  requiresNeon?: boolean;
}

export const DEFAULT_TEMPLATE_ID = "react";
export const DEFAULT_TEMPLATE: Template = {
  id: "react",
  title: "React.js Template",
  description: "Uses React.js, Vite, Shadcn, Tailwind and TypeScript.",
  imageUrl:
    "https://github.com/user-attachments/assets/5b700eab-b28c-498e-96de-8649b14c16d9",
  isOfficial: true,
};

const PORTAL_MINI_STORE_ID = "portal-mini-store";
export const NEON_TEMPLATE_IDS = new Set<string>([PORTAL_MINI_STORE_ID]);

export const localTemplatesData: Template[] = [
  DEFAULT_TEMPLATE,
  {
    id: "ternarystudio/ternary-nextjs-template",
    title: "Next.js Template",
    description: "Uses Next.js, React.js, Shadcn, Tailwind and TypeScript.",
    imageUrl:
      "https://github.com/user-attachments/assets/96258e4f-abce-4910-a62a-a9dff77965f2",
    githubUrl: "https://github.com/ternarystudio/ternary-nextjs-template",
    isOfficial: true,
  },
  {
    id: "ternarystudio/ternary-template-angular",
    title: "Angular",
    description: "Community template for Angular projects.",
    imageUrl:
      "https://github.com/user-attachments/assets/3d7a1b9d-aaaa-bbbb-cccc-ddddeeeeffff",
    githubUrl: "https://github.com/ternarystudio/ternary-template-angular",
    isOfficial: false,
  },
  {
    id: "ternarystudio/portal-mini-store-template",
    title: "Portal: Mini Store Template",
    description: "Uses Neon DB, Payload CMS, Next.js",
    imageUrl:
      "https://github.com/user-attachments/assets/ed86f322-40bf-4fd5-81dc-3b1d8a16e12b",
    githubUrl: "https://github.com/ternarystudio/portal-mini-store-template",
    isOfficial: true,
    isExperimental: true,
    requiresNeon: true,
  },
];
