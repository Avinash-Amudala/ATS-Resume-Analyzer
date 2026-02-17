import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY = process.env.INDEXNOW_API_KEY || "resumeoptimizeronline2024key";
const HOST = "resumeoptimizer.online";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// Ping IndexNow (Bing + Yandex) with updated URLs
async function pingIndexNow(urls: string[]) {
  const body = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const results = await Promise.allSettled([
    // Bing IndexNow
    fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    // Yandex IndexNow
    fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  ]);

  return results.map((r, i) => ({
    engine: i === 0 ? "bing" : "yandex",
    status: r.status === "fulfilled" ? r.value.status : "failed",
    ok: r.status === "fulfilled" ? r.value.ok : false,
  }));
}

// Ping Google with sitemap update notification
async function pingGoogle() {
  const sitemapUrl = encodeURIComponent(`https://${HOST}/sitemap.xml`);
  const res = await fetch(
    `https://www.google.com/ping?sitemap=${sitemapUrl}`
  );
  return { engine: "google", status: res.status, ok: res.ok };
}

// POST /api/indexnow - Submit URLs for indexing
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "urls array is required" },
        { status: 400 }
      );
    }

    // Ensure all URLs are from our domain
    const validUrls = urls.filter((url: string) =>
      url.startsWith(`https://${HOST}`)
    );

    if (validUrls.length === 0) {
      return NextResponse.json(
        { error: "No valid URLs for this domain" },
        { status: 400 }
      );
    }

    const [indexNowResults, googleResult] = await Promise.all([
      pingIndexNow(validUrls),
      pingGoogle(),
    ]);

    return NextResponse.json({
      success: true,
      results: [...indexNowResults, googleResult],
      urlsSubmitted: validUrls.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to ping search engines" },
      { status: 500 }
    );
  }
}

// GET /api/indexnow - Ping all search engines with all public pages
export async function GET() {
  const pages = [
    `https://${HOST}`,
    `https://${HOST}/pricing`,
    `https://${HOST}/templates`,
    `https://${HOST}/analyze`,
    `https://${HOST}/cover-letter`,
  ];

  try {
    const [indexNowResults, googleResult] = await Promise.all([
      pingIndexNow(pages),
      pingGoogle(),
    ]);

    return NextResponse.json({
      success: true,
      results: [...indexNowResults, googleResult],
      urlsSubmitted: pages.length,
      pages,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to ping search engines" },
      { status: 500 }
    );
  }
}
