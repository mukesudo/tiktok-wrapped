export type RankedItem = {
  name: string;
  count: number;
};

export type ReplayVideo = {
  link: string;
  count: number;
  videoId: string;
};

export type MonthBucket = {
  key: string;
  label: string;
  watch: number;
  likes: number;
  searches: number;
  shares: number;
  comments: number;
};

export type DayBucket = {
  label: string;
  value: number;
};

export type ChatContact = {
  name: string;
  messages: number;
  sent: number;
  received: number;
  lastDate: string | null;
};

export type CoverageSection = {
  label: string;
  start: string | null;
  end: string | null;
  count: number;
};

export type ExportCoverage = {
  start: string | null;
  end: string | null;
  days: number;
  sections: CoverageSection[];
};

export type SessionStats = {
  count: number;
  averageMinutes: number;
  longestMinutes: number;
  averageVideos: number;
};

export type ProfileSummary = {
  username: string;
  bio: string;
  avatarUrl?: string;
  likesReceived: number | null;
  birthDate?: string;
};

export type WrappedData = {
  profile: ProfileSummary;
  totals: {
    watches: number;
    uniqueVideos: number;
    likes: number;
    favorites: number;
    searches: number;
    shares: number;
    comments: number;
    following: number;
    followers: number;
    favoriteSounds: number;
    favoriteEffects: number;
    hashtags: number;
    activeDays: number;
    longestStreak: number;
  };
  sessions: SessionStats;
  rates: Array<{ label: string; value: string }>;
  insights: Array<{ label: string; value: string }>;
  activityByMonth: MonthBucket[];
  activeHours: number[];
  weekdayActivity: DayBucket[];
  peakHourLabel: string;
  peakWeekdayLabel: string;
  topSearches: RankedItem[];
  searchThemes: RankedItem[];
  shareMethods: RankedItem[];
  topWatched: ReplayVideo[];
  topChatContacts: ChatContact[];
  hashtags: string[];
  favoriteSounds: string[];
  favoriteEffects: string[];
  coverage: ExportCoverage;
  vibe: string;
};

type ActivityEntry = Record<string, unknown>;

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SESSION_GAP_MS = 30 * 60 * 1000;
const SEARCH_STOP_WORDS = new Set([
  "a",
  "about",
  "after",
  "all",
  "am",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "can",
  "do",
  "for",
  "from",
  "get",
  "going",
  "has",
  "have",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "its",
  "me",
  "my",
  "of",
  "on",
  "or",
  "so",
  "that",
  "the",
  "their",
  "this",
  "to",
  "what",
  "when",
  "why",
  "with",
  "you",
  "your"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getNested(value: unknown, keys: string[]): unknown {
  let current: unknown = value;

  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }

  return current;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function pickString(
  obj: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim();
      if (
        normalized.toLowerCase() !== "none" &&
        normalized.toLowerCase() !== "n/a" &&
        normalized.toLowerCase() !== "null"
      ) {
        return normalized;
      }
    }
  }

  return undefined;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;

  const normalized = value.replace(" ", "T");
  const parsed = new Date(normalized);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatDateOnly(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function formatMonthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  if (!year || !month) return key;
  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: "short",
    year: "2-digit"
  });
}

export function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12} ${period}`;
}

export function extractVideoIdFromUrl(url: string): string {
  const match = url.match(/(?:video|player\/v1)\/(\d+)/i);
  return match?.[1] ?? url.split("/").filter(Boolean).pop() ?? "video";
}

function uniqueStrings(values: Array<string | undefined>) {
  const seen = new Set<string>();
  const unique: string[] = [];

  values.forEach((value) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    unique.push(value);
  });

  return unique;
}

function buildCoverage(dates: Date[]) {
  if (!dates.length) {
    return {
      start: null,
      end: null,
      days: 0
    };
  }

  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  const days =
    Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1);

  return {
    start: formatDateOnly(start),
    end: formatDateOnly(end),
    days
  };
}

function normalizeChatName(rawName: string) {
  return rawName.replace(/^Chat History with\s+/i, "").replace(/:\s*$/, "").trim();
}

function rankItems(
  items: Array<string | undefined>,
  limit = 8,
  fallbackRecent: Array<string | undefined> = []
): RankedItem[] {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    if (!item) return;
    counts.set(item, (counts.get(item) ?? 0) + 1);
  });

  const ranked = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));

  if (!ranked.length) return [];

  if (ranked[0].count > 1 || !fallbackRecent.length) {
    return ranked;
  }

  return uniqueStrings(fallbackRecent)
    .slice(0, limit)
    .map((name) => ({ name, count: 1 }));
}

function rankSearchThemes(searchTerms: string[]): RankedItem[] {
  const counts = new Map<string, number>();

  searchTerms.forEach((term) => {
    term
      .toLowerCase()
      .split(/[^a-z0-9#@]+/i)
      .filter((token) => token.length >= 3)
      .filter((token) => !SEARCH_STOP_WORDS.has(token))
      .forEach((token) => {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      });
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function buildSessionStats(timestamps: number[]): SessionStats {
  if (!timestamps.length) {
    return {
      count: 0,
      averageMinutes: 0,
      longestMinutes: 0,
      averageVideos: 0
    };
  }

  const sorted = [...timestamps].sort((a, b) => a - b);
  const sessions: Array<{ minutes: number; videos: number }> = [];

  let start = sorted[0];
  let previous = sorted[0];
  let videos = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];

    if (current - previous > SESSION_GAP_MS) {
      sessions.push({
        minutes: Math.max(1, Math.round((previous - start) / 60000)),
        videos
      });
      start = current;
      previous = current;
      videos = 1;
      continue;
    }

    previous = current;
    videos += 1;
  }

  sessions.push({
    minutes: Math.max(1, Math.round((previous - start) / 60000)),
    videos
  });

  const totalMinutes = sessions.reduce((sum, session) => sum + session.minutes, 0);
  const totalVideos = sessions.reduce((sum, session) => sum + session.videos, 0);
  const longestMinutes = Math.max(...sessions.map((session) => session.minutes));

  return {
    count: sessions.length,
    averageMinutes: Math.round(totalMinutes / sessions.length),
    longestMinutes,
    averageVideos: Math.round(totalVideos / sessions.length)
  };
}

function buildLongestStreak(dayKeys: string[]): number {
  if (!dayKeys.length) return 0;

  const sorted = [...dayKeys].sort();
  let longest = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00`);
    const next = new Date(`${sorted[index]}T00:00:00`);
    const difference = Math.round(
      (next.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (difference === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (difference > 1) {
      current = 1;
    }
  }

  return longest;
}

function buildVibe(data: {
  watches: number;
  activeDays: number;
  peakHour: number;
  shareRate: number;
  saveRate: number;
  replayRate: number;
  topTheme?: string;
}): string {
  if (!data.watches) {
    return "Upload your TikTok export to reveal your behavior profile.";
  }

  const cadence =
    data.peakHour < 6
      ? "night owl"
      : data.peakHour < 12
      ? "morning checker"
      : data.peakHour < 18
      ? "afternoon drifter"
      : "prime-time binge watcher";

  const averagePerDay = data.activeDays
    ? Math.round(data.watches / data.activeDays)
    : 0;

  if (data.replayRate >= 0.2) {
    return `You are a ${cadence} with a strong replay habit. When something lands, you circle back to it.`;
  }

  if (data.saveRate >= 0.015) {
    return `You are a ${cadence} who curates more than most. You do not just scroll, you archive what matters.`;
  }

  if (data.shareRate >= 0.005) {
    return `You are a ${cadence} who turns TikTok into a social feed. You share what resonates instead of keeping it private.`;
  }

  if (data.topTheme) {
    return `You are a ${cadence}. Your curiosity keeps returning to ${data.topTheme}, and your watch rhythm stays steady at about ${averagePerDay} videos a day.`;
  }

  return `You are a ${cadence} with a steady rhythm of about ${averagePerDay} videos a day.`;
}

function getProfileSummary(data: unknown): ProfileSummary {
  const profileMap = getNested(data, ["Profile", "Profile Info", "ProfileMap"]);
  const profile = isRecord(profileMap) ? profileMap : {};

  return {
    username: pickString(profile, ["userName"]) ?? "your-account",
    bio: pickString(profile, ["bioDescription"]) ?? "No bio found in this export.",
    avatarUrl: pickString(profile, ["profilePhoto"]),
    likesReceived: toNumber(profile.likesReceived),
    birthDate: pickString(profile, ["birthDate"])
  };
}

function getActivityEntries(data: unknown, path: string[]): ActivityEntry[] {
  return asArray<ActivityEntry>(getNested(data, path));
}

export function parseTikTokExport(data: unknown): WrappedData {
  const profile = getProfileSummary(data);
  const watchList = getActivityEntries(data, [
    "Your Activity",
    "Watch History",
    "VideoList"
  ]);
  const likeList = getActivityEntries(data, [
    "Your Activity",
    "Like List",
    "ItemFavoriteList"
  ]);
  const favoriteVideos = getActivityEntries(data, [
    "Your Activity",
    "Favorite Videos",
    "FavoriteVideoList"
  ]);
  const searches = getActivityEntries(data, ["Your Activity", "Searches", "SearchList"]);
  const shareHistory = getActivityEntries(data, [
    "Your Activity",
    "Share History",
    "ShareHistoryList"
  ]);
  const comments = getActivityEntries(data, ["Comment", "Comments", "CommentsList"]);
  const following = getActivityEntries(data, ["Your Activity", "Following", "Following"]);
  const followers = getActivityEntries(data, ["Your Activity", "Follower", "FansList"]);
  const hashtagList = getActivityEntries(data, ["Your Activity", "Hashtag", "HashtagList"]);
  const favoriteSounds = getActivityEntries(data, [
    "Your Activity",
    "Favorite Sounds",
    "FavoriteSoundList"
  ]);
  const favoriteEffects = getActivityEntries(data, [
    "Your Activity",
    "Favorite Effects",
    "FavoriteEffectsList"
  ]);
  const directMessages = getNested(data, ["Direct Message", "Direct Messages", "ChatHistory"]);
  const chatHistory = isRecord(directMessages) ? directMessages : {};

  const monthMap = new Map<string, MonthBucket>();
  const dayMap = new Map<string, number>();
  const weekdayCounts = Array.from({ length: 7 }, () => 0);
  const hourCounts = Array.from({ length: 24 }, () => 0);
  const watchCounts = new Map<string, number>();
  const watchTimestamps: number[] = [];
  const watchDates: Date[] = [];
  const likeDates: Date[] = [];
  const searchDates: Date[] = [];
  const shareDates: Date[] = [];
  const commentDates: Date[] = [];
  const messageDates: Date[] = [];

  const bumpMonth = (
    date: Date,
    field: "watch" | "likes" | "searches" | "shares" | "comments"
  ) => {
    const key = formatMonthKey(date);
    const month = monthMap.get(key) ?? {
      key,
      label: formatMonthLabel(key),
      watch: 0,
      likes: 0,
      searches: 0,
      shares: 0,
      comments: 0
    };

    month[field] += 1;
    monthMap.set(key, month);
  };

  watchList.forEach((item) => {
    const date = parseDate(pickString(item, ["Date", "date"]));
    const link = pickString(item, ["Link", "link"]);

    if (date) {
      watchDates.push(date);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(date.getDate()).padStart(2, "0")}`;

      watchTimestamps.push(date.getTime());
      bumpMonth(date, "watch");
      hourCounts[date.getHours()] += 1;
      weekdayCounts[date.getDay()] += 1;
      dayMap.set(dayKey, (dayMap.get(dayKey) ?? 0) + 1);
    }

    if (link) {
      watchCounts.set(link, (watchCounts.get(link) ?? 0) + 1);
    }
  });

  likeList.forEach((item) => {
    const date = parseDate(pickString(item, ["Date", "date"]));
    if (date) {
      likeDates.push(date);
      bumpMonth(date, "likes");
    }
  });

  searches.forEach((item) => {
    const date = parseDate(pickString(item, ["Date", "date"]));
    if (date) {
      searchDates.push(date);
      bumpMonth(date, "searches");
    }
  });

  shareHistory.forEach((item) => {
    const date = parseDate(pickString(item, ["Date", "date"]));
    if (date) {
      shareDates.push(date);
      bumpMonth(date, "shares");
    }
  });

  comments.forEach((item) => {
    const date = parseDate(pickString(item, ["Date", "date"]));
    if (date) {
      commentDates.push(date);
      bumpMonth(date, "comments");
    }
  });

  const allChatContacts = Object.entries(chatHistory)
    .map(([rawName, entry]) => {
      const messages = asArray<ActivityEntry>(entry);
      let sent = 0;
      let received = 0;
      let lastDate: Date | null = null;

      messages.forEach((message) => {
        const from = pickString(message, ["From", "from"]);
        const date = parseDate(pickString(message, ["Date", "date"]));

        if (from === profile.username) {
          sent += 1;
        } else {
          received += 1;
        }

        if (date) {
          messageDates.push(date);
          if (!lastDate || date.getTime() > lastDate.getTime()) {
            lastDate = date;
          }
        }
      });

      return {
        name: normalizeChatName(rawName),
        messages: messages.length,
        sent,
        received,
        lastDate: lastDate ? formatDateOnly(lastDate) : null
      };
    })
    .filter((chat) => chat.messages > 0)
    .sort((a, b) => {
      if (b.messages !== a.messages) return b.messages - a.messages;
      if (a.lastDate && b.lastDate) return b.lastDate.localeCompare(a.lastDate);
      if (b.lastDate) return 1;
      if (a.lastDate) return -1;
      return a.name.localeCompare(b.name);
    });
  const topChatContacts = allChatContacts.slice(0, 3);

  const uniqueVideos = watchCounts.size;
  const repeatedViews = Array.from(watchCounts.values()).reduce((sum, count) => {
    return sum + Math.max(count - 1, 0);
  }, 0);
  const activeDayKeys = Array.from(dayMap.keys());
  const activeDays = activeDayKeys.length;
  const longestStreak = buildLongestStreak(activeDayKeys);
  const sessions = buildSessionStats(watchTimestamps);

  const topWatched = Array.from(watchCounts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([link, count]) => ({
      link,
      count,
      videoId: extractVideoIdFromUrl(link)
    }));

  const searchTermsNewestFirst = searches.map((item) =>
    pickString(item, ["SearchTerm", "searchTerm"])
  );
  const searchTerms = searchTermsNewestFirst.filter(
    (term): term is string => typeof term === "string"
  );

  const topSearches = rankItems(searchTerms, 6, searchTermsNewestFirst);
  const searchThemes = rankSearchThemes(searchTerms);
  const shareMethods = rankItems(
    shareHistory.map((item) => pickString(item, ["Method", "method"])),
    6
  );

  const hashtags = uniqueStrings(
    hashtagList.map((item) => pickString(item, ["HashtagName"]))
  );
  const favoriteSoundsLinks = uniqueStrings(
    favoriteSounds.map((item) => pickString(item, ["Link"]))
  );
  const favoriteEffectsLinks = uniqueStrings(
    favoriteEffects.map((item) => pickString(item, ["EffectLink"]))
  );
  const coverageSections = [
    { label: "Watch history", dates: watchDates, count: watchList.length },
    { label: "Likes", dates: likeDates, count: likeList.length },
    { label: "Searches", dates: searchDates, count: searches.length },
    { label: "Shares", dates: shareDates, count: shareHistory.length },
    { label: "Comments", dates: commentDates, count: comments.length },
    {
      label: "Direct messages",
      dates: messageDates,
      count: allChatContacts.reduce((sum, chat) => sum + chat.messages, 0)
    }
  ]
    .map((section) => ({
      label: section.label,
      count: section.count,
      ...buildCoverage(section.dates)
    }))
    .filter((section) => section.count > 0);
  const coverage = {
    ...buildCoverage([
      ...watchDates,
      ...likeDates,
      ...searchDates,
      ...shareDates,
      ...commentDates,
      ...messageDates
    ]),
    sections: coverageSections
  };

  const peakHour = hourCounts.reduce(
    (best, count, hour) => (count > hourCounts[best] ? hour : best),
    0
  );
  const peakWeekday = weekdayCounts.reduce(
    (best, count, day) => (count > weekdayCounts[best] ? day : best),
    0
  );

  const totals = {
    watches: watchList.length,
    uniqueVideos,
    likes: likeList.length,
    favorites: favoriteVideos.length,
    searches: searches.length,
    shares: shareHistory.length,
    comments: comments.length,
    following: following.length,
    followers: followers.length,
    favoriteSounds: favoriteSounds.length,
    favoriteEffects: favoriteEffects.length,
    hashtags: hashtagList.length,
    activeDays,
    longestStreak
  };

  const engagementRate = totals.watches ? totals.likes / totals.watches : 0;
  const saveRate = totals.watches ? totals.favorites / totals.watches : 0;
  const shareRate = totals.watches ? totals.shares / totals.watches : 0;
  const replayRate = totals.watches ? repeatedViews / totals.watches : 0;
  const exploreRate = totals.watches ? uniqueVideos / totals.watches : 0;

  const rates = [
    { label: "Like rate", value: toPercent(engagementRate) },
    { label: "Save rate", value: toPercent(saveRate) },
    { label: "Share rate", value: toPercent(shareRate) },
    { label: "Replay rate", value: toPercent(replayRate) }
  ];

  const insights = [
    { label: "Peak scroll time", value: formatHourLabel(peakHour) },
    {
      label: "Average watch day",
      value: activeDays ? `${Math.round(totals.watches / activeDays)} videos` : "N/A"
    },
    {
      label: "Average session",
      value: sessions.count ? `${sessions.averageVideos} videos` : "N/A"
    },
    {
      label: "Longest streak",
      value: longestStreak ? `${longestStreak} days` : "N/A"
    }
  ];

  const vibe = buildVibe({
    watches: totals.watches,
    activeDays,
    peakHour,
    shareRate,
    saveRate,
    replayRate,
    topTheme: searchThemes[0]?.name
  });

  return {
    profile,
    totals,
    sessions,
    rates,
    insights,
    activityByMonth: Array.from(monthMap.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    ),
    activeHours: hourCounts,
    weekdayActivity: weekdayCounts.map((value, index) => ({
      label: WEEKDAY_LABELS[index],
      value
    })),
    peakHourLabel: formatHourLabel(peakHour),
    peakWeekdayLabel: WEEKDAY_LABELS[peakWeekday],
    topSearches,
    searchThemes,
    shareMethods,
    topWatched,
    topChatContacts,
    hashtags,
    favoriteSounds: favoriteSoundsLinks,
    favoriteEffects: favoriteEffectsLinks,
    coverage,
    vibe
  };
}
