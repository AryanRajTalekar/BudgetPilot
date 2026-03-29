// lib/notifications.js

import { db } from "@/lib/prisma";
import { inngest } from "@/lib/inngest/client";

export async function createNotification({
  userId,
  title,
  message,
  type,
  sendMail = false,
}) {
  try {
    const existing = await db.notification.findFirst({
      where: {
        userId,
        title,
        message,
        read: false,
      },
    });

    if (existing) return existing;

    const notification = await db.notification.create({
      data: { userId, title, message, type },
    });

    // 🔥 SEND EVENT INSTEAD OF EMAIL
    if (sendMail) {
      await inngest.send({
        name: "notification/email",
        data: {
          userId,
          title,
          message,
        },
      });
    }

    return notification;
  } catch (err) {
    console.error("Notification error:", err);
    return null;
  }
}