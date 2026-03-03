import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import StoreInitializer from "@/components/StoreInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop POC Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <StoreInitializer />
          <Header />
          <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {children}
          </main>
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
