import "./globals.css";
import Navbar from "@/components/Layout/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}