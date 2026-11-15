import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Kinetic UI components";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Components", title: "Every component, live.", description: "Forms, editors, data, AI, collaboration, media and more, each with a live preview.", accentWord: "live" });
}
