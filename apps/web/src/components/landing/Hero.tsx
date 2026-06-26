"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ShaderBackground from './ShaderBackground';
import ThreeJsBackground from './ThreeJsBackground';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[921px] flex items-center overflow-hidden">
      <ShaderBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(249,249,255,1)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(17,24,39,1)_100%)]" />
      
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-5xl md:text-[48px] font-bold text-slate-900 leading-tight mb-6 tracking-tight">
            {t('Your future')} <span className="text-indigo-600 underline decoration-cyan-300 dark:decoration-cyan-600 decoration-4 underline-offset-8">{t('starts here')}</span>
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
            {t('Discover thousands of certified courses taught by industry experts. Develop your skills and launch your career with total confidence on the EduPro learning platform.')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/courses"
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-indigo-600/20 transition-all active:scale-95"
            >
              {t('Browse Paths')}
            </Link>
            <button className="bg-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg border border-slate-300 hover:bg-slate-300 transition-all active:scale-95 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              {t('How it works?')}
            </button>
          </div>
          
          <div className="mt-12 flex items-center gap-4 text-slate-600">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              <img
                className="w-10 h-10 rounded-full border-2 border-slate-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2zPmPzXVK-tzZLYMaV0vgtTDOijqcd87OLkuq5bMr6Zc3-YcIqgstDdVsovKa-fOCDDhLY-1jKNXUWn0IksshArifBTkZamZbWucNsF_DHn-vK3tb1YMjov_kM9AmrYgxCl2EoGsj6s-3ecS8eoC4m2o29X8IuAUpVnEcnPSJYfTAKKNPeh3DwYYZYID_B2sOmCPCxmcFgatEAw5JhFVv9k50uGIQaP6Pqzj3yGPq3115w_5KO6E8e9asyRemVQi09WA-BFtpPi4"
                alt="Student 1"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-slate-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALgma-un57XGhABgQR9frACh2-2fibGiHUZeiI-pGWvCau-XMDqRlq6rU4sgLg0A4Zzj0ZTObGCuPqbRjpwIQXZeNYvrQJk8GROrocfOSelPNItBliUaLXBv4bwdo-XKmVqsjdbkrmVIe-AMObKEoDLJpvsOzBkeHSxVSE27k_B5COmgyYMoE-VYbejOLD0JdSrosy7X1BcR0TNkGIb9W_ewaIzvDEIjRFTaZ3fxyGChhOEU8tgNLRm6lKlZcMlMpkqKjO_UU9Rq0"
                alt="Student 2"
              />
              <img
                className="w-10 h-10 rounded-full border-2 border-slate-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxqENGBhDd8_ynhLG-fSPavZ66Gjf8t5_CKXDsFkcYCQAj3eF3Lv4p7Y8ypwin5sd1TZEvlbGaj4veB59gW-4VUNKjuSg1cbNgit99d0xJn-HRMTEzdggLLBNDYFOhDAhinlZ41rlD2JcPsGPv6Q12TpfwtUHQm657v35nTKxm4KtaqE8f2k5D7NDW4SGPI2clUz8vFxPuHUvvcKOimgpEFvIIE9RMSQ-8bgANxTxAEiwXPRYwGUBDNDBK4JVCRQpZGYcFuBWLygo"
                alt="Student 3"
              />
            </div>
            <span className="text-sm font-medium">
              {t('Join over')} <strong className="text-slate-900">10,000+</strong> {t('active learners')}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[500px]"
        >
          <ThreeJsBackground />
          
          <div className="absolute -top-10 -end-10 bg-slate-50/70 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-200 animate-bounce duration-[3000ms]">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-300 dark:bg-cyan-800 p-2 rounded-lg">
                <svg className="w-6 h-6 text-cyan-900 dark:text-cyan-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-slate-500">{t('Certified Diplomas')}</p>
                <p className="font-bold text-sm text-slate-900">{t('Globally')}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
