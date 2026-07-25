import "./globals.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import type { Metadata } from "next";
import Providers from "@/shared/config/theme/Providers";

export const metadata: Metadata = {
  title: "QR Badge Tizimi — Boshqaruv paneli",
  description:
    "Akkreditatsiya, zona kirish nazorati va ovqatlanish monitoringi — admin panel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      style={
        {
          "--font-display": "'Outfit', 'Space Grotesk', sans-serif",
          "--font-body": "'Inter', sans-serif",
          "--font-mono": "'IBM Plex Mono', monospace",
        } as React.CSSProperties
      }
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
