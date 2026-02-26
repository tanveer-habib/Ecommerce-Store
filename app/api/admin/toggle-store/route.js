import { prisma } from "@/lib/prisma";
import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const { storeId } = await req.json();

        const store = await prisma.store.findUnique({
            where: { id: storeId }
        });
        if (!store) {
            return res.json({ error: "Store not found" }, { status: 400 });
        };

        await prisma.store.update({
            where: { id: storeId },
            data: { isActive: !store.isActive }
        });

        return res.json({ message: "Store updated successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};