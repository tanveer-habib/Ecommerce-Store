import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";
import imageKit from "@/configs/imageKit.js";
import { toFile } from '@imagekit/nodejs';

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const formData = await req.formData();

        const name = formData.get("name");
        const username = formData.get("username");
        const description = formData.get("description");
        const email = formData.get("email");
        const contact = formData.get("contact");
        const address = formData.get("address");
        const image = formData.get("image");
        if (!name || !username || !description || !email || !contact || !address || !image) {
            return res.json({ error: "Missing store info" }, { status: 400 });
        };

        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });
        if (store) {
            return res.json({ status: store.status });
        };

        const isUsernameTaken = await prisma.store.findFirst({
            where: { username: username.toLowerCase() }
        });
        if (isUsernameTaken) {
            return res.json({ error: "Username already taken" }, { status: 400 });
        };

        const buffer = Buffer.from(await image.arrayBuffer());
        // const response = await imageKit.files.upload({
        //     file: buffer,
        //     fileName: image.name,
        //     folder: "logo"
        // });

        // const optimizedImage = imageKit.url({
        //     path: response.filePath,
        //     transformation: [
        //         { quality: "auto" },
        //         { format: "webp" },
        //         { width: "512" }
        //     ]
        // });

        const response = await imageKit.files.upload({
            file: await toFile(buffer, 'file'),
            fileName: image.name,
        });

        const optimizedImage = imageKit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
                {
                    quality: "auto",
                    width: 512,
                    format: 'webp',
                },
            ],
        });

        const newStore = await prisma.store.create({
            data: {
                userId,
                name,
                description,
                username: username.toLowerCase(),
                email,
                contact,
                address,
                logo: optimizedImage
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { store: { connect: { id: newStore.id } } }
        });

        return res.json({ message: "applied, waiting for approval" });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
};

export const GET = async (req) => {
    try {
        const { userId } = getAuth(req);

        const store = await prisma.store.findFirst({
            where: { userId: userId }
        });
        if (store) {
            return res.json({ status: store.status });
        };

        return res.json({ status: "not registered" });
    } catch (error) {
        return res.json({ error: error.code || error.message }, { status: 400 });
    };
}