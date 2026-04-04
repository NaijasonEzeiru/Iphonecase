"use server";

import { db } from "@/db";
import { order } from "@/db/schema";
import { orderStatus } from "@/lib/vars";
import { eq } from "drizzle-orm";

export const changeOrderStatus = async ({
  id,
  newStatus,
}: {
  id: string;
  newStatus: (typeof orderStatus)[number];
}) => {
  await db.update(order).set({ status: newStatus }).where(eq(order.id, id));
};
