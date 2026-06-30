import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "manara",
  description: "Administrative control panel for manara",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("i18next")?.value?.substring(0, 2) === "en" ? "en" : "ar";
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900`}>
        <I18nProvider lang={lang}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
