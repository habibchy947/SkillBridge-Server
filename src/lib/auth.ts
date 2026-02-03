import { betterAuth, type MiddlewareInputContext, BetterAuthError } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS,
    },
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    trustedOrigins: [process.env.APP_URL!],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: true
    },

    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
            const info = await transporter.sendMail({
                from: '"Skill Bridge" <skillbridge@gmail.com>', // sender address
                to: "habibullahalquaderi2005@gmail.com",
                subject: "Hello ✔",
                text: "Hello world?", // Plain-text version of the message
                html: "<b>Hello world?</b>", // HTML version of the message
            });

            console.log("Message sent:", info.messageId);
        },
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

            if (!body.role) {
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