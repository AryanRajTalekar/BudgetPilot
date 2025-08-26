import React, { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
  useEffect(() => {
    // Animate left cloud upwards
    gsap.to(".cloud-left", {
      y: -100,
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    // Animate right cloud upwards
    gsap.to(".cloud-right", {
      y: -100,
      scrollTrigger: {
        trigger: ".landing",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
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
      filter: "blur(30px)",  // GSAP will interpolate from blur-0 to 5px
      scrollTrigger: {
        trigger: ".landing",
        start: "20% top",   // when title is near clouds
        end: "80% top",
        scrub: true,
      },
    });


// Transparency
gsap.to(".title", {
  opacity: 0.3,        // nearly transparent
  scrollTrigger: {
    trigger: ".landing",
    start: "40% top",   // same as blur start
    end: "85% top",
    scrub: true,
  },
});   

  }, []);

  return (
    <div
      className="landing relative w-full h-[110vh] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: "url('/assets/starry_sky_1.jpg')" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Title */}
      <div className="relative z-30 flex items-center justify-center h-full">
        <h1 className="title text-6xl  md:text-8xl font-bold -translate-y-16 text-white z-10 filter blur-0 opacity-100">
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
        className="cloud-left absolute -bottom-30 -left-40 w-1/2 object-contain z-10"
      />

      {/* Right cloud */}
      <img
        src="/assets/right_cloud.png"
        alt="Right Clouds"
        className="cloud-right absolute -bottom-50 -right-30 w-1/2 object-contain z-10"
      />
    </div>
  );
};

export default LandingPage;
