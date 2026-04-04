"use server";

import { db } from "@/db";
import { createSession, getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { usersTable } from "@/db/schema";

export const getAuthStatus = async () => {
  const u = await getSession();
  if (!u) {
    throw new Error("Invalid user data");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, u.userId),
    with: {
      orders: {
        with: {
          configuration: true,
        },
      },
    },
  });
  if (!user) {
    throw new Error("Invalid user data");
  }
  const { passwordHash: _, ...rest } = user;
  if (!user) {
    throw new Error("Invalid user data");
  }

  await createSession({
    userId: user.id,
    email: user.email,
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
