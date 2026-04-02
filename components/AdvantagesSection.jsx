"use client";

import { motion } from "framer-motion";
import { Bell, Sliders } from "lucide-react";

const advantages = [
  {
    icon: <Bell size={18} className="text-[#E63946]" />,
    tag: "Advantages",
    title: "Why Choose BudgetPilot?",
    subtitle: "Smart Financial Alerts",
    description:
      "Get intelligent, real-time notifications that help you stay ahead of your finances. From budget limits to unusual spending patterns, BudgetPilot ensures you're always informed and in control.",
    phoneRight: false,
  },
  {
    icon: <Sliders size={18} className="text-[#E63946]" />,
    tag: "",
    title: "",
    subtitle: "Flexible Budget Control",
    description:
      "Customize every aspect of your budgeting experience. Set goals, tweak categories, and track progress effortlessly with a system designed to adapt to your financial habits.",
    phoneRight: true,
  },
];

const AdvantagesSection = () => {
  return (
    <section
      id="advantages"
      className="bg-white dark:bg-black py-12 sm:py-16 overflow-hidden transition-colors duration-300"
    >
      {advantages.map((item, idx) => (
        <div
          key={idx}
          className={`container mx-auto px-4 sm:px-6 md:px-12 flex flex-col ${
            item.phoneRight ? "md:flex-row-reverse" : "md:flex-row"
          } items-center gap-10 md:gap-12 py-12 md:py-16`}
        >
          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, x: item.phoneRight ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 flex justify-center relative"
          >
            {/* Glow + Rings (reduced for mobile) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[220px] sm:w-[300px] md:w-[420px] h-[220px] sm:h-[300px] md:h-[420px] rounded-full bg-[#E63946]/25 blur-[60px] md:blur-[100px]" />

              <div className="absolute w-[140px] sm:w-[200px] md:w-[260px] h-[140px] sm:h-[200px] md:h-[260px] rounded-full bg-[#E63946]/35 blur-[40px] md:blur-[60px]" />

              <div className="absolute w-[80px] sm:w-[110px] md:w-[140px] h-[80px] sm:h-[110px] md:h-[140px] rounded-full bg-[#E63946]/50 blur-[20px] md:blur-[25px]" />

              {/* Rings (hidden on small screens for cleanliness) */}
              <div className="hidden sm:block absolute w-[350px] md:w-[600px] h-[300px] md:h-[450px] rounded-full border border-gray-300 dark:border-gray-600" />

              <div className="hidden sm:block absolute w-[220px] md:w-[350px] h-[220px] md:h-[350px] rounded-full border border-gray-200 dark:border-gray-500" />
            </div>

            {/* Phone */}
            <div
              className="relative z-10 w-[150px] sm:w-[180px] md:w-[210px] h-[300px] sm:h-[360px] md:h-[420px] 
bg-white dark:bg-neutral-900 
rounded-[28px] sm:rounded-[32px] md:rounded-[36px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <AdvPhoneMockup index={idx} />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: item.phoneRight ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 max-w-md text-center md:text-left"
          >
            {item.tag && (
              <span className="text-xs uppercase tracking-widest text-[#E63946] font-semibold mb-3 block">
                {item.tag}
              </span>
            )}

            {item.title && (
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-black dark:text-white leading-tight mb-4 md:mb-6">
                {item.title}
              </h2>
            )}

            <div className="flex items-center md:items-start justify-center md:justify-start gap-3 mb-4">
              <div className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-[#E63946]/10 flex items-center justify-center">
                {item.icon}
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-black dark:text-white">
                {item.subtitle}
              </h3>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        </div>
      ))}
    </section>
  );
};

const AdvPhoneMockup = ({ index }) => (
  <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 p-3 flex flex-col gap-2">
    <div className="flex justify-between items-center px-1 mb-1">
      <span className="text-[9px] font-bold text-gray-700">BudgetPilot</span>
      <div className="w-5 h-5 rounded-full bg-gray-300" />
    </div>

    {index === 0 ? (
      <>
        <div className="flex flex-col gap-2 mt-2">
          {["Payment Received", "Budget Alert", "Saving Goal Met"].map(
            (n, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow px-3 py-2 flex items-center gap-2 border-l-4 border-[#E63946]"
              >
                <div className="w-6 h-6 rounded-full bg-[#E63946]/10 flex items-center justify-center">
                  <Bell size={10} className="text-[#E63946]" />
                </div>
                <div>
                  <div className="text-[8px] font-semibold text-black">
                    {n}
                  </div>
                  <div className="text-[6px] text-gray-400">Just now</div>
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-auto bg-white rounded-2xl p-2 shadow">
          <div className="flex items-end gap-[3px] h-14">
            {[50, 80, 40, 95, 60, 75, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  background: i === 3 ? "#E63946" : "#f3f4f6",
                }}
              />
            ))}
          </div>
        </div>
      </>
    ) : (
      <>
        <div className="mt-2 flex flex-col gap-3">
          {["Budget Limit", "Savings Rate", "Notification"].map((label, i) => (
            <div key={i} className="bg-white rounded-xl shadow px-3 py-2">
              <div className="flex justify-between mb-1">
                <span className="text-[8px] font-semibold text-black">
                  {label}
                </span>
                <span className="text-[8px] text-[#E63946] font-bold">
                  {[75, 40, 90][i]}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#E63946] rounded-full"
                  style={{ width: `${[75, 40, 90][i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto bg-black rounded-2xl p-3 text-white">
          <div className="text-[7px] opacity-50 mb-1">VISA</div>
          <div className="text-[9px] font-mono tracking-widest">
            **** **** **** 4921
          </div>
          <div className="text-xs font-bold mt-2">₹3,288.00</div>
        </div>
      </>
    )}
  </div>
);

export default AdvantagesSection;