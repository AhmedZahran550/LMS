'use client';

import Link from "next/link";
import { useTranslation } from 'react-i18next';
import { Globe, MessageCircle } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full mt-auto bg-[var(--sv-bg-card)] border-t border-slate-200 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 px-6 max-w-[1200px] mx-auto">
        <div className="col-span-2">
          <Link href="/" className="text-3xl font-black text-indigo-600 mb-6 block">
            {t('app.name')}
          </Link>
          <p className="text-slate-600 mb-6 leading-relaxed max-w-sm">
            {t('The leading platform in e-learning, focused on providing high-quality educational content that meets the demands of the global job market.')}
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-slate-900">{t('Platform')}</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('About Us')}</Link></li>
            <li><Link href="/instructors" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Instructors')}</Link></li>
            <li><Link href="/courses" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Courses')}</Link></li>
            <li><Link href="/pricing" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Pricing')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-slate-900">{t('Support')}</h4>
          <ul className="space-y-2">
            <li><Link href="/help" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Help Center')}</Link></li>
            <li><Link href="/contact" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Contact Us')}</Link></li>
            <li><Link href="/faq" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('FAQ')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-slate-900">{t('Legal')}</h4>
          <ul className="space-y-2">
            <li><Link href="/privacy" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Privacy Policy')}</Link></li>
            <li><Link href="/terms" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Terms of Service')}</Link></li>
            <li><Link href="/cookies" className="text-slate-600 hover:text-indigo-600 transition-all text-sm">{t('Cookies Policy')}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-slate-900">{t('Follow Us')}</h4>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors text-slate-600">
              <Globe className="w-5 h-5" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors text-slate-600">
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
        {t('copyright', { year: new Date().getFullYear(), appName: t('app.name') })}
      </div>
    </footer>
  );
}
