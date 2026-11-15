import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const alt = "Kinetic UI blocks";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return ogImage({ kicker: "Blocks", title: "Whole screens, not just buttons.", description: "Dashboards, pricing, billing, blogs, checkout and more. Copy one in and make it yours.", accentWord: "screens," });
}
