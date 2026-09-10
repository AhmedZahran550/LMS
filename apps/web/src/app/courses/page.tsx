"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import coursesData from "@/data/courses.json";
import {
  Search,
  Star,
  Users,
  Clock,
  BookOpen,
  Filter,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  GraduationCap,
  Layers,
  ChevronRight
} from "lucide-react";

export default function CoursesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedLevel, setSelectedLevel] = useState("ALL");
  const [selectedCourse, setSelectedCourse] = useState<typeof coursesData[0] | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(coursesData.map((c) => c.category)));
    return ["ALL", ...cats];
  }, []);

  // Filter courses based on search, category, and level
  const filteredCourses = useMemo(() => {
    return coursesData.filter((course) => {
      const matchesCategory =
        selectedCategory === "ALL" || course.category === selectedCategory;
      const matchesLevel =
        selectedLevel === "ALL" || course.level === selectedLevel;
      const query = search.toLowerCase().trim();
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.tags.some((tag) => tag.toLowerCase().includes(query)) ||
        `${course.instructor.firstName} ${course.instructor.lastName}`
          .toLowerCase()
          .includes(query);

      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [search, selectedCategory, selectedLevel]);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--sv-bg-page)] text-[var(--sv-text-primary)] font-sans selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1 w-full pb-20">
        {/* Hero Header Section */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-b from-indigo-50/60 via-transparent to-transparent dark:from-indigo-950/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="max-w-[1240px] mx-auto px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-4"
              >
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>{t("Browse Paths")}</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5 leading-tight"
              >
                {t("Browse Our Courses")}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed"
              >
                {t(
                  "Explore expert-curated learning paths and accredited courses designed to accelerate your career."
                )}
              </motion.p>
            </div>

            {/* Search & Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-center bg-[var(--sv-bg-card)] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("Search courses, topics, or technologies...")}
                  className="w-full ps-12 pe-4 py-3.5 bg-transparent text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none rounded-xl"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden md:block" />

              <div className="w-full md:w-56">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="ALL">{t("All Levels")}</option>
                  <option value="Beginner">{t("Beginner")}</option>
                  <option value="Intermediate">{t("Intermediate")}</option>
                  <option value="Advanced">{t("Advanced")}</option>
                </select>
              </div>
            </motion.div>

            {/* Category Filter Pills */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex items-center gap-2 overflow-x-auto py-6 max-w-5xl mx-auto no-scrollbar justify-start md:justify-center"
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const label = cat === "ALL" ? t("All Categories") : t(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                        : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Course Count & Active Filters Summary */}
        <section className="max-w-[1240px] mx-auto px-6 py-6">
          <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
            <span>
              {t("Showing {{count}} courses", { count: filteredCourses.length })}
            </span>
            {(selectedCategory !== "ALL" ||
              selectedLevel !== "ALL" ||
              search) && (
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedLevel("ALL");
                  setSearch("");
                }}
                className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center gap-1"
              >
                <span>{t("Reset Filters")}</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </section>

        {/* Courses Grid */}
        <section className="max-w-[1240px] mx-auto px-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-20 bg-[var(--sv-bg-card)] rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
              <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {t("No courses match your search criteria.")}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                {t("Try clearing your filters or search keywords.")}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setSelectedLevel("ALL");
                  setSearch("");
                }}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
              >
                {t("Reset Filters")}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group flex flex-col bg-[var(--sv-bg-card)] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Category Badge */}
                    <div className="absolute top-3 start-3">
                      <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-lg border border-white/10">
                        {t(course.category)}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 end-3">
                      <span className="flex items-center gap-1 bg-amber-400/90 text-amber-950 backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                        <Star className="w-3.5 h-3.5 fill-amber-950" />
                        {course.rating}
                      </span>
                    </div>

                    {/* Level Badge */}
                    <div className="absolute bottom-3 start-3">
                      <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 text-xs font-medium px-2.5 py-0.5 rounded-md">
                        {t(course.level)}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-col flex-1 p-6">
                    {/* Instructor Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={course.instructor.profileImageUrl}
                        alt={`${course.instructor.firstName} ${course.instructor.lastName}`}
                        className="w-8 h-8 rounded-full object-cover border border-indigo-200 dark:border-indigo-800"
                      />
                      <div className="text-xs">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {course.instructor.firstName} {course.instructor.lastName}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {course.instructor.title}
                        </p>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5 mt-auto">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats Row */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span>{course.studentsCount.toLocaleString()} {t("students")}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-cyan-500" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-amber-500" />
                        <span>{course.lessonsCount} {t("lessons")}</span>
                      </div>
                    </div>

                    {/* Card Action */}
                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-400 block">{t("Price")}</span>
                        <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                          ${course.price}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {t("View Details")}
                        </button>
                        <Link
                          href={`/courses/${course.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-600/20 active:scale-95 flex items-center gap-1"
                        >
                          <span>{t("Enroll Now")}</span>
                          <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Quick Course Details Preview Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--sv-bg-card)] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedCourse(null)}
                className="absolute top-4 end-4 z-20 w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner */}
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
                <img
                  src={selectedCourse.thumbnailUrl}
                  alt={selectedCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-4 start-6 end-6 text-white">
                  <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-lg mb-2">
                    {t(selectedCourse.category)}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black leading-snug">
                    {selectedCourse.title}
                  </h3>
                </div>
              </div>

              {/* Modal Content Scrollable */}
              <div className="overflow-y-auto p-6 space-y-6 flex-1">
                {/* Instructor & Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCourse.instructor.profileImageUrl}
                      alt={selectedCourse.instructor.firstName}
                      className="w-11 h-11 rounded-full object-cover border border-indigo-200 dark:border-indigo-800"
                    />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {selectedCourse.instructor.firstName}{" "}
                        {selectedCourse.instructor.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {selectedCourse.instructor.title}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {selectedCourse.rating} ({selectedCourse.reviewsCount} {t("ratings")})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-cyan-500" />
                      {selectedCourse.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-indigo-500" />
                      {selectedCourse.lessonsCount} {t("lessons")}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {t("Course Overview")}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                {/* What You Will Learn */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3">
                    {t("What you will learn")}
                  </h4>
                  <div className="space-y-2.5">
                    {selectedCourse.objectives.map((obj, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
                    {t("Topics Covered")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">{t("Tuition Fee")}</span>
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ${selectedCourse.price}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t("Close")}
                  </button>
                  <Link
                    href={`/courses/${selectedCourse.id}`}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
                  >
                    <span>{t("Enroll Now")}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
