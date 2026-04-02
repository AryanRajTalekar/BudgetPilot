"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="
        p-2 sm:p-2.5
        rounded-lg 
        border border-gray-300 dark:border-white/20
        bg-white dark:bg-black
        hover:bg-gray-100 dark:hover:bg-neutral-800
        transition
        flex items-center justify-center
        w-9 h-9 sm:w-10 sm:h-10
      "
    >
      {theme === "dark" ? (
        <Sun size={18} className="sm:w-5 sm:h-5" />
      ) : (
        <Moon size={18} className="sm:w-5 sm:h-5" />
      )}
    </button>
  );
}