"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

const CTASection = () => {
  return (
    <section className="bg-white dark:bg-black py-12 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative bg-black rounded-3xl dark:bg-white overflow-hidden px-10 md:px-16 py-14 flex flex-col md:flex-row items-center justify-between gap-10"
        >
          {/* Glow behind phones */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full dark:bg-[#E63946]/100 bg-[#E63946]/60 blur-[80px] pointer-events-none" />

          {/* Text */}
          <div className="flex-1 z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl dark:text-black font-extrabold text-white leading-tight mb-6">
              Ready To Get Started?
            </h2>
            <p className="text-gray-400 dark:text-gray-600 text-sm leading-relaxed mb-8 max-w-sm">
              Take control of your money with AI-powered insights, real-time
              expense tracking, and automated budgeting that adapts to your
              lifestyle.
            </p>

            <SignedOut>
              <SignInButton forceRedirectUrl="/dashboard">
                <Button className="bg-white hover:bg-gray-100 text-black rounded-full px-7 py-3 text-sm font-semibold shadow-md flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-[10px]">↓</span>
                  </span>
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-white hover:bg-gray-100 text-black rounded-full px-7 py-3 text-sm font-semibold shadow-md flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-[10px]">↓</span>
                  </span>
                  Open Dashboard
                </Button>
              </Link>
            </SignedIn>
          </div>

          {/* Phones */}
          <div className="relative flex-1 flex justify-center md:justify-end items-end h-[260px] md:h-[320px] z-10">
            {/* Back phone */}
            <div className="absolute right-16 bottom-0 rotate-[-10deg] w-[110px] h-[220px] bg-zinc-800 rounded-[24px] border border-zinc-700 overflow-hidden shadow-2xl">
              <MiniPhone />
            </div>
            {/* Front phone */}
            <div className="relative rotate-[6deg] w-[120px] h-[240px] bg-zinc-900 rounded-[24px] border border-zinc-600 overflow-hidden shadow-2xl z-10">
              <MiniPhone />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const MiniPhone = () => (
  <div className="w-full h-full p-2 flex flex-col gap-1.5 bg-zinc-900">
    <div className="flex justify-between items-center px-1 mb-0.5">
      <span className="text-[7px] font-bold text-white/70">BudgetPilot</span>
    </div>
    <div className="bg-black rounded-xl p-2">
      <div className="text-[6px] text-white/40 mb-0.5">Balance</div>
      <div className="text-[10px] font-bold text-white">₹2,548</div>
    </div>
    <div className="flex-1 bg-black/50 rounded-xl p-1.5 flex flex-col justify-end">
      <div className="flex items-end gap-[2px] h-10">
        {[50, 80, 35, 90, 60, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 3 ? "#E63946" : "#3f3f46",
            }}
          />
        ))}
      </div>
    </div>
    <div className="flex gap-1">
      {["Income", "Spend"].map((l, i) => (
        <div key={i} className="flex-1 bg-black/50 rounded-lg p-1">
          <div className="text-[5px] text-white/40">{l}</div>
          <div
            className={`text-[7px] font-bold ${i === 0 ? "text-green-400" : "text-[#E63946]"}`}
          >
            ₹{i === 0 ? "1,840" : "284"}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default CTASection;
