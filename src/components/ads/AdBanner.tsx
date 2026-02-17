"use client";

import { useEffect } from "react";

interface AdBannerProps {
  slot: string;
  format?: "rectangle" | "leaderboard" | "auto";
  className?: string;
}

export function AdBanner({ slot, format = "auto", className = "" }: AdBannerProps) {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded
    }
  }, []);

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  if (!clientId || clientId === "ca-pub-placeholder") {
    // Placeholder for development
    return (
      <div
        className={`bg-slate-100 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-sm text-muted-foreground ${className}`}
        style={{
          minHeight: format === "leaderboard" ? 90 : format === "rectangle" ? 250 : 100,
          width: format === "leaderboard" ? 728 : format === "rectangle" ? 300 : "100%",
        }}
      >
        Ad Space
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slot}
      data-ad-format={format === "auto" ? "auto" : "rectangle"}
      data-full-width-responsive="true"
    />
  );
}
