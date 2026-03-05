import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { cart } = await req.json();

        await prisma.user.update({
            where: { id: userId },
            data: { cart: cart }
        });

        return res.json({ message: "Cart updated" });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 500 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        return res.json({ cart: user.cart });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 500 });
    };
};