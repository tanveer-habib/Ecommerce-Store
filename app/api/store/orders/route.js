import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaNeon } from "@prisma/adapter-neon";
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const { orderId, status } = await req.json();
        await prisma.order.update({
            where: { id: orderId, storeId },
            data: { status }
        });

        return res.json({ message: "Orde Status updated" });
    } catch (error) {
        console.log(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const orders = await prisma.order.findMany({
            where: { storeId },
            include: { user: true, address: true, orderItems: { include: { product: true } } },
            orderBy: { createdAt: "desc" }
        });

        return res.json({ orders });
    } catch (error) {
        console.log(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};