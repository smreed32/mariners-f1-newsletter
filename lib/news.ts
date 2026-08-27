import { getText } from "./http";
import { stripDashes } from "./format";
import type { NewsItem } from "./types";

const MARINERS_FALLBACK: NewsItem[] = [
  {
    title: "Kade Anderson MLB debut; Mariners walk off Cubs 5-4 on Arozarena homer",
    url: "https://www.mlb.com/news/kade-anderson-makes-mlb-debut",
  },
  {
    title: "Mariners select LHP Kade Anderson from Double-A Arkansas, DFA Jhonathan Diaz",
    url: "https://www.mlb.com/press-release/mariners-select-lhp-kade-anderson-from-double-a-arkansas",
  },
  {
    title: "Bryan Woo cleared to start, Mariners could revive piggyback plan",
    url: "https://www.seattletimes.com/sports/mariners/bryan-woo-cleared-to-start-could-mariners-revive-piggyback-plan/",
  },
  {
    title: "Bryce Miller makes rare bullpen appearance",
    url: "https://www.seattletimes.com/sports/mariners/mariners-bryce-miller-makes-rare-bullpen-appearance-could-it-be-a-permanent-move/",
  },
];

const F1_FALLBACK: NewsItem[] = [
  {
    title: "Alpine extends Colapinto. 2027 lineup still Colapinto and Gasly",
    url: "https://www.formula1.com/en/latest/article/alpine-announce-colapinto-contract-extension-as-team-confirms-unchanged-2027-line-up.DL3dVyZLJm5cHryWcHyPq",
  },
  {
    title: "Norris wins Dutch Grand Prix from Antonelli and Russell as Verstappen crashes out",
    url: "https://www.formula1.com/en/latest/article/norris-wins-dramatic-dutch-grand-prix-from-antonelli-and-russell-as-verstappen-crashes-out.Zn7iYevVGp5eHzFkTEAz7",
  },
  {
    title: "Antonelli stays P1; Russell retakes P2 on countback",
    url: "https://www.motorsport.com/f1/news/2026-F1-Championship-Kimi-Antonelli-stays-top/10848647/",
  },
];

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function tagText(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\s\S]*?)</${tag}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = stripDashes(tagText(block, "title"));
    let url = tagText(block, "link");
    if (!url) {
      const guid = tagText(block, "guid");
      if (guid.startsWith("http")) url = guid;
    }
    if (!title || !url.startsWith("https://")) continue;
    items.push({ title, url });
  }
  return items;
}

function unique(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    const key = item.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

function looksNoisy(url: string): boolean {
  return url.includes("news.google.com") || url.includes("google.com/rss");
}

async function fromRss(url: string, filter?: (item: NewsItem) => boolean): Promise<NewsItem[]> {
  const xml = await getText(url);
  if (!xml || !xml.includes("<item")) return [];
  let items = parseRss(xml).filter((item) => !looksNoisy(item.url));
  if (filter) items = items.filter(filter);
  return unique(items).slice(0, 4);
}

function marinersFilter(item: NewsItem): boolean {
  const hay = `${item.title} ${item.url}`.toLowerCase();
  return hay.includes("mariner") || hay.includes("seattle");
}

export async function loadMarinersNews(): Promise<NewsItem[]> {
  const rss = await fromRss("https://www.mlb.com/feeds/news/rss.xml", marinersFilter);
  const merged = unique([...MARINERS_FALLBACK, ...rss]);
  return merged.slice(0, 4);
}

export async function loadF1News(): Promise<NewsItem[]> {
  const rss = await fromRss("https://www.motorsport.com/rss/f1/news/");
  const merged = unique([...F1_FALLBACK, ...rss]);
  return merged.slice(0, 4);
}
