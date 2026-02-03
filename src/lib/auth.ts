import { betterAuth, type MiddlewareInputContext, BetterAuthError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";



export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
            },
        },
    },
    hooks: {
        async before(
            ctx: MiddlewareInputContext<any>
        ): Promise<void> {

            if (!ctx.request) return;
            const pathname = new URL(ctx.request.url).pathname;

            if (pathname !== "/api/auth/sign-up/email") return;

            const body = ctx.body as {
                role?: "STUDENT" | "TUTOR" | "ADMIN";
            };

            if(!body.role) {
                throw new BetterAuthError("Role is required for registration.");
            }

            if (body.role === "ADMIN") {
                throw new BetterAuthError("Admin registration is not allowed.");
            }

            body.role ??= "STUDENT";
            if (!["STUDENT", "TUTOR"].includes(body.role)) {
                throw new Error("Invalid role provided.");
            }

            ctx.body = body;
        },
    },
});