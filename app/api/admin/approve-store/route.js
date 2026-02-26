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

        const { storeId, status } = await req.json();

        if (status === "approved") {
            await prisma.store.update({
                where: { id: storeId },
                data: { status: "approved", isActive: true }
            });
        } else if (status === "rejected") {
            await prisma.store.update({
                where: { id: storeId },
                data: { status: "rejected" }
            });
        };

        return res.json({ message: status + " successfully" });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const stores = await prisma.store.findMany({
            where: { status: { in: ["pending", "rejected"] } },
            include: { user: true }
        });

        return res.json({ stores });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};