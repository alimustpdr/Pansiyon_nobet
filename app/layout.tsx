import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pansiyon Nöbet Sistemi",
  description: "MEB Pansiyon Nöbet Dağıtım Uygulaması",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="bg-gray-50 text-gray-900 min-h-screen font-sans">
        <nav className="bg-indigo-900 text-white shadow-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Pansiyon Nöbet</h1>
            <div className="space-x-6">
              <Link href="/" className="hover:text-indigo-200">Panel</Link>
              <Link href="/teachers" className="hover:text-indigo-200">Öğretmenler</Link>
              <Link href="/settings" className="hover:text-indigo-200">Ayarlar</Link>
              <Link href="/schedule" className="bg-indigo-700 px-4 py-2 rounded hover:bg-indigo-600 transition">
                Nöbet Yaz
              </Link>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
