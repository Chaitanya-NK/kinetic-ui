import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Kinetic UI icons";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Icons", title: "348 original icons.", description: "24 px stroke icons drawn on one grid. Tree-shakable React components.", accentWord: "original" });
}
