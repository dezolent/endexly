// Minimal root layout for the Payload CMS admin.
// Payload renders its own full-page UI — no global providers or nav here.
import React from "react";

export const metadata = {
  title: "Endexly CMS",
  description: "Content management for Endexly tenant sites.",
};

export default function PayloadRootLayout({
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
