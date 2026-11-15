import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Kinetic UI theme editor";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Theme editor", title: "Make it yours.", description: "Six presets, three seed colours, live contrast checks and CSS export.", accentWord: "yours." });
}
