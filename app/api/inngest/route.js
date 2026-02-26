import { serve } from "inngest/next";
import { inngest } from "@/inngest/client.js";
import { syncUserCreation, syncUserUpdation, syncUserDeletion, deleteCouponOnExpiry } from "@/inngest/functions.js";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        syncUserCreation,
        syncUserUpdation,
        syncUserDeletion,
        deleteCouponOnExpiry
    ],
});