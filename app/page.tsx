"use client";

import { startTransition, useEffect, useState } from "react";
import UploadCard from "../components/UploadCard";
import WrappedSection from "../components/WrappedSection";
import StatCard from "../components/StatCard";
import ReplayCard from "../components/ReplayCard";
import WatchDna from "../components/WatchDna";
import BrandMark from "../components/BrandMark";
import { parseTikTokExport, type WrappedData } from "../lib/tiktok";
import { siteConfig } from "../lib/site";

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return value.toLocaleString();
}

function formatCompact(value: number) {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatDateLabel(value: string | null | undefined) {
  if (!value) return "N/A";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined) {
  if (!start && !end) return "No dated records found";
  if (start && end) return `${formatDateLabel(start)} - ${formatDateLabel(end)}`;
  return formatDateLabel(start ?? end);
}

export default function Home() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [wrapped, setWrapped] = useState<WrappedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "ready">("idle");
  const [activeSlide, setActiveSlide] = useState("hero");
  const [shareStatus, setShareStatus] = useState<"idle" | "shared" | "copied" | "error">(
    "idle"
  );
  const [avatarFailed, setAvatarFailed] = useState(false);

  const slideLinks = wrapped
    ? [
        { id: "hero", label: "Start" },
        { id: "overview", label: "Profile" },
        { id: "snapshot", label: "Snapshot" },
        { id: "tempo", label: "Tempo" },
        { id: "timeline", label: "Timeline" },
        { id: "curiosity", label: "Curiosity" },
        { id: "replays", label: "Replays" },
        { id: "dna", label: "DNA" },
        { id: "social", label: "Social" },
        { id: "vibe", label: "Vibe" }
      ]
    : [{ id: "hero", label: "Start" }];

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-slide-root]");
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-slide-section]")
    );

    if (!root || !sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveSlide(visible.target.id);
        }
      },
      {
        root,
        threshold: [0.3, 0.5, 0.8]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [wrapped]);

  useEffect(() => {
    if (!wrapped) return;

    const handle = window.setTimeout(() => {
      document.getElementById("overview")?.scrollIntoView({ behavior: "smooth" });
    }, 180);

    return () => window.clearTimeout(handle);
  }, [wrapped]);

  useEffect(() => {
    if (shareStatus === "idle") return;

    const handle = window.setTimeout(() => {
      setShareStatus("idle");
    }, 2400);

    return () => window.clearTimeout(handle);
  }, [shareStatus]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [wrapped?.profile.avatarUrl]);

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  async function copyShareLink() {
    const url = getShareUrl();
    if (!url || !navigator.clipboard?.writeText) {
      throw new Error("Clipboard unavailable");
    }

    await navigator.clipboard.writeText(url);
  }

  async function handleFile(file: File) {
    setError(null);
    setWrapped(null);
    setFileName(file.name);
    setStatus("parsing");

    try {
      const text = await file.text();

      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 0);
      });

      const parsed = parseTikTokExport(JSON.parse(text) as unknown);

      startTransition(() => {
        setWrapped(parsed);
        setStatus("ready");
      });
    } catch {
      setError("Could not parse this TikTok export. Upload the raw JSON file from TikTok.");
      setStatus("idle");
      setWrapped(null);
    }
  }

  async function handleShareSite() {
    const url = getShareUrl();
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "TikTok Wrapped",
          text: "Turn your TikTok export into a full-screen wrapped-style deck.",
          url
        });
        setShareStatus("shared");
        return;
      }

      await copyShareLink();
      setShareStatus("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      try {
        await copyShareLink();
        setShareStatus("copied");
      } catch {
        setShareStatus("error");
      }
    }
  }

  async function handleCopyLink() {
    try {
      await copyShareLink();
      setShareStatus("copied");
    } catch {
      setShareStatus("error");
    }
  }

  const shareStatusLabel =
    shareStatus === "shared"
      ? "Share sheet opened."
      : shareStatus === "copied"
        ? "Link copied."
        : shareStatus === "error"
          ? "Sharing is not available in this browser."
          : "Best on mobile: use the share sheet for Stories, DMs, and link posts.";

  return (
    <main
      className="h-screen snap-y snap-mandatory overflow-y-auto bg-[#050505]"
      data-slide-root
    >
      {slideLinks.length > 1 && (
        <>
          <nav className="pointer-events-none fixed right-4 top-1/2 z-50 hidden -translate-y-1/2 lg:block">
            <div className="pointer-events-auto rounded-full border border-white/10 bg-black/45 p-2 backdrop-blur">
              <div className="flex flex-col gap-2">
                {slideLinks.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    aria-label={item.label}
                    className={`h-3 w-3 rounded-full transition ${
                      activeSlide === item.id
                        ? "bg-[#fe2c55] shadow-[0_0_18px_rgba(254,44,85,0.82)]"
                        : "bg-white/20 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </nav>

          <div className="fixed left-4 top-4 z-50 hidden rounded-full border border-white/10 bg-black/45 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 backdrop-blur lg:block">
            {String(slideLinks.findIndex((slide) => slide.id === activeSlide) + 1).padStart(
              2,
              "0"
            )}
            /{String(slideLinks.length).padStart(2, "0")}
          </div>
        </>
      )}

      <WrappedSection id="hero" theme="sunset">
        <div className="grid flex-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:items-center">
          <div className="relative">
            <div className="absolute -left-8 top-0 hidden h-40 w-40 rounded-full bg-pink-500/20 blur-3xl md:block" />
            <div className="absolute left-1/3 top-40 hidden h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl md:block" />
            <BrandMark />
            <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.9] tracking-[-0.04em] text-white sm:text-7xl lg:text-[5.75rem]">
              Your TikTok habits, laid out like a real album drop.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg">
              Upload your TikTok export and this app turns watch history, likes,
              searches, shares, and repeat plays into a Spotify-style slide deck
              you can explore and share.
            </p>

            {wrapped && (
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                  @{wrapped.profile.username}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                  {formatNumber(wrapped.totals.watches)} watches
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                  Peak time {wrapped.peakHourLabel}
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
                  Export window {formatDateRange(wrapped.coverage.start, wrapped.coverage.end)}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-6 hidden h-28 w-28 rounded-full border border-white/10 bg-[#25f4ee]/15 blur-2xl md:block" />
            <UploadCard
              onFile={handleFile}
              fileName={fileName}
              error={error}
              loading={status === "parsing"}
            />
            <p className="mt-4 px-1 text-sm text-white/55">
              Best input: the full `user_data_tiktok.json` export. The analysis
              is local first, with replay thumbnails pulled from public TikTok
              embed metadata.
            </p>
            {wrapped && (
              <p className="mt-2 px-1 text-sm text-white/45">
                This report only reflects dated activity found between{" "}
                {formatDateRange(wrapped.coverage.start, wrapped.coverage.end)} in the
                uploaded export, not necessarily your full lifetime TikTok history.
              </p>
            )}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-sm text-white/45">
          <span>Scroll to move between slides</span>
          <span className="hidden md:inline">Full-screen slides tuned for mobile and desktop</span>
        </div>
      </WrappedSection>

      {wrapped && (
        <>
          <WrappedSection id="overview" theme="tiktok">
            <div className="grid flex-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(160deg,rgba(254,44,85,0.16),rgba(37,244,238,0.12))] blur-3xl" />
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="relative mx-auto aspect-square max-w-[220px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
                    {wrapped.profile.avatarUrl && !avatarFailed ? (
                      <img
                        src={wrapped.profile.avatarUrl}
                        alt={wrapped.profile.username}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,_rgba(254,44,85,0.82),_rgba(37,244,238,0.34),_rgba(16,16,16,1))] text-5xl font-semibold uppercase text-white">
                        {wrapped.profile.username.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                      Profile Readout
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">
                      @{wrapped.profile.username}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/65">
                      {wrapped.profile.bio}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                  Overview
                </p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  A behavior profile built from how you watch, search, save, and replay.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
                  This export shows a much stronger consumer pattern than creator
                  pattern, so the experience is now centered on viewing behavior,
                  session tempo, and repeat interests instead of post analytics.
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Active days"
                    value={formatNumber(wrapped.totals.activeDays)}
                    accent="cyan"
                  />
                  <StatCard
                    label="Longest streak"
                    value={`${wrapped.totals.longestStreak} days`}
                    highlight
                    pulse
                  />
                  <StatCard
                    label="Peak weekday"
                    value={wrapped.peakWeekdayLabel}
                    accent="cyan"
                  />
                  <StatCard
                    label="Likes received"
                    value={formatNumber(wrapped.profile.likesReceived)}
                  />
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {wrapped.rates.map((rate, index) => (
                    <StatCard
                      key={rate.label}
                      label={rate.label}
                      value={rate.value}
                      accent={index % 2 === 0 ? "cyan" : "pink"}
                    />
                  ))}
                </div>
              </div>
            </div>
          </WrappedSection>

          <WrappedSection id="snapshot" theme="pink">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Snapshot
              </p>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-4xl font-semibold text-white sm:text-5xl">
                    Your raw activity counts.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                    These are the anchors for the rest of the deck. They describe
                    scale, intensity, and how broad your TikTok use actually is.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  {formatCompact(wrapped.totals.uniqueVideos)} unique videos watched
                </div>
              </div>
            </div>

            <div className="mt-10 grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Videos watched" value={formatNumber(wrapped.totals.watches)} accent="cyan" />
              <StatCard label="Likes given" value={formatNumber(wrapped.totals.likes)} highlight pulse />
              <StatCard label="Favorites" value={formatNumber(wrapped.totals.favorites)} accent="cyan" />
              <StatCard label="Searches" value={formatNumber(wrapped.totals.searches)} />
              <StatCard label="Shares" value={formatNumber(wrapped.totals.shares)} accent="cyan" />
              <StatCard label="Comments" value={formatNumber(wrapped.totals.comments)} />
              <StatCard label="Following" value={formatNumber(wrapped.totals.following)} accent="cyan" />
              <StatCard label="Followers" value={formatNumber(wrapped.totals.followers)} />
            </div>
          </WrappedSection>

          <WrappedSection id="tempo" theme="cyan">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Tempo
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                When and how hard you scroll.
              </h2>
            </div>

            <div className="mt-8 grid flex-1 gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="grid gap-4 md:grid-cols-2">
                {wrapped.insights.map((insight, index) => (
                  <StatCard
                    key={insight.label}
                    label={insight.label}
                    value={insight.value}
                    accent={index % 2 === 0 ? "cyan" : "pink"}
                  />
                ))}
                <StatCard
                  label="Session count"
                  value={formatNumber(wrapped.sessions.count)}
                  accent="cyan"
                />
                <StatCard
                  label="Average session"
                  value={`${wrapped.sessions.averageMinutes} min`}
                />
                <StatCard
                  label="Longest session"
                  value={`${wrapped.sessions.longestMinutes} min`}
                  accent="cyan"
                />
                <StatCard
                  label="Replay pattern"
                  value={wrapped.rates.find((rate) => rate.label === "Replay rate")?.value ?? "N/A"}
                />
              </div>

              <div className="grid gap-6">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                        Hourly rhythm
                      </p>
                      <p className="mt-2 text-sm text-white/65">
                        Peak time lands around {wrapped.peakHourLabel}.
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/70">
                      24-hour view
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-12">
                    {(() => {
                      const maxHour = Math.max(...wrapped.activeHours, 1);
                      return wrapped.activeHours.map((count, hour) => (
                        <div key={hour} className="flex flex-col items-center gap-2">
                          <div className="flex h-28 w-4 items-end rounded-full bg-white/6">
                            <div
                              className="w-4 rounded-full bg-[linear-gradient(180deg,#fe2c55,#25f4ee)]"
                              style={{
                                height: `${Math.max(8, Math.round((count / maxHour) * 100))}%`
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-white/45">
                            {String(hour).padStart(2, "0")}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                    Weekday rhythm
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-7">
                    {(() => {
                      const maxDay = Math.max(
                        ...wrapped.weekdayActivity.map((day) => day.value),
                        1
                      );

                      return wrapped.weekdayActivity.map((day) => (
                        <div
                          key={day.label}
                          className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.25em] text-white/45">
                            {day.label}
                          </p>
                          <div className="mt-4 h-2 rounded-full bg-white/10">
                            <div
                              className="h-2 rounded-full bg-pink-400"
                              style={{
                                width: `${Math.max(
                                  10,
                                  Math.round((day.value / maxDay) * 100)
                                )}%`
                              }}
                            />
                          </div>
                          <p className="mt-3 text-sm text-white/70">
                            {formatCompact(day.value)}
                          </p>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </WrappedSection>

          <WrappedSection id="timeline" theme="pink">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                  Timeline
                </p>
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                  Your activity curve across the year.
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                  Watch volume, likes, searches, shares, and comments plotted month
                  by month from the dates that exist in your export.
                </p>
              </div>

              <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  Export window
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {formatDateRange(wrapped.coverage.start, wrapped.coverage.end)}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  This app only analyzes the dated records present in the uploaded
                  `user_data_tiktok.json`. That window may be a partial snapshot,
                  not your full account history.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {wrapped.coverage.sections.map((section) => (
                    <div
                      key={section.label}
                      className="rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-white/45">
                        {section.label}
                      </p>
                      <p className="mt-2 text-sm font-medium text-white/85">
                        {formatDateRange(section.start, section.end)}
                      </p>
                      <p className="mt-1 text-xs text-white/50">
                        {formatCompact(section.count)} records
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex-1 overflow-x-auto pb-2">
              <div className="flex min-w-max items-end gap-4">
                {wrapped.activityByMonth.map((month) => {
                  const maxMonth = Math.max(
                    ...wrapped.activityByMonth.map((item) =>
                      Math.max(
                        item.watch,
                        item.likes,
                        item.searches,
                        item.shares,
                        item.comments
                      )
                    ),
                    1
                  );

                  return (
                    <div
                      key={month.key}
                      className="w-[160px] rounded-[1.8rem] border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                        {month.label}
                      </p>
                      <div className="mt-5 space-y-3 text-xs text-white/50">
                        {[
                          { label: "Watch", value: month.watch, color: "bg-pink-400" },
                          { label: "Likes", value: month.likes, color: "bg-cyan-400" },
                          {
                            label: "Search",
                            value: month.searches,
                            color: "bg-[#25f4ee]"
                          },
                          { label: "Share", value: month.shares, color: "bg-white/70" }
                        ].map((item) => (
                          <div key={item.label}>
                            <div className="mb-1 flex items-center justify-between">
                              <span>{item.label}</span>
                              <span>{formatCompact(item.value)}</span>
                            </div>
                            <div className="h-2 rounded-full bg-white/10">
                              <div
                                className={`h-2 rounded-full ${item.color}`}
                                style={{
                                  width: `${Math.max(
                                    8,
                                    Math.round((item.value / maxMonth) * 100)
                                  )}%`
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </WrappedSection>

          <WrappedSection id="curiosity" theme="cyan">
            <div className="grid flex-1 gap-8 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                  Curiosity
                </p>
                <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                  What you keep coming back to in search.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-white/65">
                  Exact searches can be noisy, so the deck shows both literal
                  queries and recurring search themes extracted from the text.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {wrapped.searchThemes.length > 0 ? (
                    wrapped.searchThemes.map((theme) => (
                      <span
                        key={theme.name}
                        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80"
                      >
                        {theme.name} <span className="text-white/45">{theme.count}</span>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">No search themes available.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                      Search stack
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Top repeated terms, or most recent unique terms when repeats are rare.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
                    {formatNumber(wrapped.totals.searches)} searches
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {wrapped.topSearches.length > 0 ? (
                    wrapped.topSearches.map((term, index) => (
                      <div
                        key={`${term.name}-${index}`}
                        className="flex items-center justify-between rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/80"
                      >
                        <span className="max-w-[80%] truncate">{term.name}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-300">
                          {term.count}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">No search data available.</p>
                  )}
                </div>
              </div>
            </div>
          </WrappedSection>

          <WrappedSection id="replays" theme="sunset">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Replays
              </p>
              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-4xl font-semibold text-white sm:text-5xl">
                    Your most replayed videos.
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-white/65">
                    These cards try to fetch TikTok thumbnail metadata using the
                    official oEmbed response, then fall back gracefully when the
                    public preview is unavailable.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
                  Based on repeated watch links in your export
                </div>
              </div>
            </div>

            <div className="mt-8 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
              {wrapped.topWatched.length > 0 ? (
                wrapped.topWatched.map((video, index) => (
                  <ReplayCard key={video.link} index={index + 1} video={video} />
                ))
              ) : (
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white/65">
                  No replay clusters were strong enough to display.
                </div>
              )}
            </div>
          </WrappedSection>

          <WrappedSection id="dna" theme="tiktok">
            <WatchDna
              topWatched={wrapped.topWatched}
              searchThemes={wrapped.searchThemes}
              topSearches={wrapped.topSearches}
              hashtags={wrapped.hashtags}
              favoriteSounds={wrapped.favoriteSounds}
            />
          </WrappedSection>

          <WrappedSection id="social" theme="tiktok">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                Social
              </p>
              <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
                How you share, save, and message on TikTok.
              </h2>
            </div>

            <div className="mt-8 grid flex-1 gap-6 xl:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Share methods
                </p>
                <div className="mt-5 space-y-3">
                  {wrapped.shareMethods.length > 0 ? (
                    wrapped.shareMethods.map((method) => (
                      <div
                        key={method.name}
                        className="flex items-center justify-between rounded-[1.25rem] bg-black/20 px-4 py-3 text-sm text-white/80"
                      >
                        <span>{method.name}</span>
                        <span className="text-cyan-300">{method.count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/55">No share methods available.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Saved tastes
                </p>
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-sm text-white/45">Hashtags</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {wrapped.hashtags.length > 0 ? (
                        wrapped.hashtags.slice(0, 8).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-white/75"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-white/55">No hashtag saves</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-white/45">Favorite sounds</p>
                    <div className="mt-3 space-y-2">
                      {wrapped.favoriteSounds.length > 0 ? (
                        wrapped.favoriteSounds.slice(0, 4).map((sound, index) => (
                          <a
                            key={`${sound}-${index}`}
                            href={sound}
                            target="_blank"
                            rel="noreferrer"
                            className="block rounded-[1.25rem] bg-black/20 px-4 py-3 text-sm text-white/75 transition hover:bg-black/30 hover:text-white"
                          >
                            {sound}
                          </a>
                        ))
                      ) : (
                        <span className="text-sm text-white/55">No sound saves</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                  Connections
                </p>
                <div className="mt-5">
                  <p className="text-sm text-white/45">Favorite people to chat</p>
                  <div className="mt-3 space-y-3">
                    {wrapped.topChatContacts.length > 0 ? (
                      wrapped.topChatContacts.map((chat, index) => (
                        <div
                          key={chat.name}
                          className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                #{index + 1}
                              </p>
                              <p className="mt-1 truncate text-sm font-medium text-white/88">
                                {chat.name}
                              </p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                              {chat.messages} msgs
                            </span>
                          </div>
                          <p className="mt-2 text-xs text-white/52">
                            Sent {chat.sent} · Received {chat.received}
                            {chat.lastDate ? ` · Last ${formatDateLabel(chat.lastDate)}` : ""}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/55">No direct message threads found.</p>
                    )}
                  </div>
                  {wrapped.topChatContacts.length > 0 && wrapped.topChatContacts.length < 3 ? (
                    <p className="mt-3 text-xs text-white/45">
                      Only {wrapped.topChatContacts.length} chat thread
                      {wrapped.topChatContacts.length === 1 ? "" : "s"} appeared in this
                      export.
                    </p>
                  ) : null}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      label: "Following",
                      value: formatNumber(wrapped.totals.following)
                    },
                    {
                      label: "Followers",
                      value: formatNumber(wrapped.totals.followers)
                    },
                    {
                      label: "Favorite effects",
                      value: formatNumber(wrapped.totals.favoriteEffects)
                    },
                    {
                      label: "Saved hashtags",
                      value: formatNumber(wrapped.totals.hashtags)
                    }
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className="rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.22em] text-white/42">
                        {item.label}
                      </p>
                      <p className={`mt-2 text-xl font-semibold ${index % 2 === 0 ? "text-cyan-300" : "text-white"}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </WrappedSection>

          <WrappedSection id="vibe" theme="pink">
            <div className="flex flex-1 flex-col justify-between gap-8">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/55">
                  Closing track
                </p>
                <h2 className="mt-4 max-w-4xl text-5xl font-semibold leading-[0.95] text-white sm:text-6xl">
                  Your TikTok vibe
                </h2>
                <p className="mt-8 max-w-4xl text-xl leading-9 text-white/78 sm:text-2xl">
                  {wrapped.vibe}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Best signal
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {wrapped.peakHourLabel}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    That is when your history clusters hardest, so it is the most reliable
                    indicator of your default scroll window.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Strongest pattern
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    {wrapped.searchThemes[0]?.name ?? "steady browsing"}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    Search themes are a better behavioral signal than one-off queries because
                    they show where your curiosity compounds.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Share this site
                  </p>
                  <p className="mt-4 text-2xl font-semibold text-white">
                    Send the link
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/60">
                    On mobile, the native share sheet can push the site into Stories,
                    DMs, or anywhere else that accepts links.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleShareSite}
                      className="rounded-full bg-[#fe2c55] px-4 py-2 text-sm font-medium text-white transition duration-200 hover:scale-[1.02] hover:bg-[#ff4d72]"
                    >
                      Share this site
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:scale-[1.02] hover:bg-white/10"
                    >
                      Copy link
                    </button>
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-cyan-300/85">
                    {shareStatusLabel}
                  </p>
                </div>
              </div>

              <footer className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/50 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <BrandMark compact className="shrink-0" />
                  <p>
                    <span className="text-white/72">{siteConfig.creditName}</span>
                    {" · "}
                    Original TikTok Wrapped experience. Data stays in the browser unless a
                    public TikTok preview is requested. Not affiliated with TikTok or
                    Spotify.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {siteConfig.creditUrl ? (
                    <a
                      href={siteConfig.creditUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/72 transition hover:bg-white/10 hover:text-white"
                    >
                      Credits
                    </a>
                  ) : null}
                  {siteConfig.xHandle ? (
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-cyan-300">
                      {siteConfig.xHandle}
                    </span>
                  ) : null}
                </div>
              </footer>
            </div>
          </WrappedSection>
        </>
      )}
    </main>
  );
}
