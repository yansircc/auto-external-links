import { sendVerificationRequest } from "./auth-send-request";
import { type Provider } from "next-auth/providers";

export const providers: Provider[] = [
  {
    id: "plunk",
    name: "Email",
    type: "email",
    maxAge: 60 * 60 * 24, // Email link will expire in 24 hours
    sendVerificationRequest,
  },
];
