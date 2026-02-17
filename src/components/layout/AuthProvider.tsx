"use client";

import { ClerkProvider } from "@clerk/nextjs";

// NEXT_PUBLIC_ vars are inlined at BUILD time by Next.js.
// Ensure .env.local is present when running `npm run build`.
const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_YXNzdXJpbmctZ251LTM3LmNsZXJrLmFjY291bnRzLmRldiQ";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  );
}
