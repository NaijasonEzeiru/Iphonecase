"use server";

import { db } from "@/db";
import { order } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { and, eq } from "drizzle-orm";

export const getPaymentStatus = async ({ orderId }: { orderId: string }) => {
  const user = await getSession();

  if (!user) {
    throw new Error("You need to be logged in to view this page.");
  }

  const o = await db.query.order.findFirst({
    where: and(eq(order.id, orderId), eq(order.userId, user.userId)),
    with: {
      billingAddress: true,
      configuration: true,
      shippingAddress: true,
      user: true,
    },
  });

  if (!o) throw new Error("This order does not exist.");

  if (o.isPaid) {
    return o;
  } else {
    return false;
  }
};
