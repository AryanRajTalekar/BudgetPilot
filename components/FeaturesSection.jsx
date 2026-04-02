"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Track Every Expense Effortlessly",
    description:
      "Automatically categorize and monitor your daily spending so you always know where your money is going.",
  },
  {
    title: "AI Insights That Save You Money",
    description:
      "Get smart recommendations that help you reduce unnecessary expenses and optimize your financial habits.",
  },
  {
    title: "Achieve Your Financial Goals Faster",
    description:
      "Set budgets, track progress, and stay consistent with real-time insights designed to keep you on track.",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative bg-white dark:bg-black py-16 sm:py-20 md:py-24 overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-1/2 -translate-y-1/2 w-[200px] sm:w-[260px] md:w-[320px] h-[200px] sm:h-[260px] md:h-[320px] rounded-full bg-[#E63946]/15 blur-[70px] md:blur-[90px]" />

      <div className="container mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        
        {/* Phone */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex-1 flex justify-center relative"
        >
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-full bg-[#E63946]/20 blur-[60px] sm:blur-[80px] z-0" />
          <div className="absolute inset-[20%] rounded-full bg-[#E63946]/15 blur-[40px] sm:blur-[60px] z-0" />
          <div className="absolute inset-[60%] rounded-full bg-[#E63946]/10 blur-[20px] sm:blur-[40px] z-0" />

          {/* Rings */}
          <div className="absolute inset-0 rounded-full border border-gray-300/40 dark:border-gray-600/40 z-10" />
          <div className="absolute inset-[18%] rounded-full border border-gray-200/40 dark:border-gray-500/40 z-10" />

          {/* Phone */}
          <div className="relative z-10 w-[160px] sm:w-[190px] md:w-[220px] h-[320px] sm:h-[380px] md:h-[440px] bg-white rounded-[30px] sm:rounded-[32px] md:rounded-[36px] shadow-2xl border border-gray-100 overflow-hidden">
            <FeaturePhoneMockup />
          </div>

          {/* Floating badges (hidden on very small screens) */}
          <div className="hidden sm:flex absolute -top-2 right-2 md:right-0 bg-white rounded-xl shadow-lg px-3 py-2 items-center gap-2 z-20">
            <div className="w-7 h-7 rounded-full bg-[#E63946] flex items-center justify-center">
              <CheckCircle size={14} className="text-white" />
            </div>
            <div>
              <div className="text-[9px] text-gray-400">Monthly Savings</div>
              <div className="text-xs font-bold text-black">₹2,500</div>
            </div>
          </div>

          <div className="hidden sm:block absolute bottom-2 -left-2 md:-left-6 bg-white rounded-xl shadow-lg px-3 py-2 z-20">
            <div className="text-[9px] text-gray-400">Linked Account</div>
            <div className="text-xs font-bold text-black">**** 4921</div>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex-1 max-w-lg text-center md:text-left"
        >
          <span className="text-xs uppercase tracking-widest text-[#E63946] font-semibold mb-3 block">
            Features
          </span>

          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-black dark:text-white leading-tight mb-6 sm:mb-8">
            Take Full Control of Your Finances
          </h2>

          <div className="flex flex-col gap-5 sm:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex items-start gap-3 sm:gap-4 text-left"
              >
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#E63946] flex items-center justify-center">
                  <CheckCircle size={12} className="text-white" />
                </div>

                <div>
                  <h3 className="font-bold text-black text-sm sm:text-base dark:text-white mb-1">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm leading-relaxed dark:text-gray-300">
                    {f.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeaturePhoneMockup = () => (
  <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 p-3 flex flex-col gap-3">
    <div className="flex justify-between items-center px-1 mb-1">
      <span className="text-[9px] font-bold text-gray-700">
        Welcome Back 👋
      </span>
      <div className="w-5 h-5 rounded-full bg-gray-300" />
    </div>

    <div className="bg-black rounded-2xl p-3 text-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[7px] opacity-50 mb-1">VISA</div>
          <div className="text-[9px] font-mono tracking-widest">
            0000 0000 000 0000
          </div>
        </div>
        <div className="w-7 h-5 rounded bg-white/20" />
      </div>

      <div className="flex justify-between">
        <div>
          <div className="text-[6px] opacity-50">Card Holder</div>
          <div className="text-[8px] font-semibold">Aryan Talekar</div>
        </div>
        <div>
          <div className="text-[6px] opacity-50">Expiry</div>
          <div className="text-[8px] font-semibold">12/24</div>
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      {[
        { label: "Income", value: "₹3,467", color: "text-green-500" },
        { label: "Expense", value: "₹1,286", color: "text-[#E63946]" },
      ].map((s, i) => (
        <div key={i} className="flex-1 bg-white rounded-xl p-2 shadow-sm">
          <div className="text-[6px] text-gray-400 mb-0.5">
            {s.label}
          </div>
          <div className={`text-[10px] font-bold ${s.color}`}>
            {s.value}
          </div>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-1.5 flex-1">
      {["Netflix", "Spotify", "Amazon"].map((name, i) => (
        <div
          key={i}
          className="flex items-center justify-between bg-white rounded-xl px-2 py-1.5 shadow-sm"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-gray-200" />
            <span className="text-[8px] font-medium text-gray-700">
              {name}
            </span>
          </div>
          <span className="text-[8px] text-[#E63946] font-semibold">
            -₹12
          </span>
        </div>
      ))}
    </div>
  </div>
);

export default FeaturesSection;