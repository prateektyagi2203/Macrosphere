import React from "react";
import "./globals.css";

export const metadata = {
  title: "MacroSphere — India Macro Engine",
  description: "AI-powered India macro allocation engine for retail investors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary antialiased">{children}</body>
    </html>
  );
}
