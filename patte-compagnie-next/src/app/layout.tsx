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
        {children}
      </body>
    </html>
  );
}