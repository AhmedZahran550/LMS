import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-black py-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs leading-none">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">LMS Platform</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} LMS Platform Inc. All rights reserved.
          </p>
        </div>
        
        <div className="flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
