import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  useEffect(() => {
    // Left Cloud Animations
    gsap.to(".cloud-left", {
      y: -500,
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    const leftCloudTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    leftCloudTimeline.to(".cloud-left", {
      x: 30,
      duration: 15,
      ease: "power1.inOut",
    });

    // Right Cloud Animations
    gsap.to(".cloud-right", {
      y: -400,
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    const rightCloudTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    rightCloudTimeline.to(".cloud-right", {
      x: -30,
      duration: 15,
      ease: "power1.inOut",
    });

    // Animate BudgetPilot text moving down
    gsap.to(".title", {
      y: 700,
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // Blur
    gsap.to(".title", {
      filter: "blur(30px)",
      scrollTrigger: {
        trigger: ".landing",
        start: "20% top",
        end: "70% top",
        scrub: true,
      },
    });

    // Transparency
    gsap.to(".title", {
      opacity: 0.3,
      scrollTrigger: {
        trigger: ".landing",
        start: "40% top",
        end: "85% top",
        scrub: true,
      },
    });

    // Infinite subtle zoom for the background image
    gsap.to(".landing", {
      scale: 1.01,
      duration: 10,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <div
      className="landing relative w-full h-[110vh] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/assets/landing_page_cover.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Title */}
      <div className="relative z-30 flex items-center justify-center h-full">
        <h1 className="title font-[Oleo_Script_Swash_Caps] text-6xl md:text-8xl font-bold -translate-y-32 leading-none text-white z-10 filter blur-0 opacity-100">
          BudgetPilot
        </h1>
      </div>

      {/* Bottom Clouds */}
      <img
        src="/assets/clouds.png"
        alt="Bottom Clouds"
        className="absolute bottom-0 left-0 w-full object-cover z-20"
      />

      {/* Left cloud */}
      <img
        src="/assets/left_cloud.png"
        alt="Left Clouds"
        className="cloud-left absolute -bottom-30 -left-55 w-1/2 object-contain z-10"
      />

      {/* Right cloud */}
      <img
        src="/assets/right_cloud.png"
        alt="Right Clouds"
        className="cloud-right absolute -bottom-50 -right-30 w-1/2 object-contain z-10"
      />
      <div className="absolute bottom-0 left-0 w-full h-[14vw] bg-gradient-to-b from-transparent to-[#fcfcfc] z-30"></div>
    </div>
  );
};

export default LandingPage;