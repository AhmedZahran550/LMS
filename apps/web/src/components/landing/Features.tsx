"use client";

import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { School, UserCheck, Clock, Star } from "lucide-react";
import Link from "next/link";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <School className="w-10 h-10 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />,
      title: t('Certified Courses'),
      description: t('We offer courses accredited by top educational institutions and global companies to ensure career quality.'),
      bgColor: "bg-indigo-100 dark:bg-indigo-900/40",
      hoverBg: "group-hover:bg-indigo-600"
    },
    {
      icon: <UserCheck className="w-10 h-10 text-cyan-600 dark:text-cyan-400 group-hover:text-white transition-colors" />,
      title: t('Expert Instructors'),
      description: t('Learn directly from industry leaders and practicing experts who possess years of real-world experience.'),
      bgColor: "bg-cyan-100 dark:bg-cyan-900/40",
      hoverBg: "group-hover:bg-cyan-600"
    },
    {
      icon: <Clock className="w-10 h-10 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />,
      title: t('Flexible Learning'),
      description: t('Schedule your studies around your available time. Learn anywhere, anytime via our responsive platform.'),
      bgColor: "bg-orange-100 dark:bg-orange-900/40",
      hoverBg: "group-hover:bg-orange-600"
    }
  ];

  return (
    <>
      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm"
            >
              {t('Why Us?')}
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold mt-2 text-slate-900 dark:text-slate-100"
            >
              {t('An Unparalleled Learning Experience')}
            </motion.h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-colors ${feature.bgColor} ${feature.hoverBg}`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 relative overflow-hidden bg-white dark:bg-black">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-indigo-600/10 dark:border-indigo-400/10 shadow-sm"
            >
              <span className="block text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">+10,000</span>
              <span className="text-xl font-medium text-slate-600 dark:text-slate-400">{t('Active Students')}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-indigo-600/10 dark:border-indigo-400/10 shadow-sm"
            >
              <span className="block text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">+500</span>
              <span className="text-xl font-medium text-slate-600 dark:text-slate-400">{t('Specialized Courses')}</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-3xl border border-indigo-600/10 dark:border-indigo-400/10 shadow-sm"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-5xl font-black text-indigo-600 dark:text-indigo-400">4.9</span>
                <Star className="w-10 h-10 text-orange-400 fill-orange-400" />
              </div>
              <span className="text-xl font-medium text-slate-600 dark:text-slate-400">{t('Student Rating')}</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white dark:bg-black">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-indigo-600 p-12 md:p-24 rounded-[3rem] overflow-hidden text-center text-white shadow-2xl"
          >
            <div className="absolute top-0 end-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 start-0 w-64 h-64 bg-cyan-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{t('Ready to start your learning journey?')}</h2>
              <p className="text-xl md:text-2xl opacity-90 mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('Join thousands of professionals who have transformed their careers through EduPro. Invest in yourself today and see the difference tomorrow.')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-6">
                <Link href="/register" className="bg-white text-indigo-600 px-10 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:bg-slate-50 transition-all active:scale-95 inline-block">
                  {t('Register Now for Free')}
                </Link>
                <Link href="/contact" className="bg-transparent border-2 border-white/50 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all active:scale-95 inline-block">
                  {t('Contact Us')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
