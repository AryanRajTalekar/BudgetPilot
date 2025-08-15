import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/lottie/finance-animation.json";
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { SiWebmoney } from "react-icons/si";
import { CoolMode } from "../components/magicui/cool-mode";



const Icons = {
  whatsapp: () => <div className="w-8 h-8 bg-green-500 rounded-full"></div>,
  notion: () => <div className="w-8 h-8 bg-white rounded-md"></div>,
  openai: () => <div className="w-8 h-8 bg-purple-500 rounded-full"></div>,
  googleDrive: () => <div className="w-8 h-8 bg-yellow-500 rounded-tr-lg"></div>
};

const HeroSection = () => {
  const letters = "BudgetPilot".split("");
  const [shrink, setShrink] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShrink(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col md:flex-row justify-between items-center bg-black text-white overflow-hidden px-[5vw]">

      {/* Left Side Text */}

      <motion.div
        className="flex flex-col items-center md:items-start text-center md:text-left"
        initial={{ scale: 1, opacity: 1, y: 0 }} // matches the visible position
        animate={{ scale: shrink ? 0.7 : 1, y: shrink ? -50 : 0 }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 20,
          duration: 2.5
        }}
      >

        <CoolMode>
          <h1
            className="font-bold flex gap-2 items-center justify-center md:justify-start"
            style={{
              fontSize: isMobile ? "12vw" : "8vw",
              whiteSpace: "nowrap"
            }}
          >

            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >

              <SiWebmoney size={isMobile ? 60 : 100} className="mr-2 md:mr-4" />
            </motion.span>
            {letters.map((char, i) => {
              if (char === "d" || char === "P") {
                return (
                  <motion.span
                    key={i}
                    className="inline-block text-green-400"
                    animate={{ rotate: [0, 360, 360, 0] }}
                    transition={{
                      duration: 1.2,
                      delay: i * 0.1,
                      repeat: Infinity,
                      repeatDelay: 10,
                      ease: "easeInOut"
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
                    ease: "easeOut"
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </h1>
        </CoolMode>

        {shrink && (
          <CoolMode>
            <motion.span
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              className="text-[6vw] md:text-[4vw] font-medium text-gray-300 mt-4"
            >
              Your AI-powered Personal <br />
              <span className="text-[5vw] md:text-[3.5vw]">
                Finance Co-Pilot
              </span>
            </motion.span>
          </CoolMode>
        )}
      </motion.div>

      {/* Right Side Orbiting Animation */}
      {shrink && (
        <div className="relative flex h-[60vw] w-[60vw] md:h-[35vw] md:w-[45vw] flex-col items-center justify-center overflow-hidden mt-10 md:mt-[-20vh]">
          {/* Orbiting Icons */}
          <OrbitingCircles
            iconSize={isMobile ? 30 : 40}
            radius={isMobile ? 120 : 350}
          >
            <Icons.whatsapp />
            <Icons.notion />
            <Icons.openai />
            <Icons.googleDrive />
          </OrbitingCircles>

          <OrbitingCircles
            iconSize={isMobile ? 25 : 30}
            radius={isMobile ? 90 : 250}
            reverse
            speed={2}
          >
            <Icons.whatsapp />
            <Icons.notion />
            <Icons.openai />
            <Icons.googleDrive />
          </OrbitingCircles>

          {/* Center Lottie */}
          <div className="absolute z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw]">
            <Player autoplay loop src={animationData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
