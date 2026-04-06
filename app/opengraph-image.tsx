import { ImageResponse } from "next/og";
import { siteConfig } from "../lib/site";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(255,55,145,0.32), transparent 28%), radial-gradient(circle at bottom right, rgba(34,211,238,0.22), transparent 30%), linear-gradient(140deg, #040404 0%, #14041e 46%, #3d0a36 100%)",
          color: "white",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 36,
            background: "rgba(255,255,255,0.04)"
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "64px 72px",
            zIndex: 1
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 68,
                width: 68,
                overflow: "hidden",
                borderRadius: 22,
                border: "1px solid rgba(255,255,255,0.12)",
                background:
                  "linear-gradient(145deg, rgba(255,58,138,0.98), rgba(34,211,238,0.58) 58%, rgba(5,5,5,1) 100%)",
                boxShadow: "0 18px 50px rgba(0,0,0,0.35)"
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 8,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.34)"
                }}
              />
              <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 4 }}>
                <div
                  style={{
                    height: 16,
                    width: 6,
                    borderRadius: 999,
                    background: "#22d3ee",
                    boxShadow: "0 0 12px rgba(34,211,238,0.7)"
                  }}
                />
                <div
                  style={{
                    height: 28,
                    width: 6,
                    borderRadius: 999,
                    background: "#ffffff",
                    boxShadow: "0 0 12px rgba(255,255,255,0.65)"
                  }}
                />
                <div
                  style={{
                    height: 36,
                    width: 6,
                    borderRadius: 999,
                    background: "#ff4fa3",
                    boxShadow: "0 0 14px rgba(255,79,163,0.75)"
                  }}
                />
                <div
                  style={{
                    height: 22,
                    width: 6,
                    borderRadius: 999,
                    background: "#22d3ee",
                    boxShadow: "0 0 12px rgba(34,211,238,0.7)"
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 24,
                letterSpacing: "0.4em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)"
              }}
            >
              {siteConfig.name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 760 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                lineHeight: 0.92,
                letterSpacing: "-0.05em"
              }}
            >
              Your TikTok habits, turned into a wrapped-style deck.
            </div>
            <div
              style={{
                fontSize: 32,
                lineHeight: 1.4,
                color: "rgba(255,255,255,0.78)"
              }}
            >
              Upload your export. Get replay patterns, watch tempo, search themes,
              and social behavior in one full-screen experience.
            </div>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {["Replay heatmaps", "Search themes", "Share-ready deck"].map((label, index) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.24)",
                  fontSize: 24,
                  color: "rgba(255,255,255,0.9)"
                }}
              >
                <div
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: 999,
                    background: index === 1 ? "#22d3ee" : index === 2 ? "#1ed760" : "#ff3f8f"
                  }}
                />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 84,
            top: 118,
            display: "flex",
            flexDirection: "column",
            gap: 18
          }}
        >
          {[0.82, 0.64, 0.94, 0.58].map((intensity, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 10,
                padding: "20px 24px",
                borderRadius: 28,
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)"
              }}
            >
              {[26, 46, 64, 38].map((height, barIndex) => (
                <div
                  key={`${index}-${barIndex}`}
                  style={{
                    width: 12,
                    height: Math.round(height * intensity),
                    borderRadius: 999,
                    background:
                      barIndex % 2 === 0
                        ? "linear-gradient(180deg, #22d3ee, rgba(34,211,238,0.5))"
                        : "linear-gradient(180deg, #ff4fa3, rgba(255,79,163,0.55))"
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
