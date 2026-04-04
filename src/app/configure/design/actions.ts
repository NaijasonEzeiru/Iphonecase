"use server";

import { db } from "@/db";
import { configuration } from "@/db/schema";
import { caseColor, caseFinish, caseMaterial, phoneModel } from "@/lib/vars";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export type SaveConfigArgs = {
  color: (typeof caseColor)[number];
  finish: (typeof caseFinish)[number];
  material: (typeof caseMaterial)[number];
  model: (typeof phoneModel)[number];
  configId: string;
};

export async function saveConfig({
  color,
  finish,
  material,
  model,
  configId,
}: SaveConfigArgs) {
  await db
    .update(configuration)
    .set({ color, finish, material, model })
    .where(eq(configuration.id, configId));
}
