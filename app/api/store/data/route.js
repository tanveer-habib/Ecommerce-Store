import { prisma } from "@/lib/prisma";
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const username = searchParams.get("usernmae").toLowerCase();
        if (!username) {
            return res.json({ error: "Missing username" }, { status: 400 });
        };

        const store = await prisma.store.findUnique({
            where: { username, isActive: true },
            include: { Product: { include: { rating: true } } }
        });
        if (!store) {
            return res.json({ error: "store not found" }, { status: 400 });
        };

        return res.json({ store });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};