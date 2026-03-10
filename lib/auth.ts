import "@/lib/env"; // validate env vars at startup
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import {
  organization,
  twoFactor,
  magicLink,
  emailOTP,
  phoneNumber as phoneNumberPlugin,
} from "better-auth/plugins";
import { db } from "@/db";
import * as schema from "@/db/schema";
import {
  sendVerificationEmail,
  sendMagicLinkEmail,
  sendOTPEmail,
} from "@/lib/email";
import { siteConfig } from "@/config/site";

const BASE_URL = process.env.BASE_URL ?? siteConfig.url;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  baseURL: BASE_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    callbackURL: "/settings/themes",
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name, url);
    },
  },
  plugins: [
    nextCookies(),
    organization(),
    twoFactor({
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          await sendOTPEmail(user.email, user.name, otp, "Two-Factor Authentication Code");
        },
      },
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url);
      },
    }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "forget-password"
            ? "Reset your password"
            : type === "email-verification"
              ? "Verify your email"
              : "Your sign-in code";
        await sendOTPEmail(email, email, otp, subject);
      },
    }),
    phoneNumberPlugin({
      sendOTP: async ({ phoneNumber, code }) => {
        // Integrate an SMS provider (e.g. Twilio) here for production.
        // In development the code is logged so you can test without SMS credits.
        console.log(`[DEV] SMS OTP for ${phoneNumber}: ${code}`);
      },
    }),
  ],
});
