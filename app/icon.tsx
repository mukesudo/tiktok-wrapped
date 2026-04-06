import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 64,
  height: 64
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background:
            "linear-gradient(145deg, rgba(255,58,138,0.98), rgba(34,211,238,0.58) 58%, rgba(5,5,5,1) 100%)"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            padding: 10,
            borderRadius: 16,
            background: "rgba(0,0,0,0.34)",
            border: "1px solid rgba(255,255,255,0.12)"
          }}
        >
          <div
            style={{
              width: 6,
              height: 16,
              borderRadius: 999,
              background: "#22d3ee"
            }}
          />
          <div
            style={{
              width: 6,
              height: 28,
              borderRadius: 999,
              background: "#ffffff"
            }}
          />
          <div
            style={{
              width: 6,
              height: 36,
              borderRadius: 999,
              background: "#ff4fa3"
            }}
          />
          <div
            style={{
              width: 6,
              height: 22,
              borderRadius: 999,
              background: "#22d3ee"
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
