import { unstable_cache } from "next/cache";
import { formatDateLine } from "./format";
import { loadF1 } from "./f1";
import { loadMlb } from "./mlb";
import { loadF1News, loadMarinersNews } from "./news";
import type { Brief } from "./types";

export async function loadBrief(): Promise<Brief> {
  const [mlb, f1, marinersNews, f1News] = await Promise.all([
    loadMlb(),
    loadF1(),
    loadMarinersNews(),
    loadF1News(),
  ]);
  return {
    dateLine: formatDateLine(),
    mlb,
    f1,
    marinersNews,
    f1News,
  };
}

export const loadCachedBrief = unstable_cache(async () => loadBrief(), ["navy-and-red-brief"], {
  revalidate: 1800,
  tags: ["navy-and-red"],
});
