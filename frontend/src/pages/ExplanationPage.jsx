import React from "react";
import { FaChartLine, FaUserAlt, FaPlus, FaPiggyBank } from "react-icons/fa";

const ExplanationPage = () => {
  const sections = [
    {
      label: "The waitlist",
      icon: <FaChartLine size={40} />,
      title: "Think Long-Term",
      text: "Wealth isn’t built overnight. Markets fluctuate daily, but history shows that patient, long-term investors are more likely to achieve consistent growth compared to short-term speculators.",
    },
    {
      label: "What we believe",
      icon: <FaUserAlt size={40} />,
      title: "Diversification",
      text: "Picking stocks can be exciting, but 'buying the market' is a clever way to diversify and anchor your savings... no matter who you are.",
    },
    {
      label: "How it works",
      icon: <FaPlus size={40} />,
      title: "The Power of Compounding",
      text: "Einstein called compounding the 8th wonder of the world. It’s a simple fact, the more money you invest and the longer you leave it, the faster it grows.",
    },
    {
      label: "Our story",
      icon: <FaPiggyBank size={40} />,
      title: "Smart Investors",
      text: "Investing is for anyone willing to be disciplined and consistent. Start with what you can, automate contributions, and let time do the heavy lifting. Even small amounts can grow significantly over decades.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#000000] relative overflow-hidden text-white flex justify-center">
      {/* Gradient at the top */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#333333] to-transparent"></div>

      {/* Page Content */}
      <div className="relative w-full px-10 py-20 flex flex-col justify-center gap-16">
        {/* Grid layout for nav + sections */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center w-full">
          {sections.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              {/* Top Nav Label */}
              <span className="text-[#ff7b47] font-semibold mb-10 block">
                {item.label}
              </span>
              {/* Icon */}
              <div className="mb-4">{item.icon}</div>
              {/* Title */}
              <h2 className="text-xl font-bold mb-3">{item.title}</h2>
              {/* Text */}
              <p className="text-gray-300 text-sm max-w-xs">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-16 text-gray-400 text-center text-xs px-4">
          <p>
            Please remember that historical performance is never a guarantee of
            future performance, your capital is at risk and the value of your
            investment can go down as well as up.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExplanationPage;
