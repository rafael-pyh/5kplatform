import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import "./globals.css";

export const metadata: Metadata = {
  title: "5K Energia Solar - Plataforma Administrativa",
  description: "Sistema de gestão de vendedores e leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="page-gradient">
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
