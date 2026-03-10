"use client";

import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
  phoneNumberClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    twoFactorClient(),
    magicLinkClient(),
    emailOTPClient(),
    phoneNumberClient(),
  ],
});
