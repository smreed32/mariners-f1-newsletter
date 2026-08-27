import { getJson } from "./http";
import { formatPtDate, formatPtDateTime, ymdInPt } from "./format";
import type { MlbData, MlbGame, StandingRow } from "./types";

const MARINERS_ID = 136;
const AL_WEST_ID = 200;
const SEASON = 2026;

type MlbTeam = { id?: number; name?: string; teamName?: string };
type MlbPitcher = { fullName?: string };
type MlbTeamSide = {
  team?: MlbTeam;
  score?: number;
  isWinner?: boolean;
  probablePitcher?: MlbPitcher;
};
type MlbGameJson = {
  gameDate?: string;
  officialDate?: string;
  status?: { detailedState?: string; abstractGameState?: string };
  venue?: { name?: string };
  teams?: { away?: MlbTeamSide; home?: MlbTeamSide };
  decisions?: { winner?: MlbPitcher; loser?: MlbPitcher; save?: MlbPitcher };
};
type MlbSchedule = { dates?: { date?: string; games?: MlbGameJson[] }[] };
type MlbStandings = {
  records?: {
    division?: { id?: number };
    teamRecords?: {
      team?: MlbTeam;
      wins?: number;
      losses?: number;
      divisionRank?: string;
      divisionGamesBack?: string;
      gamesBack?: string;
    }[];
  }[];
};

function teamLabel(team?: MlbTeam): string {
  return team?.teamName || team?.name || "Unknown";
}

function isFinal(game: MlbGameJson): boolean {
  const detailed = (game.status?.detailedState || "").toLowerCase();
  const abstract = (game.status?.abstractGameState || "").toLowerCase();
  return abstract === "final" || detailed.startsWith("final") || detailed.includes("completed");
}

function isUpcoming(game: MlbGameJson): boolean {
  if (isFinal(game)) return false;
  const detailed = (game.status?.detailedState || "").toLowerCase();
  const abstract = (game.status?.abstractGameState || "").toLowerCase();
  if (abstract === "live" || detailed.includes("in progress") || detailed.includes("warmup")) {
    return false;
  }
  return (
    abstract === "preview" ||
    detailed.includes("scheduled") ||
    detailed.includes("pre-game") ||
    detailed.includes("pregame")
  );
}

function probableLine(game: MlbGameJson): string | null {
  const away = game.teams?.away;
  const home = game.teams?.home;
  const awayName = teamLabel(away?.team);
  const homeName = teamLabel(home?.team);
  const awayP = away?.probablePitcher?.fullName;
  const homeP = home?.probablePitcher?.fullName;
  if (!awayP && !homeP) return null;
  const left = awayP ? `${awayName} ${awayP}` : `${awayName} TBA`;
  const right = homeP ? `${homeName} ${homeP}` : `${homeName} TBA`;
  return `${left}, ${right}`;
}

function resultGame(game: MlbGameJson): MlbGame {
  const away = game.teams?.away;
  const home = game.teams?.home;
  const awayName = teamLabel(away?.team);
  const homeName = teamLabel(home?.team);
  const awayScore = away?.score;
  const homeScore = home?.score;
  const marinersAway = away?.team?.id === MARINERS_ID;
  const mariners = marinersAway ? away : home;
  const opp = marinersAway ? home : away;
  const marinersName = teamLabel(mariners?.team);
  const oppName = teamLabel(opp?.team);
  const mScore = mariners?.score;
  const oScore = opp?.score;
  const won = mariners?.isWinner === true || (typeof mScore === "number" && typeof oScore === "number" && mScore > oScore);
  const lost = mariners?.isWinner === false || (typeof mScore === "number" && typeof oScore === "number" && mScore < oScore);
  const result = won ? "Win" : lost ? "Loss" : "Final";
  const where = marinersAway ? `at ${oppName}` : `vs ${oppName}`;
  const scoreLine =
    typeof mScore === "number" && typeof oScore === "number"
      ? `${marinersName} ${mScore}, ${oppName} ${oScore}`
      : typeof awayScore === "number" && typeof homeScore === "number"
        ? `${awayName} ${awayScore}, ${homeName} ${homeScore}`
        : null;
  const when = game.gameDate ? formatPtDate(game.gameDate) : game.officialDate || null;
  const venue = game.venue?.name || null;
  const bits = [result, where];
  if (venue) bits.push(venue);
  return {
    headline: scoreLine || `${marinersName} ${where}`,
    detail: bits.join(". "),
    scoreLine,
    venue,
    whenPt: when,
    probable: probableLine(game),
  };
}

function previewGame(game: MlbGameJson): MlbGame {
  const away = game.teams?.away;
  const home = game.teams?.home;
  const marinersAway = away?.team?.id === MARINERS_ID;
  const opp = marinersAway ? home : away;
  const oppName = teamLabel(opp?.team);
  const where = marinersAway ? `at ${oppName}` : `vs ${oppName}`;
  const venue = game.venue?.name || null;
  const when = game.gameDate ? formatPtDateTime(game.gameDate) : null;
  return {
    headline: where,
    detail: [when, venue].filter(Boolean).join(". "),
    scoreLine: null,
    venue,
    whenPt: when,
    probable: probableLine(game),
  };
}

export async function loadMlb(): Promise<MlbData> {
  const empty: MlbData = {
    available: false,
    divisionName: "AL West",
    standings: [],
    marinersRank: null,
    lastGame: null,
    nextGame: null,
  };

  const start = ymdInPt(new Date(), -12);
  const end = ymdInPt(new Date(), 16);
  const standingsUrl = `https://statsapi.mlb.com/api/v1/standings?leagueId=103&season=${SEASON}&standingsTypes=regularSeason`;
  const scheduleUrl = `https://statsapi.mlb.com/api/v1/schedule?teamId=${MARINERS_ID}&sportId=1&startDate=${start}&endDate=${end}&hydrate=decisions,probablePitcher,linescore,team`;

  const [standings, schedule] = await Promise.all([
    getJson<MlbStandings>(standingsUrl),
    getJson<MlbSchedule>(scheduleUrl),
  ]);

  const west = standings?.records?.find((block) => block.division?.id === AL_WEST_ID);
  const standingsRows: StandingRow[] = (west?.teamRecords || []).map((row) => ({
    name: teamLabel(row.team),
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    gamesBack: row.divisionGamesBack || row.gamesBack || "-",
    isMariners: row.team?.id === MARINERS_ID,
    rank: row.divisionRank || "",
  }));

  const games = (schedule?.dates || []).flatMap((day) => day.games || []);
  const finals = games.filter(isFinal);
  const upcoming = games.filter(isUpcoming);
  const last = finals.length ? finals[finals.length - 1] : undefined;
  const next = upcoming[0];

  const available = standingsRows.length > 0 || Boolean(last || next);
  if (!available) return empty;

  const mariners = standingsRows.find((row) => row.isMariners);

  return {
    available: true,
    divisionName: "AL West",
    standings: standingsRows,
    marinersRank: mariners?.rank || null,
    lastGame: last ? resultGame(last) : null,
    nextGame: next ? previewGame(next) : null,
  };
}
