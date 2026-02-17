import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/optimize(.*)",
  "/api/scan(.*)",
  "/api/optimize(.*)",
  "/api/resumes(.*)",
  "/api/download(.*)",
  "/api/subscription(.*)",
  "/api/cover-letter(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/analyze",
  "/templates",
  "/cover-letter",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/health",
  "/api/webhooks(.*)",
  "/api/indexnow(.*)",
  "/api/ats(.*)",
  "/api/templates",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
