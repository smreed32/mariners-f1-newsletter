import { formatOrdinal } from "./format";
import type { Brief } from "./types";

export function renderPlain(brief: Brief): string {
  const lines: string[] = [];
  lines.push("NAVY AND RED");
  lines.push("Daily brief");
  lines.push(brief.dateLine);
  lines.push("Mariners first. Then the grid.");
  lines.push("");

  lines.push("MARINERS");
  if (!brief.mlb.available) {
    lines.push("Live feed unavailable");
  } else {
    if (brief.mlb.marinersRank) {
      lines.push(`AL West. Mariners rank ${formatOrdinal(brief.mlb.marinersRank)}.`);
    } else {
      lines.push("AL West");
    }
    lines.push("Team | W-L | GB");
    for (const row of brief.mlb.standings) {
      const mark = row.isMariners ? " *" : "";
      lines.push(`${row.name}${mark} | ${row.wins}-${row.losses} | ${row.gamesBack}`);
    }
    lines.push("");
    lines.push("Last result");
    if (brief.mlb.lastGame) {
      lines.push(brief.mlb.lastGame.headline);
      const extra = [brief.mlb.lastGame.detail, brief.mlb.lastGame.whenPt].filter(Boolean).join(". ");
      if (extra) lines.push(extra);
    } else {
      lines.push("Live feed unavailable");
    }
    lines.push("");
    lines.push("Next game");
    if (brief.mlb.nextGame) {
      const bits = [
        brief.mlb.nextGame.headline,
        brief.mlb.nextGame.whenPt,
        brief.mlb.nextGame.venue,
        brief.mlb.nextGame.probable ? `Probable: ${brief.mlb.nextGame.probable}` : null,
      ].filter(Boolean);
      lines.push(bits.join(". "));
    } else {
      lines.push("Live feed unavailable");
    }
    if (brief.marinersNews.length) {
      lines.push("");
      lines.push("News");
      for (const item of brief.marinersNews) {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.url}`);
      }
    }
  }

  lines.push("");
  lines.push("FORMULA ONE");
  const f1Any =
    brief.f1.driversAvailable ||
    brief.f1.constructorsAvailable ||
    brief.f1.lastRaceAvailable ||
    brief.f1.nextRaceAvailable;
  if (!f1Any) {
    lines.push("Live feed unavailable");
  } else {
    lines.push("Drivers (top 8)");
    if (brief.f1.driversAvailable) {
      for (const row of brief.f1.drivers) {
        lines.push(`P${row.position} ${row.name} (${row.team}) ${row.points} pts`);
      }
    } else {
      lines.push("Live feed unavailable");
    }
    lines.push("");
    lines.push("Constructors (top 5)");
    if (brief.f1.constructorsAvailable) {
      for (const row of brief.f1.constructors) {
        lines.push(`P${row.position} ${row.name} ${row.points} pts`);
      }
    } else {
      lines.push("Live feed unavailable");
    }
    lines.push("");
    lines.push("Last race");
    if (brief.f1.lastRaceAvailable) {
      if (brief.f1.lastRaceName) lines.push(brief.f1.lastRaceName);
      if (brief.f1.lastRaceWhen) lines.push(brief.f1.lastRaceWhen);
      for (const row of brief.f1.podium) {
        lines.push(`P${row.position} ${row.name} ${row.detail}`.trim());
      }
    } else {
      lines.push("Live feed unavailable");
    }
    lines.push("");
    lines.push("Next GP");
    if (brief.f1.nextRaceAvailable) {
      const bits = [brief.f1.nextRaceName, brief.f1.nextRaceWhen, brief.f1.nextRaceVenue].filter(Boolean);
      lines.push(bits.join(". "));
    } else {
      lines.push("Live feed unavailable");
    }
    if (brief.f1News.length) {
      lines.push("");
      lines.push("News");
      for (const item of brief.f1News) {
        lines.push(`- ${item.title}`);
        lines.push(`  ${item.url}`);
      }
    }
  }

  lines.push("");
  lines.push("Compiled for Scott in Spokane. Sent by Chief of Staff. Numbers from MLB Stats API and Jolpica F1. Private daily brief.");
  lines.push("");
  return lines.join("\n");
}
