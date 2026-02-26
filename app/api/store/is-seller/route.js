import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const storeInfo = await prisma.store.findUnique({ where: { userId } });
        return res.json({ isSeller, storeInfo })
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};