import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, FileScan } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import { Slack } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import NotificationBell from "@/components/NotificationBell";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-black/70 backdrop-blur-md z-50 border-b border-black/10 dark:border-white/10">
      <nav className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <h1 className="flex items-center gap-2 font-semibold text-lg sm:text-xl md:text-4xl text-black dark:text-white">
            <span>
              <Slack
                size={24}
                className="sm:w-7 sm:h-7 md:w-[50px] md:h-[50px]"
              />
            </span>
            <span className="hidden sm:inline">BudgetPilot</span>
          </h1>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <SignedOut>
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
              href="#features"
            >
              Features
            </a>
            <a
              className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition"
              href="#testimonials"
            >
              Testimonials
            </a>
          </SignedOut>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-wrap">
          <ThemeToggle />

          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="outline"
                className="dark:border-white/20 flex items-center gap-2 px-2 sm:px-3"
              >
                <LayoutDashboard size={18} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>

            <Link href="/transaction/create">
              <Button className="flex items-center gap-2 px-2 sm:px-3">
                <PenBox size={18} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>

            <Link href="/transaction/import">
              <Button
                variant="secondary"
                className="hidden sm:flex items-center gap-2 px-2 sm:px-3"
              >
                <FileScan size={18} />
                <span className="hidden md:inline">Import Statement</span>
              </Button>
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline" className="dark:border-white/20">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationBell />
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10",
                  },
                }}
              />
            </div>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
