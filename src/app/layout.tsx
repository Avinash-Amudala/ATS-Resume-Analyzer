import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/layout/AuthProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const baseUrl = "https://resumeoptimizer.online";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ATS Resume Analyzer - Free ATS Score Checker & Resume Optimizer",
    template: "%s | ATS Resume Analyzer",
  },
  description:
    "Free ATS resume checker. Get your ATS compatibility score, find missing keywords, and AI-optimize your resume for specific job descriptions. Trusted by 50,000+ job seekers.",
  keywords: [
    "ATS resume checker",
    "resume optimizer",
    "ATS score",
    "job application",
    "resume keywords",
    "ATS compatibility",
    "resume scanner",
    "resume analysis",
    "job search tools",
    "FAANG resume",
    "cover letter generator",
    "resume templates",
    "applicant tracking system",
    "resume scoring",
  ],
  authors: [{ name: "Resume Optimizer", url: baseUrl }],
  creator: "Resume Optimizer",
  publisher: "Resume Optimizer",
  applicationName: "ATS Resume Analyzer",
  alternates: {
    canonical: baseUrl,
  },
  verification: {
    google: "q94gUpoEiy-PjV3RmRuv8bd0bygI3P3t1pq1d83NQps",
    other: {
      "msvalidate.01": "E167200E6F532FE5A315DC405CF9F7CD",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "ATS Resume Analyzer",
    title: "ATS Resume Analyzer - Free ATS Score Checker & AI Resume Optimizer",
    description:
      "Check your resume against ATS systems. Get an instant ATS score, find missing keywords, and optimize with AI. 10 compatibility checks, FAANG templates, and cover letter generator.",
    images: [
      {
        url: `${baseUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "ATS Resume Analyzer - Free Resume Scoring & Optimization",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ATS Resume Analyzer - Free ATS Score Checker & Resume Optimizer",
    description:
      "75% of resumes are filtered out by ATS. Check your score for free, find missing keywords, and optimize with AI.",
    images: [`${baseUrl}/og-image.svg`],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.svg",
  },
  category: "Technology",
};

// JSON-LD structured data for rich snippets
function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ATS Resume Analyzer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: baseUrl,
    description:
      "Free ATS resume checker with AI-powered optimization, FAANG templates, and cover letter generator.",
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Free Plan",
        description: "3 free scans per day with ATS scoring",
      },
      {
        "@type": "Offer",
        price: "15",
        priceCurrency: "USD",
        name: "Pro Monthly",
        description: "Unlimited scans, AI optimization, FAANG templates",
      },
      {
        "@type": "Offer",
        price: "149",
        priceCurrency: "USD",
        name: "Pro Annual",
        description: "Everything in Pro at 17% savings",
      },
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "2450",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "ATS compatibility scoring",
      "Keyword matching analysis",
      "AI-powered resume optimization",
      "FAANG resume templates",
      "Cover letter generator",
      "DOCX & PDF download",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

function OrganizationJsonLd() {
  const orgData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Resume Optimizer",
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgData) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <JsonLd />
        <OrganizationJsonLd />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID &&
          process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID !== "ca-pub-placeholder" && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
            />
          )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
