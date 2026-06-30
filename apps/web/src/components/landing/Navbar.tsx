"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { t } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`w-full top-0 sticky z-50 transition-all duration-300 ${isScrolled ? 'bg-slate-50/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <nav className="flex justify-between items-center px-6 py-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            {t('app.name')}
          </Link>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1 text-base">
              {t('Home')}
            </Link>
            <Link href="/courses" className="text-slate-600 hover:text-indigo-600 transition-colors text-base">
              {t('Courses')}
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-indigo-600 transition-colors text-base">
              {t('About Us')}
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link href="/login" className="hidden sm:block text-slate-600 hover:text-indigo-600 transition-colors font-medium px-4 py-2">
            {t('Log in')}
          </Link>
          <Link href="/register" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all active:scale-95">
            {t('Get Started')}
          </Link>
        </div>
      </nav>
    </header>
  );
}
