import authAdmin from "@/middlewares/authAdmin";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isAdmin = await authAdmin(userId);
        if (!isAdmin) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };
        return res.json({ isAdmin });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};