import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";
//commit
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-black font-sans selection:bg-violet-500/30">
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
