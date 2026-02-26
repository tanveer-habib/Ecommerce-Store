import { prisma } from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server"
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const formData = await req.formData();
        const name = formData.get("name");
        const description = formData.get("description");
        const mrp = Number(formData.get("mrp"));
        const price = Number(formData.get("price"));
        const category = formData.get("category");
        const images = formData.getAll("images");

        if (!name || !description || !mrp || !price || !category || images.length < 1) {
            return res.json({ error: "Missing product details" }, { status: 400 });
        };

        const imagesUrl = await Promise.all(images.map(async (image) => {
            const buffer = Buffer.frrom(await image.arrayBuffer());
            const response = await imageKit.upload({
                file: buffer,
                fileName: image.name,
                folder: "product"
            });
            const url = imageKit.url({
                path: response.filePath,
                transformation: [
                    { quality: "auto" },
                    { format: "webp" },
                    { width: "1024" }
                ]
            });
            return url;
        }));

        await prisma.product.create({
            data: {
                name,
                description,
                mrp,
                price,
                category,
                images: imagesUrl,
                storeId
            }
        });

        return res.json({ message: "Product added successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const storeId = await authSeller(userId);
        if (!storeId) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };

        const products = await prisma.product.findMany({ where: { storeId } });

        return res.json({ products });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};