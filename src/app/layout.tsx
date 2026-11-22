
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIFE MAP",
  description: "お店の今が、行く前にわかる。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
