import { SOCIAL_LINKS } from "@/lib/site";

/**
 * GitHub profile data for the GitHub section, fetched on the server and cached
 * for an hour (Next's fetch cache), so visitors never hit the API themselves.
 *
 * The profile and repositories come from the public REST API (60 requests an
 * hour per server without a token, of which one page view costs about six,
 * once an hour). The contributions calendar is read from the public profile
 * page's own calendar fragment, which needs no token and counts private
 * contributions when the profile is set to include them. With GITHUB_TOKEN set
 * the calendar comes from GraphQL instead, queried as the token's owner so
 * private contributions are counted either way, and the rate limit is higher.
 * If both fail, the last 90 days of public events stand in. Repositories always
 * come from the public listing, so private repositories are never shown.
 */

export const GITHUB_USER = new URL(SOCIAL_LINKS.github).pathname.replace(/\//g, "");

const API = "https://api.github.com";
const REVALIDATE = 3600;

export interface GithubRepo {
    name: string;
    url: string;
    description: string | null;
    language: string | null;
    stars: number;
    forks: number;
    fork: boolean;
    /** "3 days ago" or "on Mar 3", worded like GitHub and rendered on the server so it is identical on both sides of hydration. */
    updated: string;
    topics: string[];
}

export interface GithubDay {
    /** ISO date, or "" for a padding cell before the first day. */
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

export interface GithubData {
    user: {
        login: string;
        name: string;
        avatar: string;
        bio: string | null;
        followers: number;
        following: number;
        publicRepos: number;
        url: string;
        since: string;
    };
    totals: { stars: number; forks: number };
    languages: { name: string; share: number; repos: number }[];
    repos: GithubRepo[];
    calendar: {
        /** Columns of seven days, Sunday first, oldest week first. */
        weeks: GithubDay[][];
        total: number;
        source: "contributions" | "events";
    };
}

type RestUser = {
    login: string; name: string | null; avatar_url: string; bio: string | null; followers: number; following: number;
    public_repos: number; html_url: string; created_at: string;
};
type RestRepo = {
    name: string; html_url: string; description: string | null; language: string | null; stargazers_count: number;
    forks_count: number; pushed_at: string; topics?: string[]; fork: boolean;
};
type RestEvent = { created_at: string };
type GraphUser = {
    login?: string;
    contributionsCollection?: {
        contributionCalendar?: {
            totalContributions: number;
            weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
        };
    };
};
type GraphCalendar = { data?: { viewer?: GraphUser; user?: GraphUser } };

const headers = (): Record<string, string> => {
    const h: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "portfolio-site" };
    if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    return h;
};

async function getJson<T>(url: string, init?: RequestInit): Promise<T | null> {
    try {
        const res = await fetch(url, { ...init, headers: { ...headers(), ...(init?.headers as Record<string, string> | undefined) }, next: { revalidate: REVALIDATE } });
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
}

/** All pages of a list endpoint, up to `maxPages` of 100. */
async function getPages<T>(path: string, maxPages: number): Promise<T[]> {
    const all: T[] = [];
    for (let page = 1; page <= maxPages; page++) {
        const items = await getJson<T[]>(`${API}${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
        if (!items || !Array.isArray(items)) break;
        all.push(...items);
        if (items.length < 100) break;
    }
    return all;
}

const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const monthDayYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const isoDay = (d: Date) => d.toISOString().slice(0, 10);

/** "Updated …" wording as GitHub's repository list uses it. */
function updatedLabel(iso: string, now: Date): string {
    const then = new Date(iso);
    const ago = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"} ago`;
    const s = Math.max(0, (now.getTime() - then.getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return ago(Math.floor(s / 60), "minute");
    if (s < 86400) return ago(Math.floor(s / 3600), "hour");
    if (s < 86400 * 2) return "yesterday";
    if (s < 86400 * 30) return ago(Math.floor(s / 86400), "day");
    return `on ${(then.getUTCFullYear() === now.getUTCFullYear() ? monthDay : monthDayYear).format(then)}`;
}

const LEVELS: Record<string, GithubDay["level"]> = {
    NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4,
};

/** Group a date-ordered list of days into Sunday-first columns, padding the first week. */
function toWeeks(days: GithubDay[]): GithubDay[][] {
    if (days.length === 0) return [];
    const weeks: GithubDay[][] = [];
    const lead = new Date(days[0].date + "T00:00:00Z").getUTCDay();
    let week: GithubDay[] = Array.from({ length: lead }, () => ({ date: "", count: 0, level: 0 }));
    for (const d of days) {
        week.push(d);
        if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length) weeks.push(week);
    return weeks;
}

async function contributionsCalendar(): Promise<GithubData["calendar"] | null> {
    if (!process.env.GITHUB_TOKEN) return null;
    const fields = `contributionsCollection { contributionCalendar {
        totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } }`;
    const graphql = (query: string, variables?: Record<string, string>) => getJson<GraphCalendar>(`${API}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
    });
    // Ask as the token's owner first: that view counts private contributions,
    // like the profile page does when signed in. A token for another account
    // falls back to the public view of the profile.
    const viewer = (await graphql(`query { viewer { login ${fields} } }`))?.data?.viewer;
    let cal = viewer?.login?.toLowerCase() === GITHUB_USER.toLowerCase() ? viewer.contributionsCollection?.contributionCalendar : undefined;
    if (!cal) {
        const res = await graphql(`query($login: String!) { user(login: $login) { ${fields} } }`, { login: GITHUB_USER });
        cal = res?.data?.user?.contributionsCollection?.contributionCalendar;
    }
    if (!cal) return null;
    const days: GithubDay[] = cal.weeks.flatMap((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 })),
    );
    return { weeks: toWeeks(days), total: cal.totalContributions, source: "contributions" };
}

async function getText(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, { headers: { "User-Agent": "portfolio-site" }, next: { revalidate: REVALIDATE } });
        if (!res.ok) return null;
        return await res.text();
    } catch {
        return null;
    }
}

/**
 * The public profile's calendar, from the fragment github.com renders it with.
 * Each day is a cell with data-date, id and data-level, and a tooltip keyed by
 * that id carries the count ("No contributions on …" or "3 contributions on …").
 */
async function profileCalendar(): Promise<GithubData["calendar"] | null> {
    const html = await getText(`https://github.com/users/${GITHUB_USER}/contributions`);
    if (!html) return null;
    const counts = new Map<string, number>();
    const tip = /<tool-tip\b[^>]*\sfor="(contribution-day-component-[\d-]+)"[^>]*>\s*(\d[\d,]*|No)\s+contributions?\b/g;
    for (let m = tip.exec(html); m; m = tip.exec(html)) counts.set(m[1], m[2] === "No" ? 0 : parseInt(m[2].replace(/,/g, ""), 10));
    const days: GithubDay[] = [];
    const cell = /<td\b[^>]*ContributionCalendar-day[^>]*>/g;
    for (let m = cell.exec(html); m; m = cell.exec(html)) {
        const date = /data-date="(\d{4}-\d{2}-\d{2})"/.exec(m[0])?.[1];
        const id = /\sid="([^"]+)"/.exec(m[0])?.[1] ?? "";
        const level = Number(/data-level="(\d)"/.exec(m[0])?.[1] ?? 0);
        if (date) days.push({ date, count: counts.get(id) ?? 0, level: Math.min(4, Math.max(0, level)) as GithubDay["level"] });
    }
    if (days.length < 300) return null; // not the calendar we expect
    days.sort((a, b) => a.date.localeCompare(b.date));
    return { weeks: toWeeks(days), total: days.reduce((n, d) => n + d.count, 0), source: "contributions" };
}

/** Fallback: public events of the last 90 days (the most the API serves), one cell per day. */
async function eventsCalendar(): Promise<GithubData["calendar"]> {
    const events = await getPages<RestEvent>(`/users/${GITHUB_USER}/events/public`, 3);
    const counts = new Map<string, number>();
    for (const e of events) {
        const key = e.created_at.slice(0, 10);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    const max = Math.max(1, ...Array.from(counts.values()));
    const today = new Date();
    const start = new Date(today);
    start.setUTCDate(start.getUTCDate() - 90);
    start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // back to a Sunday
    const days: GithubDay[] = [];
    for (const d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
        const date = isoDay(d);
        const count = counts.get(date) ?? 0;
        days.push({ date, count, level: count === 0 ? 0 : (Math.min(4, Math.ceil((count / max) * 4)) as GithubDay["level"]) });
    }
    return { weeks: toWeeks(days), total: events.length, source: "events" };
}

export async function getGithubData(): Promise<GithubData | null> {
    const user = await getJson<RestUser>(`${API}/users/${GITHUB_USER}`);
    if (!user) return null;

    const [repos, calendar] = await Promise.all([
        getPages<RestRepo>(`/users/${GITHUB_USER}/repos?type=owner&sort=pushed`, 2),
        contributionsCalendar().then((c) => c ?? profileCalendar()).then((c) => c ?? eventsCalendar()),
    ]);

    const own = repos.filter((r) => !r.fork);
    const byLanguage = new Map<string, number>();
    for (const r of own) if (r.language) byLanguage.set(r.language, (byLanguage.get(r.language) ?? 0) + 1);
    const languageTotal = Array.from(byLanguage.values()).reduce((a, b) => a + b, 0) || 1;
    const languages = Array.from(byLanguage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, n]) => ({ name, repos: n, share: n / languageTotal }));

    // Most recently pushed first, forks included, as the repositories tab lists them.
    const now = new Date();
    const recent = [...repos]
        .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at))
        .slice(0, 8)
        .map<GithubRepo>((r) => ({
            name: r.name,
            url: r.html_url,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            fork: r.fork,
            updated: updatedLabel(r.pushed_at, now),
            topics: (r.topics ?? []).slice(0, 4),
        }));

    return {
        user: {
            login: user.login,
            name: user.name ?? user.login,
            avatar: user.avatar_url,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            url: user.html_url,
            since: new Date(user.created_at).getUTCFullYear().toString(),
        },
        totals: {
            stars: own.reduce((n, r) => n + r.stargazers_count, 0),
            forks: own.reduce((n, r) => n + r.forks_count, 0),
        },
        languages,
        repos: recent,
        calendar,
    };
}
