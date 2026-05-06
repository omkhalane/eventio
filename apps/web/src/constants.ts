import { CalendarEvent } from "./types";
import { addDays, setHours, setMinutes, startOfMonth } from "date-fns";

const now = new Date();
const monthStart = startOfMonth(now);

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Codeforces Round #930",
    platform: "codeforces",
    external_id: "930",
    start_time: setHours(
      setMinutes(addDays(monthStart, 5), 35),
      17,
    ).toISOString(),
    end_time: setHours(
      setMinutes(addDays(monthStart, 5), 35),
      19,
    ).toISOString(),
    timezone: "UTC",
    event_type: "contest",
    tags: ["div1", "div2"],
    is_online: true,
    url: "https://codeforces.com",
    is_free: true,
    status: "upcoming",
    extra: {},
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  },
];

export const CATEGORIES = [
  {
    id: "competitive_programming",
    label: "Competitive Programming",
    color: "bg-balck-500",
  },
  {
    id: "global_competition",
    label: "Global Competition",
    color: "bg-amber-500",
  },
  { id: "hackathon", label: "Hackathon", color: "bg-purple-500" },
  { id: "hiring_challenge", label: "Hiring Challenge", color: "bg-orange-500" },
  { id: "data_science", label: "Data Science", color: "bg-blue-500" },
  { id: "community_event", label: "Community Event", color: "bg-pink-500" },
  { id: "conference", label: "Conference", color: "bg-indigo-500" },
  {
    id: "cybersecurity_ctf",
    label: "Cybersecurity / CTF",
    color: "bg-red-500",
  },
  { id: "open_source", label: "Open Source", color: "bg-emerald-500" },
  { id: "live_stream", label: "Live Stream", color: "bg-rose-500" },
] as const;

export const PLATFORMS_BY_CATEGORY = {
  competitive_programming: [
    "codeforces",
    "codechef",
    "atcoder",
    "topcoder",
    "leetcode",
    "hackerrank",
    "geeksforgeeks",
    "spoj",
  ],
  global_competition: [
    "icpc",
    "ioi",
    "meta_hacker_cup",
    "google_code_jam",
    "google_kick_start",
  ],
  hackathon: [
    "devpost",
    "mlh",
    "hackerearth",
    "unstop",
    "devfolio",
    "dorahacks",
    "lablab_ai",
    "hack2skill",
  ],
  hiring_challenge: ["codesignal", "codility", "testdome"],
  data_science: ["kaggle", "zindi", "drivendata"],
  community_event: ["gdg", "mlsa", "ieee", "acm", "linux_foundation", "owasp"],
  conference: ["google", "microsoft", "apple", "aws", "meta", "nvidia"],
  cybersecurity_ctf: ["hack_the_box", "tryhackme", "picoctf", "ctftime"],
  open_source: ["gsoc", "outreachy", "hacktoberfest"],
  live_stream: ["twitch", "youtube", "github"],
};

export const PLATFORMS = Object.values(PLATFORMS_BY_CATEGORY).flat();
