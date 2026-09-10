"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import coursesData from "@/data/courses.json";
import {
  Star,
  Users,
  Clock,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Award,
  DownloadCloud,
  Infinity as InfinityIcon,
  ShieldCheck,
  Share2,
  PlayCircle
} from "lucide-react";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { t } = useTranslation();

  const course = coursesData.find((c) => c.id === resolvedParams.id);

  if (!course) {
    return notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--sv-bg-page)] text-[var(--sv-text-primary)] font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1 w-full pb-20">
        {/* Top Breadcrumb & Hero */}
        <section className="bg-slate-900 text-white pt-10 pb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] pointer-events-none rounded-full" />
          <div className="max-w-[1240px] mx-auto px-6 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/courses" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{t("Back to Courses")}</span>
              </Link>
              <span>/</span>
              <span className="text-indigo-400 font-medium">{t(course.category)}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Left 2 Cols: Course Overview & Headings */}
              <div className="lg:col-span-2">
                <span className="inline-block bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1 rounded-lg mb-4">
                  {t(course.category)}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  {course.description}
                </p>

                {/* Rating & Stats row */}
                <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300 mb-6">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{course.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({course.reviewsCount} {t("ratings")})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>{course.studentsCount.toLocaleString()} {t("students")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>{course.lessonsCount} {t("lessons")}</span>
                  </div>
                </div>

                {/* Instructor Row */}
                <div className="flex items-center gap-3 pt-6 border-t border-slate-800">
                  <img
                    src={course.instructor.profileImageUrl}
                    alt={course.instructor.firstName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
                  />
                  <div>
                    <span className="text-xs text-slate-400 block">{t("Created by")}</span>
                    <span className="font-bold text-base text-white">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {course.instructor.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Course Pricing & Enroll Card */}
              <div className="lg:col-span-1">
                <div className="bg-slate-800/90 backdrop-blur-md rounded-3xl border border-slate-700/80 p-6 shadow-2xl text-slate-100">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 relative bg-slate-900">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 text-indigo-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                        <PlayCircle className="w-7 h-7" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-black text-white">${course.price}</span>
                    <span className="text-sm text-slate-400 line-through">
                      ${(course.price * 1.6).toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                      40% OFF
                    </span>
                  </div>

                  <Link
                    href={`/register?courseId=${course.id}`}
                    className="w-full block text-center py-3.5 px-6 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all mb-4"
                  >
                    {t("Enroll Now")}
                  </Link>

                  <p className="text-center text-xs text-slate-400 mb-6 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>30-Day Money-Back Guarantee</span>
                  </p>

                  {/* Highlights checklist */}
                  <div className="space-y-3 pt-6 border-t border-slate-700/60 text-xs text-slate-300">
                    <p className="font-bold text-sm text-white mb-2">{t("This course includes:")}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{course.duration} on-demand video</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-400" />
                      <span>{course.lessonsCount} interactive lessons & quizzes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DownloadCloud className="w-4 h-4 text-indigo-400" />
                      <span>Downloadable source files & resources</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <InfinityIcon className="w-4 h-4 text-indigo-400" />
                      <span>Full lifetime access on web & mobile</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-indigo-400" />
                      <span>Verified Certificate of Completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Details Content Body */}
        <section className="max-w-[1240px] mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* What you will learn */}
              <div className="bg-[var(--sv-bg-card)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  {t("What you will learn")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {course.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description */}
              <div className="bg-[var(--sv-bg-card)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
                  {t("Course Overview")}
                </h2>
                <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base space-y-4">
                  <p>{course.description}</p>
                  <p>
                    Throughout this course, you will engage in hands-on projects designed to solidify your understanding. Each module is structured to deliver practical, real-world skills that you can directly apply in your professional career.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                    {t("Topics Covered")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructor Bio Section */}
              <div className="bg-[var(--sv-bg-card)] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
                  {t("Instructor")}
                </h2>
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <img
                    src={course.instructor.profileImageUrl}
                    alt={course.instructor.firstName}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-3">
                      {course.instructor.title}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      Passionate educator and practitioner with over a decade of industry leadership. Committed to empowering students worldwide with high-impact, actionable skills.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
