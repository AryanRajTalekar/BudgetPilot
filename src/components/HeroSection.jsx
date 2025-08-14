import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/finance-animation.json"; // replace with your JSON

const HeroSection = () => {
  const letters = "BudgetPilot".split("");
  const [shrink, setShrink] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShrink(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen flex justify-between items-center bg-black text-white overflow-hidden px-[5vw]">
      {/* Animated Text + Tagline */}
      <motion.div
        className="flex flex-col items-start"
        initial={{ scale: 0.9, y: 0, opacity: 0 }}
        animate={{
          scale: shrink ? 0.7 : 1,
          y: shrink ? -150 : 0,
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 20,
          duration: 2.5,
        }}
      >
        <h1
          className="font-bold flex gap-2"
          style={{ fontSize: "10vw", whiteSpace: "nowrap" }}
        >
          {letters.map((char, i) => {
            if (char === "d" || char === "P") {
              return (
                <motion.span
                  key={i}
                  className="inline-block text-green-400"
                  animate={{ rotate: [0, 360, 360, 360, 0] }}
                  transition={{
                    duration: 1.2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 10,
                    ease: "easeInOut",
                  }}
                >
                  {char}
                </motion.span>
              );
            }
            return (
              <motion.span
                key={i}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </h1>

        {/* Tagline appears after slide */}
        {shrink && (
          <motion.span
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 180 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className="text-[4vw] font-medium text-gray-300 mt-4 -ml-18"
          >
            Your AI-powered Personal <br />
            <span className="text-[3.5vw] ml-">Finance Co-Pilot</span>
          </motion.span>
        )}
      </motion.div>

      {/* Lottie Animation - Slide in from right */}
      {shrink && (
        <motion.div
          initial={{ opacity: 0, x: 200, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="w-[30vw] h-[30vw]"
        >
          <Player
            autoplay
            loop
            src={animationData}
            style={{ height: "100%", width: "100%" }}
          />
        </motion.div>
      )}

      {/* Inline keyframes for shine animation */}
      <style>{`
        @keyframes shine {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;
