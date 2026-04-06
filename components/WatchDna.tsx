"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import type { RankedItem, ReplayVideo } from "../lib/tiktok";

type ReplayPreview = {
  title: string;
  authorName: string | null;
  thumbnailUrl: string | null;
};

type WatchDnaProps = {
  topWatched: ReplayVideo[];
  searchThemes: RankedItem[];
  topSearches: RankedItem[];
  hashtags: string[];
  favoriteSounds: string[];
};

type CategoryRule = {
  name: string;
  note: string;
  keywords: string[];
  tone: string;
};

type CategoryResult = {
  name: string;
  note: string;
  tone: string;
  score: number;
  matched: string[];
  evidence: string[];
};

const CATEGORY_RULES: CategoryRule[] = [
  {
    name: "Music & audio loops",
    note: "Song-driven edits, lyric clips, and sound-led posts appear repeatedly.",
    keywords: [
      "music",
      "song",
      "songs",
      "sound",
      "sounds",
      "lyrics",
      "nightcore",
      "remix",
      "album",
      "track",
      "chief keef",
      "summertime sadness",
      "tum hi ho",
      "let it happen",
      "this fire burns"
    ],
    tone: "from-pink-500/20 to-pink-500/0"
  },
  {
    name: "Football & sports edits",
    note: "Matches, players, finals, and sports narratives show up in your signals.",
    keywords: [
      "football",
      "soccer",
      "sport",
      "sports",
      "goal",
      "mbappe",
      "higuain",
      "fifa",
      "ronaldo",
      "messi",
      "champions league",
      "final"
    ],
    tone: "from-cyan-400/24 to-cyan-400/0"
  },
  {
    name: "Aesthetics & internet culture",
    note: "You return to edits, mood-heavy visuals, and internet micro-aesthetics.",
    keywords: [
      "frutiger",
      "aero",
      "core",
      "edit",
      "edits",
      "aesthetic",
      "vibe",
      "nostalgia",
      "nightcore"
    ],
    tone: "from-fuchsia-500/22 to-fuchsia-500/0"
  },
  {
    name: "Ethiopia & local culture",
    note: "Local references, names, or Ethiopian topics recur in your searches.",
    keywords: [
      "ethiopia",
      "ethiopian",
      "habesha",
      "addis",
      "sheger",
      "wey kumar",
      "yearadoch",
      "hager",
      "veronica adane"
    ],
    tone: "from-sky-400/24 to-sky-400/0"
  },
  {
    name: "Mindset & healing",
    note: "Self-reflection, healing, and personal-growth language appears in your export.",
    keywords: [
      "healing",
      "peoplepleasing",
      "mindset",
      "discipline",
      "motivation",
      "self",
      "growth",
      "productivity"
    ],
    tone: "from-emerald-400/22 to-emerald-400/0"
  },
  {
    name: "Animals & comfort clips",
    note: "Pet and soft-feel content appears in your repeated searches.",
    keywords: ["pet", "pets", "vet", "dog", "dogs", "cat", "cats", "puppy", "kitten"],
    tone: "from-amber-400/22 to-amber-400/0"
  },
  {
    name: "Food & places",
    note: "Restaurants, places, and lifestyle discovery content show up in the data.",
    keywords: ["bistro", "food", "restaurant", "cafe", "coffee", "recipe", "cook"],
    tone: "from-orange-400/22 to-orange-400/0"
  },
  {
    name: "Finance & big ideas",
    note: "Money, finance, and denser intellectual topics appear in your searches.",
    keywords: [
      "private equity",
      "finance",
      "money",
      "business",
      "economics",
      "eugenics",
      "investment"
    ],
    tone: "from-violet-400/22 to-violet-400/0"
  }
];

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function inferWatchDna({
  previews,
  searchThemes,
  topSearches,
  hashtags
}: {
  previews: ReplayPreview[];
  searchThemes: RankedItem[];
  topSearches: RankedItem[];
  hashtags: string[];
}) {
  const results = new Map<
    string,
    {
      rule: CategoryRule;
      score: number;
      evidence: Set<string>;
      matched: Set<string>;
    }
  >();

  function addSignal(text: string | null | undefined, weight: number, source: string) {
    if (!text) return;
    const normalized = normalizeText(text);
    if (!normalized) return;

    CATEGORY_RULES.forEach((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        normalized.includes(normalizeText(keyword))
      );

      if (!matchedKeywords.length) return;

      const current = results.get(rule.name) ?? {
        rule,
        score: 0,
        evidence: new Set<string>(),
        matched: new Set<string>()
      };

      current.score += weight + Math.max(0, matchedKeywords.length - 1);
      current.evidence.add(`${source}: ${text}`);
      matchedKeywords.forEach((keyword) => current.matched.add(keyword));
      results.set(rule.name, current);
    });
  }

  previews.forEach((preview) => {
    addSignal(preview.title, 6, "Replay title");
    addSignal(preview.authorName, 2, "Creator");
  });

  searchThemes.forEach((theme) => {
    addSignal(theme.name, Math.min(6, theme.count + 2), "Search theme");
  });

  topSearches.forEach((term) => {
    addSignal(term.name, Math.min(5, term.count + 1), "Search");
  });

  hashtags.forEach((tag) => {
    addSignal(tag, 3, "Saved hashtag");
  });

  let categories = Array.from(results.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map<CategoryResult>((entry) => ({
      name: entry.rule.name,
      note: entry.rule.note,
      tone: entry.rule.tone,
      score: entry.score,
      matched: Array.from(entry.matched).slice(0, 4),
      evidence: Array.from(entry.evidence).slice(0, 3)
    }));

  if (!categories.length) {
    categories = searchThemes.slice(0, 3).map((theme, index) => ({
      name: titleCase(theme.name),
      note: "Repeated search signal in your export.",
      tone: index % 2 === 0 ? "from-pink-500/20 to-pink-500/0" : "from-cyan-400/24 to-cyan-400/0",
      score: theme.count,
      matched: [theme.name],
      evidence: [`Search theme: ${theme.name}`]
    }));
  }

  const summary =
    categories.length >= 3
      ? `Your feed appears to lean ${categories[0].name.toLowerCase()}, ${categories[1].name.toLowerCase()}, and ${categories[2].name.toLowerCase()}.`
      : categories.length === 2
        ? `Your strongest watch signals point toward ${categories[0].name.toLowerCase()} and ${categories[1].name.toLowerCase()}.`
        : categories.length === 1
          ? `Your clearest watch pattern points toward ${categories[0].name.toLowerCase()}.`
          : "There was not enough metadata to infer strong watch themes from this export.";

  const confidence =
    categories[0]?.score >= 12
      ? "High"
      : categories[0]?.score >= 7
        ? "Medium"
        : "Low";

  return {
    categories,
    summary,
    confidence
  };
}

export default function WatchDna({
  topWatched,
  searchThemes,
  topSearches,
  hashtags,
  favoriteSounds
}: WatchDnaProps) {
  const [previews, setPreviews] = useState<ReplayPreview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topWatched.length) {
      setPreviews([]);
      return;
    }

    let isActive = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    async function loadPreviews() {
      try {
        setLoading(true);
        const results = await Promise.all(
          topWatched.slice(0, 5).map(async (video) => {
            try {
              const response = await fetch(
                `/api/tiktok-preview?url=${encodeURIComponent(video.link)}`,
                { signal: controller.signal }
              );

              if (!response.ok) return null;
              return (await response.json()) as ReplayPreview;
            } catch {
              return null;
            }
          })
        );

        if (isActive) {
          setPreviews(results.filter((item): item is ReplayPreview => item !== null));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadPreviews();

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [topWatched]);

  const analysis = useMemo(
    () =>
      inferWatchDna({
        previews,
        searchThemes,
        topSearches,
        hashtags
      }),
    [hashtags, previews, searchThemes, topSearches]
  );

  return (
    <div className="flex flex-1 flex-col gap-8">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">Watch DNA</p>
          <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
            What your watched videos seem to be about.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
            This is inferred from replay titles, creators, search patterns, and saved
            tags in your export. It is a metadata read, not a full frame-by-frame
            analysis of every watched video.
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
            {analysis.summary}
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Confidence</p>
              <p className="mt-2 text-2xl font-semibold text-white">{analysis.confidence}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Replay metadata</p>
              <p className="mt-2 text-2xl font-semibold text-cyan-300">
                {previews.length}/{Math.min(topWatched.length, 5)}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/45">Search + tags</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {searchThemes.length + hashtags.length + favoriteSounds.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">Signal stack</p>
              <p className="mt-2 text-sm text-white/60">
                The top three inferred watch lanes from your export.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/70">
              {loading ? "Refreshing metadata" : "Inference ready"}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {analysis.categories.length > 0 ? (
              analysis.categories.map((category, index) => (
                <div
                  key={category.name}
                  className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <div
                    className={clsx(
                      "pointer-events-none absolute inset-0 bg-gradient-to-r opacity-100",
                      category.tone
                    )}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                          #{index + 1}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-white">
                          {category.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-300">
                        Score {category.score}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-white/68">{category.note}</p>

                    {category.matched.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {category.matched.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/78"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}

                    {category.evidence.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {category.evidence.map((evidence) => (
                          <p
                            key={evidence}
                            className="rounded-[1rem] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/72"
                          >
                            {evidence}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 text-white/62">
                Not enough metadata was available to infer stable watch themes.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Method</p>
          <p className="mt-4 text-sm leading-7 text-white/68">
            Right now the app reads available export fields plus public TikTok preview
            metadata from replayed links. That means it can infer themes from titles,
            creators, searches, hashtags, and sounds, but it is not scraping full
            watch-history video content.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Best next upgrade</p>
          <p className="mt-4 text-sm leading-7 text-white/68">
            The strongest next step is to enrich more watched links with metadata and
            cluster the resulting titles, authors, hashtags, and sounds into a fuller
            topic graph. That would make this watch profile much sharper.
          </p>
        </div>
      </div>
    </div>
  );
}
