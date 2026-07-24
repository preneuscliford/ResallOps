import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResallOps Radar",
  description: "Radar d'opportunites iPhone pour achat, reconditionnement et revente.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
