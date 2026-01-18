import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Management",
  description: "Fullstack Rust + Next.js App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
