import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Getting started with Kinetic UI";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Getting started", title: "Install in a minute.", description: "Use the npm packages or copy the source with the Kinetic CLI. Same code either way.", accentWord: "minute" });
}
