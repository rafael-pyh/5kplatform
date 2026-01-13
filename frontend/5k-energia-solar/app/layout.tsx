import type { Metadata, Viewport } from "next";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import "./globals.css";

export const metadata: Metadata = {
  title: "5K Energia Solar - Plataforma Administrativa",
  description: "Sistema de gestão de vendedores e leads",
  applicationName: "5K Energia Solar",
  authors: [{ name: "5K Energia Solar" }],
  manifest: "/manifest.json",
  keywords: ["energia solar", "vendedores", "leads", "gestão"],
  openGraph: {
    title: "5K Energia Solar",
    description: "Plataforma administrativa de gestão de vendedores e leads",
    type: "website",
    images: [
      {
        url: "/5klogo.png",
        width: 512,
        height: 512,
        alt: "5K Energia Solar",
      },
    ],
  },
  icons: {
    icon: "/5klogo.ico",
    apple: "/5klogo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a202c" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="5K Solar" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1a202c" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>
      <body>
        <div className="page-gradient">
          <ServiceWorkerRegister />
          <PWAInstallPrompt />
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
