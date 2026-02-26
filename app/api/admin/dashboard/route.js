import { prisma } from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const orders = await prisma.order.count();
        const stores = await prisma.store.count();
        const products = await prisma.product.count();
        const allOrders = await prisma.order.findMany({
            select: {
                createdAt: true,
                total: true,
            }
        });

        let totalRevenue = 0;
        allOrders.forEach((order) => {
            totalRevenue += order.total
        });
        const revenue = totalRevenue.toFixed(2);
        const dashboardData = {
            orders,
            stores,
            products,
            revenue,
            allOrders
        };

        return res.json({ dashboardData });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};