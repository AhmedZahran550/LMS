"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/70 dark:bg-black/50 border-b border-black/5 dark:border-white/10"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl leading-none">L</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LMS Platform</span>
      </div>
      <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
        <Link href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</Link>
        <Link href="#testimonials" className="hover:text-slate-900 dark:hover:text-white transition-colors">Testimonials</Link>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-slate-900 dark:text-white hover:opacity-80 transition-opacity">
          Log in
        </Link>
        <Link href="/register" className="px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
          Get Started
        </Link>
      </div>
    </motion.nav>
  );
}
