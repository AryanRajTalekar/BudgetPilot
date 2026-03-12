"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MoveUpRight } from "lucide-react";
import MarqueeText from "@/components/MarqueeText";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="pt-32 md:pt-40 pb-20 px-4 bg-black dark:bg-black bg-white text-black dark:text-white w-full min-h-screen transition-colors">
      <div className="container mx-auto pt-20 md:pt-40 text-center">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-5xl md:text-8xl lg:text-[140px] pb-8 gradient-title leading-[1.15] tracking-tight"
        >
          Track. Save. Grow. <br /> All in BudgetPilot
        </motion.h1>

        {/* Sub Text */}
        <div className="mt-6 md:mt-8 mb-8 text-center max-w-2xl mx-auto pt-2 md:pt-4">
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-300">
            Intelligent insights and automation
          </p>

          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-3 md:mt-4">
            to track expenses, optimize budgets, and achieve your financial
            goals.
          </p>
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-10 sm:px-16 md:px-20 py-6 md:py-9 text-lg md:text-2xl font-bold 
              bg-zinc-800 hover:bg-zinc-700 
              dark:bg-zinc-800 dark:hover:bg-zinc-700 
              text-white rounded-xl transition-all duration-300 shadow-lg 
              flex items-center gap-4 group [&_svg]:!w-8 [&_svg]:!h-8 md:[&_svg]:!w-10 md:[&_svg]:!h-10"
            >
              Get Started
              <MoveUpRight className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Marquee */}
      {/* <div className="w-full mt-16 md:mt-20 p-4 md:p-8 h-[8vh] md:h-[10vh]">
        <MarqueeText />
      </div> */}
    </section>
  );
};

export default HeroSection;
