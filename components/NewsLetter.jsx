"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { subscribeToNewsletter } from "@/actions/newsletter";
import { toast } from "sonner";
import Image from "next/image";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubscribe = () => {
    if (!email) return toast.error("Please enter your email");

    startTransition(async () => {
      const res = await subscribeToNewsletter(email);
      if (res.success) {
        setDone(true);
        toast.success("You're subscribed! See you Sunday evening 📬");
      } else {
        toast.error(res.error || "Something went wrong");
      }
    });
  };

  return (
    <section className="w-full bg-white dark:bg-black py-12 transition-colors duration-300">
      <div className="container mx-auto px-6 md:px-12">
        <div className="relative bg-black dark:bg-white rounded-3xl overflow-hidden px-10 md:px-16 py-16 md:py-20 flex flex-col md:flex-row-reverse items-center justify-between gap-10 shadow-2xl min-h-[380px] md:min-h-[420px]">

          {/* TEXT SIDE */}
          <div className="flex-1 z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white dark:text-black leading-tight mb-8">
              Finance Newsletter
            </h2>
            <p className="text-gray-400 dark:text-gray-600 text-sm md:text-base leading-relaxed mb-10 max-w-md">
              Get weekly market insights, investment ideas, and money tips
              every Sunday evening — directly in your inbox.
            </p>

            {done ? (
              <p className="text-emerald-400 dark:text-emerald-600 font-semibold text-base">
                ✅ You&apos;re on the list! First edition lands this Sunday.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  disabled={pending}
                  className="flex-1 text-sm md:text-base border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white rounded-full px-5 py-3 outline-none focus:border-[#E63946] transition disabled:opacity-50"
                />
                <Button
                  onClick={handleSubscribe}
                  disabled={pending}
                  className="bg-[#E63946] hover:bg-[#c7303c] text-white rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-50"
                >
                  {pending ? "Subscribing…" : "Subscribe"}
                </Button>
              </div>
            )}
          </div>

          {/* IMAGE SIDE */}
          <div className="flex-1 relative flex justify-start items-center min-h-[260px] w-full">
            <div className="relative w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-2xl overflow-hidden">
              <div className="absolute right-20 top-1/2 -translate-y-1/2 w-[300px] md:w-[400px] h-[300px] md:h-[400px] rounded-full bg-[#E63946]/60 dark:bg-[#E63946]/40 blur-[120px] pointer-events-none" />
              <Image src="/newsletter.png" alt="newsletter" fill className="object-contain" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}