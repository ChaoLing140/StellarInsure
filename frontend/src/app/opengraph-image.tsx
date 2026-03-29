import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "linear-gradient(140deg, #0f243f 0%, #1f7a8c 45%, #f4d35e 100%)",
          color: "#f7f7f7",
          fontFamily: "Arial, sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            width: "88px",
            height: "88px",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.2)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          SI
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "28px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            StellarInsure
          </div>
          <div
            style={{
              fontSize: "66px",
              lineHeight: 1.02,
              maxWidth: "880px",
              fontWeight: 700,
            }}
          >
            Parametric Insurance With Transparent, Wallet-Native Claims
          </div>
          <div
            style={{
              fontSize: "30px",
              opacity: 0.92,
            }}
          >
            Create policies. Choose oracle sources. Share completion receipts.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
