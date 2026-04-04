import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import OrderReceivedEmail from "@/components/emails/OrderReceivedEmail";
import { order, shippingAddress, billingAddress } from "@/db/schema";
import { eq } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    if (event.type === "checkout.session.completed") {
      if (!event.data.object.customer_details?.email) {
        throw new Error("Missing user email");
      }

      const session = event.data.object as Stripe.Checkout.Session;

      const { userId, orderId } = session.metadata || {
        userId: null,
        orderId: null,
      };

      if (!userId || !orderId) {
        throw new Error("Invalid request metadata");
      }

      const billingAddressData = session.customer_details!.address;
      const shippingAddressData = session.shipping_details!.address;

      // Create shipping address
      const [newShippingAddress] = await db
        .insert(shippingAddress)
        .values({
          name: session.customer_details!.name!,
          city: shippingAddressData!.city!,
          country: shippingAddressData!.country!,
          postalCode: shippingAddressData!.postal_code!,
          street: shippingAddressData!.line1!,
          state: shippingAddressData!.state || null,
          phoneNumber: null, // Not available from Stripe session
        })
        .returning();

      // Create billing address
      const [newBillingAddress] = await db
        .insert(billingAddress)
        .values({
          name: session.customer_details!.name!,
          city: billingAddressData!.city!,
          country: billingAddressData!.country!,
          postalCode: billingAddressData!.postal_code!,
          street: billingAddressData!.line1!,
          state: billingAddressData!.state || null,
          phoneNumber: null, // Not available from Stripe session
        })
        .returning();

      // Update order with payment status and address references
      const [updatedOrder] = await db
        .update(order)
        .set({
          isPaid: true,
          shippingAddressId: newShippingAddress.id,
          billingAddressId: newBillingAddress.id,
          updated: new Date(),
        })
        .where(eq(order.id, orderId))
        .returning();

      await resend.emails.send({
        from: "AppleCase <jayseehe1035@gmail.com>",
        to: [event.data.object.customer_details.email],
        subject: "Thanks for your order!",
        react: OrderReceivedEmail({
          orderId,
          orderDate: new Date(updatedOrder.createdAt!).toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAddressData!.city!,
            country: shippingAddressData!.country!,
            postalCode: shippingAddressData!.postal_code!,
            street: shippingAddressData!.line1!,
            state: shippingAddressData!.state,
          },
        }),
      });
    }

    return NextResponse.json({ result: event, ok: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { message: "Something went wrong", ok: false },
      { status: 500 },
    );
  }
}
