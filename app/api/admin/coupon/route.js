import { inngest } from "@/inngest/client";
import { prisma } from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse as res } from "next/server"

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const { coupon } = await req.json();
        coupon.code = coupon.code.toUpperCase();

        await prisma.coupon.create({ data: coupon }).then(async (coupon) => {
            await inngest.send({
                name: "app/coupon.expired",
                data: {
                    code: coupon.code,
                    expires_at: coupon.expiresAt
                }
            })
        })
        return res.json({ message: "coupon added successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 })
    };
};


export const DELETE = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const { searchParams } = req.nextUrl;;
        const code = searchParams.get("code");
        await prisma.coupon.delete({ where: { code } });
        return res.json({ message: "Coupon deleted successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 })
    };
};


// Get all coupon
export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const coupons = await prisma.coupon.findMany({});
        return res.json({ coupons });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 })
    };
};