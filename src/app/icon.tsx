import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 0,
          fontFamily: "sans-serif",
          position: "relative",
          padding: 40,
        }}
      >
        {/* Abstract Weight & Shield Design */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            border: "6px solid #f59e0b",
            position: "relative",
            marginBottom: 24,
            boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Kettlebell / Barbell motif */}
          <div
            style={{
              width: 100,
              height: 40,
              borderRadius: 8,
              border: "5px solid #ffffff",
              position: "absolute",
              top: 50,
            }}
          />
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              border: "8px solid #ffffff",
              position: "absolute",
              bottom: 25,
            }}
          />
          {/* Sparkle */}
          <div
            style={{
              position: "absolute",
              top: 35,
              right: 35,
              width: 20,
              height: 20,
              background: "#f59e0b",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* Text */}
        <div
          style={{
            fontSize: 76,
            fontWeight: "bold",
            color: "#ffffff",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          NSCA
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: "500",
            color: "#f59e0b",
            letterSpacing: "0.2em",
            marginTop: -5,
          }}
        >
          LAB
        </div>

        {/* Decorative Badge */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            padding: "8px 24px",
            background: "rgba(255, 255, 255, 0.15)",
            borderRadius: 9999,
            fontSize: 20,
            color: "#cbd5e1",
            fontWeight: "bold",
            letterSpacing: "0.1em",
          }}
        >
          PASS COMPANION
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
