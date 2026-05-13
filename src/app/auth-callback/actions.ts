"use server";

import { db } from "@/db";
import { createSession, getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema";

export const getAuthStatus = async () => {
  const u = await getSession();
  if (!u) {
    throw new Error("Invalid user data");
  }

  const v = await db.query.user.findFirst({
    where: eq(user.id, u.userId),
    with: {
      orders: {
        with: {
          configuration: true,
        },
      },
    },
  });
  if (!v) {
    throw new Error("Invalid user data");
  }
  const { passwordHash: _, ...rest } = v;
  if (!v) {
    throw new Error("Invalid user data");
  }

  await createSession({
    userId: v.id,
    email: v.email,
  });

  return { success: true };

  // const existingUser = await db.user.findFirst({
  //   where: { id: user.id },
  // })

  // if (!existingUser) {
  //   await db.user.create({
  //     data: {
  //       id: user.id,
  //       email: user.email,
  //     },
  //   })
  // }

  // return { success: true }
};
