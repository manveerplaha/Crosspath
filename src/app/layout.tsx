import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://manveerplar.com"),
  title: "Manveer Plaha | CrossPath Portfolio",
  description:
    "An interactive portfolio exploring AI, robotics, software, and technology.",
  openGraph: {
    title: "Manveer Plaha | CrossPath Portfolio",
    description:
      "An interactive portfolio exploring AI, robotics, software, and technology.",
    url: "https://manveerplar.com",
    siteName: "Manveer Plaha",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Manveer Plaha Portfolio",
      },
    ],
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b1020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Pixel display face + a clean body face. Self-host these in /public/fonts
            and swap to next/font if you need to avoid a runtime Google Fonts request. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="font-body"
        style={
          {
            "--font-pixel": "'Press Start 2P', monospace",
            "--font-body": "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
