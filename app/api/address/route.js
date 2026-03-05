import { prisma } from "@/lib/prisma"
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const { address } = await req.json();
        address.userId = userId;
        const newAddress = await prisma.address.create({
            data: address
        });
        return res.json({ newAddress, message: "Address added successfully" });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const addresses = await prisma.address.findMany({
            where: { userId }
        });

        return res.json({ addresses });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};