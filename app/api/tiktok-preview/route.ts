import { NextRequest, NextResponse } from "next/server";
import { extractVideoIdFromUrl } from "../../../lib/tiktok";

export const runtime = "nodejs";

type TikTokOEmbedResponse = {
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
};

const TIKTOK_HOSTS = ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "www.tiktokv.com"];
const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  accept: "text/html,application/json"
};

function isTikTokUrl(url: string) {
  try {
    const parsed = new URL(url);
    return TIKTOK_HOSTS.includes(parsed.hostname);
  } catch {
    return false;
  }
}

function extractMeta(html: string, property: string) {
  const pattern = new RegExp(
    `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  return html.match(pattern)?.[1];
}

async function fetchOEmbed(url: string) {
  const response = await fetch(
    `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    {
      headers: REQUEST_HEADERS,
      next: { revalidate: 60 * 60 * 24 }
    }
  );

  if (!response.ok) return null;
  const data = (await response.json()) as TikTokOEmbedResponse;
  if (!data.thumbnail_url && !data.title) return null;
  return data;
}

export async function GET(request: NextRequest) {
  const sourceUrl = request.nextUrl.searchParams.get("url");
  if (!sourceUrl || !isTikTokUrl(sourceUrl)) {
    return NextResponse.json({ error: "Invalid TikTok URL." }, { status: 400 });
  }

  const candidates = new Set<string>([sourceUrl]);
  const videoId = extractVideoIdFromUrl(sourceUrl);
  let html: string | null = null;
  let resolvedUrl = sourceUrl;

  try {
    const response = await fetch(sourceUrl, {
      headers: REQUEST_HEADERS,
      redirect: "follow",
      next: { revalidate: 60 * 60 * 24 }
    });

    resolvedUrl = response.url || sourceUrl;
    if (resolvedUrl) candidates.add(resolvedUrl);
    html = await response.text();
  } catch {
    html = null;
  }

  if (videoId) {
    candidates.add(`https://www.tiktok.com/@_/video/${videoId}`);
  }

  for (const candidate of candidates) {
    try {
      const oembed = await fetchOEmbed(candidate);
      if (oembed) {
        return NextResponse.json(
          {
            videoId,
            sourceUrl,
            resolvedUrl: candidate,
            title: oembed.title ?? `TikTok video ${videoId}`,
            authorName: oembed.author_name ?? null,
            authorUrl: oembed.author_url ?? null,
            thumbnailUrl: oembed.thumbnail_url ?? null,
            providerName: oembed.provider_name ?? "TikTok"
          },
          {
            headers: {
              "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800"
            }
          }
        );
      }
    } catch {
      continue;
    }
  }

  if (html) {
    const title =
      extractMeta(html, "og:title") ??
      extractMeta(html, "twitter:title") ??
      `TikTok video ${videoId}`;
    const thumbnailUrl =
      extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");

    return NextResponse.json(
      {
        videoId,
        sourceUrl,
        resolvedUrl,
        title,
        authorName: null,
        authorUrl: null,
        thumbnailUrl: thumbnailUrl ?? null,
        providerName: "TikTok"
      },
      {
        headers: {
          "Cache-Control": "s-maxage=86400, stale-while-revalidate=604800"
        }
      }
    );
  }

  return NextResponse.json(
    {
      videoId,
      sourceUrl,
      resolvedUrl,
      title: `TikTok video ${videoId}`,
      authorName: null,
      authorUrl: null,
      thumbnailUrl: null,
      providerName: "TikTok"
    },
    {
      headers: {
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      }
    }
  );
}
