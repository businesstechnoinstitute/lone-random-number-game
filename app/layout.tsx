import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guessing Auction",
  description: "Win an exclusive item by guessing the closest number",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
