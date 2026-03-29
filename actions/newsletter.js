"use server";

import { db } from "@/lib/prisma";

export async function subscribeToNewsletter(email) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address." };
  }

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true }, // re-subscribe if they unsubbed before
      create: { email },
    });

    return { success: true };
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}