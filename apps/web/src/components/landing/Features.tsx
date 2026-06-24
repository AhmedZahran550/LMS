"use client";

import { motion } from "framer-motion";
import { BookOpen, Users, LineChart, ShieldCheck, Zap, Laptop } from "lucide-react";

const features = [
  {
    icon: <BookOpen className="w-6 h-6 text-violet-600 dark:text-violet-400" />,
    title: "Interactive Courses",
    description: "Learn through hands-on exercises, quizzes, and real-world projects designed by industry experts."
  },
  {
    icon: <LineChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
    title: "Real-time Analytics",
    description: "Track your progress with detailed analytics and personalized learning paths to keep you on track."
  },
  {
    icon: <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    title: "Community Driven",
    description: "Join a vibrant community of learners. Share insights, ask questions, and collaborate on projects."
  },
  {
    icon: <Laptop className="w-6 h-6 text-fuchsia-600 dark:text-fuchsia-400" />,
    title: "Learn Anywhere",
    description: "Access your courses on any device. Sync your progress seamlessly across mobile, tablet, and desktop."
  },
  {
    icon: <Zap className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    title: "Fast & Responsive",
    description: "Experience lightning-fast load times and a silky smooth interface powered by modern web technologies."
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    title: "Secure Platform",
    description: "Your data is protected with enterprise-grade security, robust encryption, and strict privacy controls."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white dark:bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Everything you need to <span className="text-violet-600 dark:text-violet-400">succeed</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            We've built a comprehensive suite of tools to help you learn faster, retain more knowledge, and achieve your goals.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-black shadow-sm flex items-center justify-center mb-6 border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
