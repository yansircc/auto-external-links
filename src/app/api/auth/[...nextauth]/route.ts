import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Removed Edge Runtime to avoid compatibility issues
// NextAuth needs Node.js runtime for full functionality
