import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse as res } from "next/server"

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { productId } = await req.json();
        if (!productId) {
            return res.json({ error: "Missing details: productId" }, { status: 400 });
        };

        const storeId = await authSeller(userId);
        if (!storeId) {
            return res.json({ error: "Not authorized" }, { status: 401 })
        };

        const product = await prisma.product.findFirst({ where: { id: productId, storeId } });
        if (!product) {
            return res.json({ error: "no froduct found" }, { status: 404 });
        };

        await prisma.product.update({
            where: { id: productId },
            data: { inStock: !product.inStock }
        });

        return res.json({ messag: "Product stock updated successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};