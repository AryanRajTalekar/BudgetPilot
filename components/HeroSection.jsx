"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
// import Image from "next/image";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen w-full bg-white dark:bg-black overflow-hidden pt-20">
      {/* Decorative Stars */}
      <span className="hidden sm:block absolute top-24 left-10 text-black text-2xl dark:text-white">
        ✦
      </span>
      <span className="hidden sm:block absolute top-40 right-[42%] text-black text-2xl dark:text-white">
        ✦
      </span>
      <span className="hidden sm:block absolute bottom-32 left-16 text-black text-2xl dark:text-white">
        ✦
      </span>

     <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between min-h-[calc(100vh-80px)] gap-10 md:gap-12">
        {/* Left Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w-xl z-10"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-[64px] font-extrabold text-black dark:text-white leading-[1.1] tracking-tight mb-5 text-center md:text-left">
            Make The Best
            <br />
            Financial Decisions
          </h1>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg dark:text-gray-300 leading-relaxed mb-8 max-w-md text-center md:text-left mx-auto md:mx-0">
            Track your spending, understand your habits, and take control of
            your money with smart insights and automation.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
               <Button className="w-full sm:w-auto bg-[#E63946] hover:bg-[#c7303c] text-white rounded-full px-6 sm:px-7 py-3 text-sm font-semibold shadow-md">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto bg-[#E63946] hover:bg-[#c7303c] text-white rounded-full px-6 sm:px-7 py-3 text-sm font-semibold shadow-md">
                  Get Started
                </Button>
              </Link>
            </SignedIn>

            <button className="flex items-center justify-center sm:justify-start gap-2 text-black dark:text-white font-semibold text-sm hover:opacity-70 transition w-full sm:w-auto">
              <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black dark:border-white">
                <Play size={14} fill="black" />
              </span>
             See How It Works
            </button>
          </div>

          {/* Decorative Banner Strip */}
          <motion.div
            initial={{ opacity: 0, rotate: -6, y: 20 }}
            animate={{ opacity: 1, rotate: -6, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-14 relative"
          >
            <div className="bg-black text-white dark:text-black rounded-xl px-6 py-3 inline-flex items-center gap-4 -rotate-6 shadow-xl">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Monthly Budget
                </span>
                <span className="text-lg font-bold">₹4,512.00</span>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                  Spent
                </span>
                <span className="text-lg font-bold text-[#E63946]">₹1,280</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Stacked Phones */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative flex justify-center items-center min-h-[400px] sm:min-h-[520px] mt-10 md:mt-0"
        >
          {/* Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-[#E63946]/60 blur-[80px] z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full bg-orange-300/30 blur-[60px] z-0" />

          {/* Back Phone */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
              delay: 0.3,
            }}
             className="hidden sm:block absolute top-6 left-2 sm:left-6 md:left-4 rotate-[-14deg] z-10"
          >
            <div className="w-[100px] sm:w-[140px] md:w-[185px] h-[220px] sm:h-[300px] md:h-[380px] bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
              <PhoneMockup1 />
            </div>
          </motion.div>

          {/* Mid Phone */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut",
              delay: 0.15,
            }}
            className="hidden sm:block absolute top-0 right-2 sm:right-6 md:right-4 rotate-[12deg] z-20"
          >
            <div className="w-[100px] sm:w-[140px] md:w-[185px] h-[220px] sm:h-[300px] md:h-[380px] bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden">
              <PhoneMockup2 />
            </div>
          </motion.div>

          {/* Front Phone */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="relative z-30"
          >
            <div className="w-[120px] sm:w-[160px] md:w-[210px] h-[260px] sm:h-[340px] md:h-[420px] bg-white rounded-[36px] shadow-2xl border border-gray-100 overflow-hidden">
              <PhoneMockup3 />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/** Inline phone UI mockup — replace with <Image> if you have actual screenshots */
const PhoneMockup1 = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col gap-2">
    {/* Status bar */}
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-bold text-gray-700">Hello Aryan</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-gray-300" />
      </div>
    </div>
    {/* Card */}
    <div className="bg-black rounded-2xl p-3 text-white">
      <div className="text-[8px] opacity-60 mb-1">Total Balance</div>
      <div className="text-sm font-bold">₹2,548.00</div>
      <div className="flex justify-between mt-2">
        <div>
          <div className="text-[6px] opacity-60">Income</div>
          <div className="text-[9px] font-semibold text-green-400">₹1,840</div>
        </div>
        <div>
          <div className="text-[6px] opacity-60">Expenses</div>
          <div className="text-[9px] font-semibold text-[#E63946]">₹284</div>
        </div>
      </div>
    </div>
    {/* Chart placeholder */}
    <div className="flex-1 rounded-xl bg-white shadow-inner flex flex-col justify-end p-2 gap-1">
      <div className="flex items-end gap-[3px] h-16">
        {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 5 ? "#E63946" : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-[6px] text-gray-400">
            {d}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const PhoneMockup3 = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col gap-2">
    {/* Status bar */}
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-bold text-gray-700">Hello Darshan</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-gray-300" />
      </div>
    </div>
    {/* Card */}
    <div className="bg-black rounded-2xl p-3 text-white">
      <div className="text-[8px] opacity-60 mb-1">Total Balance</div>
      <div className="text-sm font-bold">₹2,548.00</div>
      <div className="flex justify-between mt-2">
        <div>
          <div className="text-[6px] opacity-60">Income</div>
          <div className="text-[9px] font-semibold text-green-400">₹1,840</div>
        </div>
        <div>
          <div className="text-[6px] opacity-60">Expenses</div>
          <div className="text-[9px] font-semibold text-[#E63946]">₹284</div>
        </div>
      </div>
    </div>
    {/* Chart placeholder */}
    <div className="flex-1 rounded-xl bg-white shadow-inner flex flex-col justify-end p-2 gap-1">
      <div className="flex items-end gap-[3px] h-16">
        {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 5 ? "#E63946" : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-[6px] text-gray-400">
            {d}
          </span>
        ))}
      </div>
    </div>
  </div>
);

const PhoneMockup2 = () => (
  <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col gap-2">
    {/* Status bar */}
    <div className="flex justify-between items-center px-1">
      <span className="text-[8px] font-bold text-gray-700">Hello Jagguu</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 rounded-full bg-gray-300" />
      </div>
    </div>
    {/* Card */}
    <div className="bg-black rounded-2xl p-3 text-white">
      <div className="text-[8px] opacity-60 mb-1">Total Balance</div>
      <div className="text-sm font-bold">₹2,548.00</div>
      <div className="flex justify-between mt-2">
        <div>
          <div className="text-[6px] opacity-60">Income</div>
          <div className="text-[9px] font-semibold text-green-400">₹1,840</div>
        </div>
        <div>
          <div className="text-[6px] opacity-60">Expenses</div>
          <div className="text-[9px] font-semibold text-[#E63946]">₹284</div>
        </div>
      </div>
    </div>
    {/* Chart placeholder */}
    <div className="flex-1 rounded-xl bg-white shadow-inner flex flex-col justify-end p-2 gap-1">
      <div className="flex items-end gap-[3px] h-16">
        {[40, 65, 45, 80, 55, 90, 60].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 5 ? "#E63946" : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} className="text-[6px] text-gray-400">
            {d}
          </span>
        ))}
      </div>
    </div>
  </div>
);


export default HeroSection;
