import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Management System",
  description: "Learning management system for students and teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
