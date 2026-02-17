"use client";

import Script from "next/script";
import { useEffect } from "react";

export function AdSenseHeader() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (!clientId || clientId === "ca-pub-placeholder") {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

/**
 * Ad slot component - place this in your pages where you want ads
 * Usage: <AdSlot slotId="1234567890" />
 */
export function AdSlot({ slotId, style = {} }: { slotId: string; style?: React.CSSProperties }) {
  useEffect(() => {
    // Push ad config to Google AdSense
    try {
      const w = window as any;
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div style={{ margin: "20px 0", ...style }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

/**
 * Responsive ad slot (recommended for mobile/responsive design)
 */
export function ResponsiveAdSlot({ slotId }: { slotId: string }) {
  return <AdSlot slotId={slotId} style={{ minHeight: "250px" }} />;
}
