import { ImageResponse } from "next/og";

export const alt = "Cloud Patterns, a field guide to resilient cloud design";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0e1729",
          backgroundImage:
            "linear-gradient(rgba(139,183,242,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,183,242,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          color: "#e4eaf2",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, color: "#8bb7f2" }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#f2b04a" }} />
          Cloud Patterns
        </div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.02, maxWidth: 950 }}>
          Design for the day something breaks.
        </div>
        <div style={{ fontSize: 30, color: "#9fb0c8" }}>
          14 patterns · live diagrams · AWS, Azure and Google Cloud services
        </div>
      </div>
    ),
    size,
  );
}
