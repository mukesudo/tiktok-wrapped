"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import type { ReplayVideo } from "../lib/tiktok";

type ReplayPreview = {
  title: string;
  authorName: string | null;
  authorUrl: string | null;
  thumbnailUrl: string | null;
};

type ReplayCardProps = {
  index: number;
  video: ReplayVideo;
  className?: string;
};

export default function ReplayCard({
  index,
  video,
  className
}: ReplayCardProps) {
  const [preview, setPreview] = useState<ReplayPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbnailFailed, setThumbnailFailed] = useState(false);

  useEffect(() => {
    setThumbnailFailed(false);
  }, [video.link]);

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    async function loadPreview() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/tiktok-preview?url=${encodeURIComponent(video.link)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Preview request failed");
        }

        const data = (await response.json()) as ReplayPreview;
        if (isActive) {
          setPreview(data);
        }
      } catch {
        if (isActive) {
          setPreview(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadPreview();

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [video.link]);

  return (
    <article
      className={clsx(
        "group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur",
        className
      )}
    >
      <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/40" />
          <div className="relative aspect-[9/16]">
            {preview?.thumbnailUrl && !thumbnailFailed ? (
              <img
                src={preview.thumbnailUrl}
                alt={preview.title ?? `Replay ${index}`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setThumbnailFailed(true)}
              />
            ) : (
              <div className="flex h-full items-end bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_46%),linear-gradient(160deg,_rgba(236,72,153,0.85),_rgba(14,165,233,0.35)_58%,_rgba(10,10,10,1))] p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Replay #{index}
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {video.videoId}
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-white/80">
            {video.count.toLocaleString()} replays
          </div>
        </div>

        <div className="flex min-w-0 flex-col justify-between gap-4 py-2">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Most Replayed
            </p>
            <h3 className="mt-3 text-2xl font-semibold leading-tight text-white">
              {preview?.title ?? `TikTok video ${video.videoId}`}
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/65">
              {preview?.authorName
                ? `By ${preview.authorName}`
                : loading
                ? "Loading TikTok preview metadata"
                : "Public preview metadata was not available for this replay."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <a
              href={video.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-white px-4 py-2 font-medium text-black transition hover:bg-white/90"
            >
              Open on TikTok
            </a>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/70">
              Video ID {video.videoId}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
