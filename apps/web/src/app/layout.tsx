import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { SnackbarProvider } from "@/components/ui/Snackbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMS Platform",
  description: "Learn and grow with our comprehensive learning management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 overflow-x-hidden`}>
        <QueryProvider>
          <SnackbarProvider>
            {children}
          </SnackbarProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
