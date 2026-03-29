import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(req) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");

  const user = await db.user.findUnique({
    where: { clerkUserId },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const notifications = await db.notification.findMany({
    where: {
      userId: user.id,
      ...(since && {
        createdAt: {
          gt: new Date(since),
        },
      }),
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return Response.json({ notifications });
}

export async function POST(req) {
  const { id, all } = await req.json();

  // Mark ALL as read
  if (all) {
    await db.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });

    return Response.json({ success: true });
  }

  // Mark ONE as read
  if (!id) {
    return Response.json({ error: "Missing ID" }, { status: 400 });
  }

  await db.notification.update({
    where: { id },
    data: { read: true },
  });

  return Response.json({ success: true });
}