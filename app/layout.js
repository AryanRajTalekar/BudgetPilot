import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Link from "next/link";
import { Slack } from "lucide-react";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BudgetPilot",
  description: "One stop Finance Platform",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className} transition-colors`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />

            <main className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
              {children}
            </main>

            <Toaster richColors />

            <footer className="bg-white dark:bg-black text-black dark:text-white border-t border-gray-200 dark:border-white/10 py-12 md:py-16 transition-colors">
              <div className="container mx-auto px-4 md:px-6">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
                  {/* Branding */}
                  <div className="text-center md:text-left max-w-sm">
                    <h3 className="text-xl sm:text-2xl flex gap-2 items-center justify-center md:justify-start font-semibold gradient-title">
                      <Slack size={26} className="text-black dark:text-white" />
                      BudgetPilot
                    </h3>

                    <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm sm:text-base md:text-lg">
                      AI-powered financial management to help you track, save,
                      and grow your money smarter.
                    </p>
                  </div>

                  {/* Navigation */}
                  <div className="flex flex-wrap justify-center md:justify-end gap-6 md:gap-8 text-gray-500 dark:text-gray-400 text-sm sm:text-base md:text-lg font-medium">
                    <Link
                      href="/dashboard"
                      className="hover:text-black dark:hover:text-white transition"
                    >
                      Dashboard
                    </Link>

                    <Link
                      href="#features"
                      className="hover:text-black dark:hover:text-white transition"
                    >
                      Features
                    </Link>

                    <Link
                      href="#testimonials"
                      className="hover:text-black dark:hover:text-white transition"
                    >
                      Testimonials
                    </Link>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-white/10 my-8 md:my-10" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-center items-center text-xs sm:text-sm text-gray-500 gap-3 md:gap-4 text-center">
                  <p>
                    © {new Date().getFullYear()} BudgetPilot. All rights
                    reserved.
                  </p>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
