export const siteConfig = {
  name: "TikTok Wrapped",
  shortName: "TT Wrapped",
  description:
    "Upload your TikTok export and explore a Spotify-style behavior report with watch rhythms, replay patterns, and curiosity themes.",
  keywords: [
    "tiktok wrapped",
    "tiktok analytics",
    "tiktok behavior analyzer",
    "tiktok data export",
    "tiktok json viewer",
    "spotify wrapped style",
    "next.js tiktok project",
    "react tiktok dashboard"
  ],
  creditName: process.env.NEXT_PUBLIC_SITE_CREDIT_NAME ?? "Built by @mukesudo",
  creditUrl: process.env.NEXT_PUBLIC_SITE_CREDIT_URL ?? "",
  xHandle: process.env.NEXT_PUBLIC_SITE_X_HANDLE ?? "",
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION ?? ""
};

export function getSiteUrl() {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://example.com");

  return url.replace(/\/$/, "");
}
