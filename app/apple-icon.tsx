import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: 42,
          overflow: "hidden",
          background:
            "radial-gradient(circle at top left, rgba(255,58,138,0.26), transparent 30%), radial-gradient(circle at bottom right, rgba(34,211,238,0.2), transparent 34%), linear-gradient(150deg, rgba(255,58,138,0.98), rgba(34,211,238,0.62) 56%, rgba(5,5,5,1) 100%)"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: 34,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.36)"
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-end",
            gap: 10
          }}
        >
          <div
            style={{
              width: 14,
              height: 44,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 20px rgba(34,211,238,0.72)"
            }}
          />
          <div
            style={{
              width: 14,
              height: 78,
              borderRadius: 999,
              background: "#ffffff",
              boxShadow: "0 0 20px rgba(255,255,255,0.6)"
            }}
          />
          <div
            style={{
              width: 14,
              height: 100,
              borderRadius: 999,
              background: "#ff4fa3",
              boxShadow: "0 0 22px rgba(255,79,163,0.78)"
            }}
          />
          <div
            style={{
              width: 14,
              height: 62,
              borderRadius: 999,
              background: "#22d3ee",
              boxShadow: "0 0 20px rgba(34,211,238,0.72)"
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
