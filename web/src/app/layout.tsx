import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "short.ly — Shorten smarter. Share faster.",
  description:
    "A futuristic, premium URL shortener with click analytics, QR codes, password protection and link expiry.",
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml;utf8," +
          encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
               <defs>
                 <linearGradient id='g' x1='0' y1='0' x2='32' y2='32' gradientUnits='userSpaceOnUse'>
                   <stop offset='0' stop-color='#3b82ff'/>
                   <stop offset='0.55' stop-color='#9b5cff'/>
                   <stop offset='1' stop-color='#00e5ff'/>
                 </linearGradient>
               </defs>
               <rect x='2' y='2' width='28' height='28' rx='8' fill='black'/>
               <path d='M21 11.5a4.5 4.5 0 0 0-4.5-4.5h-3a4.5 4.5 0 0 0 0 9h3' stroke='url(%23g)' stroke-width='2.6' stroke-linecap='round' fill='none'/>
               <path d='M11 20.5a4.5 4.5 0 0 0 4.5 4.5h3a4.5 4.5 0 0 0 0-9h-3' stroke='url(%23g)' stroke-width='2.6' stroke-linecap='round' fill='none'/>
               <circle cx='25' cy='25' r='2.2' fill='url(%23g)'/>
             </svg>`,
          ),
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 pt-20">{children}</main>
            <Toaster
              richColors
              closeButton
              theme="dark"
              position="bottom-right"
              expand
              visibleToasts={3}
              gap={10}
              toastOptions={{
                className: "glass-strong",
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
