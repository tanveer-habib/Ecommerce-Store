import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { orderId, productId, rating, review } = await req.json();
        const order = await prisma.order.findUnique({ where: { id: orderId, userId } })
        if (!order) {
            return res.json({ error: "Order not found" }, { status: 404 });
        };

        const isAlreadyRated = await prisma.rating.findFirst({ where: { productId, orderId } });
        if (isAlreadyRated) {
            return res.json({ error: "Product already rated" }, { status: 400 });
        };

        const response = await prisma.rating.create({
            data: { userId, productId, rating, review, orderId }
        });
        return res.json({ message: "Rating added successfully", rating: response });
    } catch (error) {
        console.error(error)
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.json({ error: "Unauthorized" }, { status: 401 });
        };
        const ratings = await prisma.rating.findMany({ where: { userId } });
        return res.json({ ratings });
    } catch (error) {
        console.error(error)
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};