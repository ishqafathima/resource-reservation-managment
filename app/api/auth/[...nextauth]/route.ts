
//imports the authentication handlers configured in t=your auth.ts
import { handlers } from "@/auth";

// Exports the GET and POST handlers so Next.js can handle authentication-related API requests using NextAuth.
export const { GET, POST } = handlers;
