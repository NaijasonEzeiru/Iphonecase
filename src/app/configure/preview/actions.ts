"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { configuration, Order, order } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { and, eq } from "drizzle-orm";

export const createCheckoutSession = async ({
  configId,
}: {
  configId: string;
}) => {
  const config = await db.query.configuration.findFirst({
    where: eq(configuration.id, configId),
  });

  if (!config) {
    throw new Error("No such configuration found");
  }

  const user = await getSession();

  if (!user) {
    throw new Error("You need to be logged in");
  }

  const { finish, material } = config;

  let price = BASE_PRICE;
  if (finish === "textured") price += PRODUCT_PRICES.finish.textured;
  if (material === "polycarbonate")
    price += PRODUCT_PRICES.material.polycarbonate;

  let o: Order | undefined = undefined;

  const existingOrder = await db.query.order.findFirst({
    where: and(
      eq(order.userId, user.userId),
      eq(order.configurationId, config.id),
    ),
  });

  console.log(user.userId, configuration.id);

  if (existingOrder) {
    o = existingOrder;
  } else {
    o = (
      await db
        .insert(order)
        .values({
          amount: price / 100,
          userId: user.userId,
          configurationId: config.id,
        })
        .returning()
    )[0];
  }

  const product = await stripe.products.create({
    name: "Custom iPhone Case",
    images: [config.imageUrl],
    default_price_data: {
      currency: "USD",
      unit_amount: price,
    },
  });

  // @ts-ignore
  const stripeSession = await stripe.checkout.sessions.create({
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/configure/preview?id=${configuration.id}`,
    payment_method_types: ["card", "paypal"],
    mode: "payment",
    shipping_address_collection: { allowed_countries: ["DE", "US"] },
    metadata: {
      userId: user.userId,
      orderId: order.id,
    },
    line_items: [{ price: product.default_price as string, quantity: 1 }],
  });

  return { url: stripeSession.url };
};
