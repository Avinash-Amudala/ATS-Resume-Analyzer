import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed ATS Systems
  const atsSystems = [
    { name: "Greenhouse", parsingType: "semantic", rules: JSON.stringify({ prefersPdf: true, parsesLinks: true }), tips: JSON.stringify(["Use standard section headers", "PDF format preferred", "Keep formatting simple"]) },
    { name: "Lever", parsingType: "semantic", rules: JSON.stringify({ prefersPdf: true, parsesLinks: true }), tips: JSON.stringify(["Lever parses well - focus on content", "Standard headers work best", "PDF or DOCX accepted"]) },
    { name: "Workday", parsingType: "keyword", rules: JSON.stringify({ prefersPdf: false, parsesLinks: false }), tips: JSON.stringify(["Use DOCX format", "Avoid tables and columns", "Plain text formatting works best", "Include all keywords verbatim"]) },
    { name: "Taleo", parsingType: "keyword", rules: JSON.stringify({ prefersPdf: false, parsesLinks: false }), tips: JSON.stringify(["Avoid fancy formatting", "Use standard headers", "DOCX preferred over PDF", "Include exact keywords from JD"]) },
    { name: "iCIMS", parsingType: "hybrid", rules: JSON.stringify({ prefersPdf: true, parsesLinks: true }), tips: JSON.stringify(["Both PDF and DOCX work", "Keep layout single-column", "Standard fonts recommended"]) },
    { name: "SuccessFactors", parsingType: "keyword", rules: JSON.stringify({ prefersPdf: false, parsesLinks: false }), tips: JSON.stringify(["Simple formatting only", "Avoid headers/footers", "Use standard section names"]) },
    { name: "Ashby", parsingType: "semantic", rules: JSON.stringify({ prefersPdf: true, parsesLinks: true }), tips: JSON.stringify(["Modern parser - most formats work", "Focus on content quality", "PDF recommended"]) },
    { name: "BambooHR", parsingType: "hybrid", rules: JSON.stringify({ prefersPdf: true, parsesLinks: false }), tips: JSON.stringify(["PDF preferred", "Standard section headers", "Avoid complex layouts"]) },
  ];

  for (const system of atsSystems) {
    await prisma.atsSystem.upsert({
      where: { name: system.name },
      update: system,
      create: system,
    });
  }

  // Seed ATS Companies (top 50)
  const companies = [
    { companyName: "Google", companyDomain: "google.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Meta", companyDomain: "meta.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Amazon", companyDomain: "amazon.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Apple", companyDomain: "apple.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Microsoft", companyDomain: "microsoft.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Netflix", companyDomain: "netflix.com", atsSystem: "Lever", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Stripe", companyDomain: "stripe.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Airbnb", companyDomain: "airbnb.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Uber", companyDomain: "uber.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Lyft", companyDomain: "lyft.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Salesforce", companyDomain: "salesforce.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Adobe", companyDomain: "adobe.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Oracle", companyDomain: "oracle.com", atsSystem: "Taleo", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "IBM", companyDomain: "ibm.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Intel", companyDomain: "intel.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "NVIDIA", companyDomain: "nvidia.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Tesla", companyDomain: "tesla.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "SpaceX", companyDomain: "spacex.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Twitter/X", companyDomain: "x.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "LinkedIn", companyDomain: "linkedin.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Snap", companyDomain: "snap.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Pinterest", companyDomain: "pinterest.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Spotify", companyDomain: "spotify.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Shopify", companyDomain: "shopify.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Databricks", companyDomain: "databricks.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Snowflake", companyDomain: "snowflake.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Palantir", companyDomain: "palantir.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Coinbase", companyDomain: "coinbase.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Block (Square)", companyDomain: "block.xyz", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Figma", companyDomain: "figma.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Notion", companyDomain: "notion.so", atsSystem: "Ashby", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Vercel", companyDomain: "vercel.com", atsSystem: "Ashby", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Anthropic", companyDomain: "anthropic.com", atsSystem: "Ashby", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "OpenAI", companyDomain: "openai.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Cloudflare", companyDomain: "cloudflare.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Datadog", companyDomain: "datadog.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "MongoDB", companyDomain: "mongodb.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "HashiCorp", companyDomain: "hashicorp.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Twilio", companyDomain: "twilio.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Atlassian", companyDomain: "atlassian.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Cisco", companyDomain: "cisco.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "VMware", companyDomain: "vmware.com", atsSystem: "Workday", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Zoom", companyDomain: "zoom.us", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Slack", companyDomain: "slack.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Dropbox", companyDomain: "dropbox.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "DoorDash", companyDomain: "doordash.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Instacart", companyDomain: "instacart.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Robinhood", companyDomain: "robinhood.com", atsSystem: "Greenhouse", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Plaid", companyDomain: "plaid.com", atsSystem: "Lever", acceptsPdf: true, acceptsDocx: true, verified: true },
    { companyName: "Ramp", companyDomain: "ramp.com", atsSystem: "Ashby", acceptsPdf: true, acceptsDocx: true, verified: true },
  ];

  for (const company of companies) {
    const existing = await prisma.atsCompany.findFirst({
      where: { companyName: company.companyName },
    });
    if (!existing) {
      await prisma.atsCompany.create({ data: company });
    }
  }

  // Seed Templates
  const templates = [
    { name: "Classic Clean", description: "Maximum ATS compatibility with clean, single-column layout. Calibri font, standard sections.", tier: "free", sortOrder: 1, styleConfig: JSON.stringify({ font: { name: "Calibri", size: 22 }, headingFont: { name: "Calibri", size: 28, bold: true }, colors: { heading: "000000", body: "000000", secondary: "475569" }, margins: { top: 720, bottom: 720, left: 720, right: 720 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "experience", "education", "skills", "certifications", "projects"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Google SWE", description: "Compact, metric-heavy format for FAANG. Garamond font, single page focus.", tier: "pro", sortOrder: 2, styleConfig: JSON.stringify({ font: { name: "Garamond", size: 20 }, headingFont: { name: "Garamond", size: 26, bold: true }, colors: { heading: "2563eb", body: "000000", secondary: "475569" }, margins: { top: 624, bottom: 624, left: 624, right: 624 }, spacing: { beforeSection: 200, afterSection: 100, lineHeight: 220 }, sectionOrder: ["contact", "summary", "experience", "education", "skills"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Amazon LP", description: "STAR format bullets aligned with Amazon Leadership Principles.", tier: "pro", sortOrder: 3, styleConfig: JSON.stringify({ font: { name: "Arial", size: 22 }, headingFont: { name: "Arial", size: 28, bold: true }, colors: { heading: "FF9900", body: "000000", secondary: "475569" }, margins: { top: 720, bottom: 720, left: 720, right: 720 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "experience", "skills", "certifications"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Startup Bold", description: "Modern design for startup culture. Personality-forward.", tier: "pro", sortOrder: 4, styleConfig: JSON.stringify({ font: { name: "Calibri", size: 21 }, headingFont: { name: "Calibri", size: 26, bold: true }, colors: { heading: "7c3aed", body: "000000", secondary: "475569" }, margins: { top: 768, bottom: 768, left: 768, right: 768 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "experience", "projects", "skills"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Enterprise", description: "Conservative format for large organizations. Times New Roman, formal.", tier: "pro", sortOrder: 5, styleConfig: JSON.stringify({ font: { name: "Times New Roman", size: 24 }, headingFont: { name: "Times New Roman", size: 28, bold: true }, colors: { heading: "1e3a5f", body: "000000", secondary: "475569" }, margins: { top: 960, bottom: 960, left: 960, right: 960 }, spacing: { beforeSection: 280, afterSection: 140, lineHeight: 260 }, sectionOrder: ["contact", "summary", "experience", "education", "certifications", "skills"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Research/PhD", description: "Publications-first layout for academic and research roles.", tier: "pro", sortOrder: 6, styleConfig: JSON.stringify({ font: { name: "Cambria", size: 22 }, headingFont: { name: "Cambria", size: 28, bold: true }, colors: { heading: "1e40af", body: "000000", secondary: "475569" }, margins: { top: 960, bottom: 960, left: 960, right: 960 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "education", "certifications", "experience", "skills", "projects"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "Career Switcher", description: "Skills-first functional hybrid emphasizing transferable skills.", tier: "pro", sortOrder: 7, styleConfig: JSON.stringify({ font: { name: "Calibri", size: 22 }, headingFont: { name: "Calibri", size: 28, bold: true }, colors: { heading: "0d9488", body: "000000", secondary: "475569" }, margins: { top: 720, bottom: 720, left: 720, right: 720 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "skills", "experience", "education", "projects"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
    { name: "New Grad", description: "Education and projects prominent for entry-level candidates.", tier: "free", sortOrder: 8, styleConfig: JSON.stringify({ font: { name: "Calibri", size: 22 }, headingFont: { name: "Calibri", size: 28, bold: true }, colors: { heading: "3b82f6", body: "000000", secondary: "475569" }, margins: { top: 720, bottom: 720, left: 720, right: 720 }, spacing: { beforeSection: 240, afterSection: 120, lineHeight: 240 }, sectionOrder: ["contact", "summary", "education", "projects", "skills", "experience", "certifications"], bulletStyle: "\u2022", dateFormat: "MMM YYYY" }) },
  ];

  for (const template of templates) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name },
    });
    if (!existing) {
      await prisma.template.create({ data: template });
    }
  }

  console.log("Seed complete: 8 ATS systems, 50 companies, 8 templates");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
