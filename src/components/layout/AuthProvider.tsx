"use client";

import { ClerkProvider } from "@clerk/nextjs";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

// Clerk requires a structurally valid key (pk_test_ or pk_live_ prefix + base64).
// When using placeholders, generate a structurally valid but non-functional key
// so ClerkProvider doesn't throw during build/SSG.
function getClerkKey(): string {
  if (
    publishableKey.startsWith("pk_test_") &&
    !publishableKey.includes("placeholder")
  ) {
    return publishableKey;
  }
  if (
    publishableKey.startsWith("pk_live_") &&
    !publishableKey.includes("placeholder")
  ) {
    return publishableKey;
  }
  // Return a structurally valid but non-functional test key.
  // Decoded value must end with "$", contain ".", and have no extra "$".
  // This allows ClerkProvider to mount without throwing, but auth will not work.
  return "pk_test_cGxhY2Vob2xkZXIuY2xlcmsuYWNjb3VudHMuZGV2JA==";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={getClerkKey()}>
      {children}
    </ClerkProvider>
  );
}
