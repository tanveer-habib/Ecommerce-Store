import Stripe from "stripe";
import { NextResponse as res } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const POST = async (req) => {
    try {
        const body = await req.text();
        const sig = req.headers.get("stripe-signature");

        const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        const handlePaymentIntent = async (paymentIntentId, isPaid) => {
            const session = await stripe.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const { orderIds, userId, appId } = session.data[0].metadata

            if (appId !== "gocart") {
                return res.json({ received: true, message: "Invalid app id" });
            };

            const orderIdsArray = orderIds.split(",");
            if (isPaid) {
                // mark order as paid
                await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.update({
                        where: { id: orderId },
                        data: { isPaid: true }
                    })
                }))
                // empty user cart
                await prisma.user.update({
                    where: { id: userId },
                    data: { cart: {} }
                })
            } else {
                // delete order from db
                await Promise.all(orderIdsArray.map(async (orderId) => {
                    await prisma.order.delete({ where: { id: orderId } })
                }))
            }
        }

        switch (event.type) {
            case "payment_intent.succeeded": {
                await handlePaymentIntent(event.data.object.id, true)
                break;
            }

            case "payment_intent.canceled": {
                await handlePaymentIntent(event.data.object.id, false)
                break;
            }

            default:
                console.log("Unhandled event type: ", event.type);
                break;
        }

        return res.json({ received: true });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.message }, { status: 400 });
    };
};

export const config = {
    api: { bodyparser: false }
}