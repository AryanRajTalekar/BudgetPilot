"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";



const testimonials = [
  {
    name: "Darshan Rane",
    role: "Software Engineer",
    img: "/avatars/avatar1.png",
    color: "bg-pink-400",
    comment:
      "BudgetPilot completely changed how I manage my money. I now track every expense and actually stick to my budget.",
    top: "-14%",
    left: "50%",
  },
  {
    name: "Jaggu",
    role: "Student",
    img: "/avatars/avatar7.png",
    color: "bg-blue-400",
    comment:
      "The smart alerts are a game changer. I always know before I overspend.",
    top: "20%",
    left: "-10%",
  },
  {
    name: "Aryan Talekar",
    role: "Freelancer",
    img: "/avatars/avatar3.png",
    color: "bg-green-400",
    comment:
      "Simple, clean, and powerful. Finally a budgeting app that makes sense.",
    top: "20%",
    left: "108%",
  },
  {
    name: "Priya Sharma",
    role: "Product Designer",
    img: "/avatars/avatar2.png",
    color: "bg-yellow-400",
    comment:
      "The UI is so intuitive and the insights are actually useful. I’ve improved my savings consistently.",
    top: "72%",
    left: "4%",
  },
  {
    name: "Rohan Kapoor",
    role: "Entrepreneur",
    img: "/avatars/avatar5.png",
    color: "bg-purple-400",
    comment:
      "BudgetPilot gives me complete clarity on my finances. I finally feel in control of my business and personal spending.",
    top: "72%",
    left: "94%",
  },
];

const TestimonialsSection = () => {
  const [active, setActive] = useState(0);
  return (
    <section
      id="testimonials"
      className="bg-white dark:bg-black py-24 overflow-hidden transition-colors duration-300"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-4">
          <span className="text-xs uppercase tracking-widest text-[#E63946] font-semibold">
            Testimonials
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-black dark:text-white text-center leading-tight mb-16">
          Loved by People
          <br />
          Who Care About Their Money
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-16">
          {/* Circular Avatar Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 flex justify-center"
          >
            <div className="relative w-[280px] h-[280px] md:w-[340px] md:h-[340px]">
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-[#E63946]/15 blur-[60px]" />
              <div className="absolute inset-0 rounded-full border border-gray-400 dark:border-gray-700" />
              <div className="absolute inset-[15%] rounded-full border border-gray-300 dark:border-gray-700" />
              <div className="absolute inset-[30%] rounded-full border border-gray-300 dark:border-gray-700" />

              {/* Center image */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-xl z-10 flex items-center justify-center">
                <div className="w-full h-full relative">
                  <Image
                    src={testimonials[active].img}
                    alt={testimonials[active].name}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Orbital avatars */}
              {testimonials.map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i + 0.3, duration: 0.4 }}
                  className="absolute z-10"
                  style={{
                    top: a.top,
                    left: a.left,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    onClick={() => setActive(i)}
                    className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden cursor-pointer
  border-2 ${
    active === i
      ? "border-[#E63946] scale-110"
      : "border-white dark:border-gray-800"
  }
  shadow-lg transition`}
                  >
                    <Image
                      src={a.img}
                      alt={a.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1 max-w-md"
          >
            <h3 className="text-xl font-extrabold text-black dark:text-white mb-4">
              {testimonials[active].comment.split(".")[0]}
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {testimonials[active].comment}
            </p>

            {/* Avatars row */}
            <div className="flex items-center gap-2 mb-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setActive(i)}
                  className={`relative w-8 h-8 rounded-full overflow-hidden cursor-pointer border-2 -ml-2 first:ml-0
      ${active === i ? "border-[#E63946]" : "border-white dark:border-gray-800"}`}
                >
                  <Image
                    src={t.img}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="font-bold text-black dark:text-white text-sm">
                {testimonials[active].name}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {testimonials[active].role}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
