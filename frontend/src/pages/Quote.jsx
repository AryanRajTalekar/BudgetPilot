import React, { useEffect, useRef } from 'react';
import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useUser, SignInButton } from "@clerk/clerk-react";

gsap.registerPlugin(TextPlugin, ScrollTrigger);

const Quote = () => {
  const quoteRef = useRef(null);
  const { isSignedIn } = useUser();

  useEffect(() => {
    // Shine animation
    const shineTimeline = gsap.timeline({ repeat: -1, delay: 2 });
    shineTimeline.to(".shine-button-inner", {
      x: "150%",
      ease: "power1.inOut",
      duration: 2,
    });

    // Typewriter animation
    const tl = gsap.timeline({ paused: true });
    tl.to(quoteRef.current, {
      text: "Investment\nin knowledge pays\nthe best interest.",
      duration: 2.2,
      ease: "none",
    });

    const st = ScrollTrigger.create({
      trigger: quoteRef.current,
      start: "top 100%",
      end: "top 40%",
      onEnter: () => tl.play(),
      onEnterBack: () => tl.play(),
      onLeaveBack: () => tl.reverse(),
    });

    return () => { st.kill(); tl.kill(); };
  }, []);

  return (
    <div className="quote-page relative w-full h-screen bg-[#fcfcfc] overflow-hidden flex flex-col items-center">
      {/* Reverse gradient at the top */}
      <div className="absolute top-0 left-0 w-full h-[14vw] bg-gradient-to-t from-transparent to-[#fcfcfc] z-10"></div>

      

      {/* Quote text below */}
      <div className="w-full p-12 mt-20 flex justify-center">
        <h2
          ref={quoteRef}
          className="text-center text-4xl md:text-[8vw] font-bold font-[Londrina_Shadow] leading-tight tracking-[0.1rem] whitespace-pre-line"
          style={{
            backgroundImage: "linear-gradient(to right, #F56992, #990001)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            color: "transparent"
          }}
        >
          {/* GSAP will type here */}
        </h2>
      </div>
    </div>
  );
};

export default Quote;
