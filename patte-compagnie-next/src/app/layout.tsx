import type { Metadata } from "next";
import Header from "@/components/Header";
import './style.css';

export const metadata: Metadata = {
  title: "Patte & Compagnie",
  description: "Tout pour vos animaux",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Header />
        {/* the header logo overflows past the header bar by design; this
            keeps it from covering the top of whatever page comes next */}
        <div style={{ height: 150 }} aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}