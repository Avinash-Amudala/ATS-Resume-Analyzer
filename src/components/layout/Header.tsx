"use client";

import Link from "next/link";
import Image from "next/image";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function Header() {
  const { isSignedIn } = useUser();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/favicon.svg" alt="Logo" width={28} height={28} />
          <span className="text-xl font-bold">
            <span className="text-blue-600">ATS</span> Resume Analyzer
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/templates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Templates
          </Link>
          {isSignedIn && (
            <>
              <Link href="/analyze" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Analyze
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link href="/cover-letter" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cover Letter
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link href="/analyze">
                <Button size="sm">Analyze Resume</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Get Started Free</Button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
