import { prisma } from "@/lib/prisma"
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        let products = await prisma.product.findMany({
            where: { inStock: true },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: true,
            },
            orderBy: { createdAt: "desc" }
        });

        products = products.filter((product) => product.store.isActive);
        return res.json({ products });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 500 });
    };
};