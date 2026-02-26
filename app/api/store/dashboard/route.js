import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);

        const orders = await prisma.order.findMany({ where: { storeId } });
        const products = await prisma.product.findMany({ where: { storeId } });
        const ratings = await prisma.rating.findMany({
            where: { productId: { in: products.map((product) => product.id) } },
            include: { user: true, product: true }
        });

        const dashboardData = {
            ratings,
            totalOrders: orders.length,
            totalEarnings: Math.round(orders.reduce((acc, order) => acc + order.total, 0)),
            totalProducts: products.length
        };

        return res.json({ dashboardData });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};