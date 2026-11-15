import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Kinetic UI: components that move";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Open source · React · Tailwind v4", title: "Components that move.", description: "Motion-first React components and blocks for Next.js. Install from npm or copy the code with one command.", accentWord: "move" });
}
