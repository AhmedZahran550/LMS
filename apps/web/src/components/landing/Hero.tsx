"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-500/20 dark:bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/20 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8 border border-violet-200 dark:border-violet-500/20"
        >
          <span className="flex h-2 w-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
          Platform Version 2.0 is now live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mb-6"
        >
          Master any skill with our{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
            next-generation
          </span>{" "}
          learning platform.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mb-10"
        >
          Empower your future with interactive courses, real-time progress tracking, and an engaging community of learners.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xl hover:scale-105 transition-transform"
          >
            Start Learning Free <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-black text-slate-900 dark:text-white font-semibold border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
            <PlayCircle className="w-5 h-5" /> Watch Demo
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="w-full mt-20 relative perspective-[2000px]"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent dark:from-[#0a0a0a] z-10" />
          <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden bg-slate-100 dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10 transform-gpu rotate-x-12 scale-95 hover:rotate-x-0 hover:scale-100 transition-all duration-700 ease-out origin-bottom">
            <Image
              src="/hero-mockup.png"
              alt="LMS Dashboard Mockup"
              width={1200}
              height={800}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
