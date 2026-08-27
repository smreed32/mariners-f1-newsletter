import { getJson } from "./http";
import { formatPtDate, formatPtDateTime, isoFromErgast } from "./format";
import type { F1ConstructorRow, F1Data, F1DriverRow, F1PodiumRow } from "./types";

type Driver = { givenName?: string; familyName?: string };
type Constructor = { name?: string };
type DriverStanding = {
  position?: string;
  points?: string;
  Driver?: Driver;
  Constructors?: Constructor[];
};
type ConstructorStanding = {
  position?: string;
  points?: string;
  Constructor?: Constructor;
};
type Result = {
  position?: string;
  points?: string;
  status?: string;
  Time?: { time?: string };
  Driver?: Driver;
};
type Race = {
  raceName?: string;
  date?: string;
  time?: string;
  Circuit?: { circuitName?: string; Location?: { locality?: string; country?: string } };
  Results?: Result[];
};

type DriverStandingsJson = {
  MRData?: { StandingsTable?: { StandingsLists?: { DriverStandings?: DriverStanding[] }[] } };
};
type ConstructorStandingsJson = {
  MRData?: { StandingsTable?: { StandingsLists?: { ConstructorStandings?: ConstructorStanding[] }[] } };
};
type ResultsJson = { MRData?: { RaceTable?: { Races?: Race[] } } };
type SeasonJson = { MRData?: { RaceTable?: { Races?: Race[] } } };

function driverName(d?: Driver): string {
  return [d?.givenName, d?.familyName].filter(Boolean).join(" ") || "Unknown";
}

function raceWhen(race: Race, withTime: boolean): string | null {
  if (!race.date) return null;
  const iso = isoFromErgast(race.date, race.time);
  return withTime && race.time ? formatPtDateTime(iso) : formatPtDate(iso);
}

function raceVenue(race: Race): string | null {
  const circuit = race.Circuit?.circuitName;
  const loc = race.Circuit?.Location;
  const place = [loc?.locality, loc?.country].filter(Boolean).join(", ");
  if (circuit && place) return `${circuit}, ${place}`;
  return circuit || place || null;
}

export async function loadF1(): Promise<F1Data> {
  const empty: F1Data = {
    driversAvailable: false,
    constructorsAvailable: false,
    lastRaceAvailable: false,
    nextRaceAvailable: false,
    drivers: [],
    constructors: [],
    lastRaceName: null,
    lastRaceWhen: null,
    podium: [],
    nextRaceName: null,
    nextRaceWhen: null,
    nextRaceVenue: null,
  };

  const [driversJson, constructorsJson, lastJson, seasonJson] = await Promise.all([
    getJson<DriverStandingsJson>("https://api.jolpi.ca/ergast/f1/2026/driverStandings.json"),
    getJson<ConstructorStandingsJson>("https://api.jolpi.ca/ergast/f1/2026/constructorStandings.json"),
    getJson<ResultsJson>("https://api.jolpi.ca/ergast/f1/current/last/results.json"),
    getJson<SeasonJson>("https://api.jolpi.ca/ergast/f1/current.json"),
  ]);

  const driverRows = driversJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const constructorRows =
    constructorsJson?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
  const lastRace = lastJson?.MRData?.RaceTable?.Races?.[0];
  const calendar = seasonJson?.MRData?.RaceTable?.Races || [];

  const drivers: F1DriverRow[] = driverRows.slice(0, 8).map((row) => ({
    position: row.position || "",
    name: driverName(row.Driver),
    team: row.Constructors?.[0]?.name || "",
    points: row.points || "0",
  }));

  const constructors: F1ConstructorRow[] = constructorRows.slice(0, 5).map((row) => ({
    position: row.position || "",
    name: row.Constructor?.name || "Unknown",
    points: row.points || "0",
  }));

  const podium: F1PodiumRow[] = (lastRace?.Results || []).slice(0, 3).map((row) => {
    const gap = row.Time?.time || row.status || "";
    return {
      position: row.position || "",
      name: driverName(row.Driver),
      detail: gap,
    };
  });

  const now = Date.now();
  const nextRace = calendar.find((race) => {
    if (!race.date) return false;
    return new Date(isoFromErgast(race.date, race.time)).getTime() > now;
  });

  return {
    driversAvailable: drivers.length > 0,
    constructorsAvailable: constructors.length > 0,
    lastRaceAvailable: Boolean(lastRace && podium.length),
    nextRaceAvailable: Boolean(nextRace),
    drivers,
    constructors,
    lastRaceName: lastRace?.raceName || null,
    lastRaceWhen: lastRace ? raceWhen(lastRace, false) : null,
    podium,
    nextRaceName: nextRace?.raceName || null,
    nextRaceWhen: nextRace ? raceWhen(nextRace, true) : null,
    nextRaceVenue: nextRace ? raceVenue(nextRace) : null,
  };
}
