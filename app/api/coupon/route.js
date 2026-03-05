import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse as res } from "next/server"

export const POST = async (req) => {
    try {
        const { userId, has } = getAuth(req)
        const { code } = await req.json();

        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase(), expiresAt: { gt: new Date() } },
        });

        if (!coupon) {
            return res.json({ error: "Coupon not found" }, { status: 404 });
        };

        if (coupon.forNewUser) {
            const userOrders = await prisma.order.findMany({ where: { userId } });
            if (userOrders.length > 0) {
                return res.json({ error: "Coupon valid for new users" }, { status: 400 });
            }
        };

        if (coupon.forMember) {
            const hasPlusPlan = has({ plan: "plus" });
            if (!hasPlusPlan) {
                return res.json({ error: "Coupon valid for new members only" }, { status: 400 });
            }
        };

        return res.json({ coupon });
    } catch (error) {
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};