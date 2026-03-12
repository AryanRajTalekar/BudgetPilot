"use server";

import { inngest } from "@/lib/inngest/client";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function importBankStatement(file) {
  try {
    console.log("Import statement triggered");

    if (!file) {
      throw new Error("No file provided");
    }

    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are supported");
    }

    // Get logged in user
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      throw new Error("Unauthorized");
    }

    // Find user in database
    const user = await db.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get default account
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
    });

    if (!account) {
      throw new Error("No account found");
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Send job to Inngest
    await inngest.send({
      name: "statement/import",
      data: {
        file: base64,
        userId: user.id,
        accountId: account.id,
      },
    });

    return {
      success: true,
      message: "Statement uploaded. Processing started.",
    };
  } catch (error) {
    console.error("Statement import error:", error);

    return {
      success: false,
      message: "Failed to process statement",
    };
  }
}