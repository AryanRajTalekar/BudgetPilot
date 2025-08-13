// SmoothScroll.jsx
import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

export default function SmoothScroll({ children }) {
  const controls = useAnimation();

  useEffect(() => {
    const handleScroll = () => {
      controls.start({
        y: -window.scrollY,
        transition: { ease: "easeOut", duration: 0.4 } // adjust duration for smoothness
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
}
