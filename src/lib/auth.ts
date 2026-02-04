import {
  betterAuth,
  type MiddlewareInputContext,
  BetterAuthError,
} from "better-auth";
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
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Skill Bridge" <skillbridge@gmail.com>', // sender address
          to: user.email,
          subject: "Please verify your email",
          html: `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                        <title>Email Verification</title>
                    </head>
                        <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">

                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8; padding:20px;">
                                <tr>
                                    <td align="center">
                            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
                    <!-- Header -->
                                <tr>
                                    <td style="background:#2563eb; padding:20px; text-align:center;">
                                        <h1 style="color:#ffffff; margin:0; font-size:24px;">
                                        Skill Bridge
                                        </h1>
                                    </td>
                                </tr>

                    <!-- Body -->
                                <tr>
                                    <td style="padding:30px; color:#333333;">
                                        <p className="text-2xl">Hi ~${user.name}</p>
                                        <h2 style="margin-top:0;">Verify your email address</h2>
                                        <p style="font-size:16px; line-height:1.6;">
                                        Thanks for signing up with <strong>Skill Bridge</strong>!  
                                        Please confirm your email address by clicking the button below.
                                        </p>

                                <div style="text-align:center; margin:30px 0;">
                                    <a href="${verificationUrl}"
                                        style="
                                          background:#2563eb;
                                          color:#ffffff;
                                          text-decoration:none;
                                          padding:14px 28px;
                                          border-radius:6px;
                                          font-size:16px;
                                          display:inline-block;
                                        ">
                                        Verify Email
                                    </a>
                                </div>

                                        <p style="font-size:14px; color:#666;">
                                          If the button doesn’t work, copy and paste this link into your browser:
                                        </p>

                                        <p style="font-size:14px; word-break:break-all;">
                                          <a href="${verificationUrl}" style="color:#2563eb;">
                                            ${verificationUrl}
                                          </a>
                                        </p>

                                        <p style="font-size:14px; color:#666;">
                                          This link will expire in 24 hours. If you didn’t create an account, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>

                        <!-- Footer -->
                                <tr>
                                    <td style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#999;">
                                      © ${new Date().getFullYear()} Skill Bridge. All rights reserved.
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>

            </body>
        </html>`,
        });

        console.log("Message sent:", info.messageId);
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
      },
    },
  },
  hooks: {
    async before(ctx: MiddlewareInputContext<any>): Promise<void> {
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
