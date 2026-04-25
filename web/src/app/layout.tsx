import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "short.ly — A modern URL shortener",
  description: "Shorten URLs, track clicks, generate QR codes. Free and open source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-xs text-muted-foreground">
            short.ly · open source URL shortener · built with FastAPI + Next.js
          </footer>
          <Toaster richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
