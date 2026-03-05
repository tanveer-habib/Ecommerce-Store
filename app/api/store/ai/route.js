import { openai } from "@/configs/openAi";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse as res } from "next/server";

export const main = async (base64Image, mimeType) => {
    const messages = [
        {
            "role": "system",
            "content": `You are a product listing assistant for an e-commerce store.
                        Your job is to analyze an image of a product and generate structured data.

                        Respond ONLY with raw JSON (no code block, no markdown, no explanation).
                        The JSON must strictly follow this schema: {
                           "name": string,           // Short Product name
                           "description": string,    // Marketing-friendly description of the product
                        }`
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Analyze this image and return name + description.",
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": `data:${mimeType};base64,${base64Image}`
                    },
                },
            ],
        }
    ];

    const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL,
        messages,
    });

    const raw = response.choices[0].message.content;

    // Remove ```json or ``` wrappers if present
    const cleaned = raw.replace(/```json|```/g, "").trim();
    let parse;
    try {
        parse = JSON.parse(cleaned);
    } catch (error) {
        throw new Error("AI did not return valid JSON");
    }
    return parse;
}

export const POST = async (req) => {
    try {
        const { userId } = getAuth(req);
        const isSeller = await authSeller(userId);
        if (!isSeller) {
            return res.json({ error: "Not authorized" }, { status: 401 });
        };
        const { base64Image, mimeType } = await req.json();
        const result = await main(base64Image, mimeType);
        return res.json({ ...result });
    } catch (error) {
        console.error(error);
        return res.json({ error: error.code || error.message }, { status: 400 })
    }
}