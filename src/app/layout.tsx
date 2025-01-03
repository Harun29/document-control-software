import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AiProvider } from "@/context/AiContext";
import { GeneralProvider } from "@/context/GeneralContext";
import AuthenticatedLayout from "@/components/authenticated-layout";
import { Toaster } from "@/components/ui/sonner"
import ChatSupport from "@/components/AIChat";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "DCS",
    template: "DCS | %s",
  },
  description: "Document Control System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GeneralProvider>
            <AiProvider>
              <AuthenticatedLayout>
                {children}
                <Toaster />
                <ChatSupport />
              </AuthenticatedLayout>
            </AiProvider>
          </GeneralProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
