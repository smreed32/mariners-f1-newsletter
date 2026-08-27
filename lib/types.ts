export type NewsItem = {
  title: string;
  url: string;
};

export type StandingRow = {
  name: string;
  wins: number;
  losses: number;
  gamesBack: string;
  isMariners: boolean;
  rank: string;
};

export type MlbGame = {
  headline: string;
  detail: string;
  scoreLine: string | null;
  venue: string | null;
  whenPt: string | null;
  probable: string | null;
};

export type MlbData = {
  available: boolean;
  divisionName: string;
  standings: StandingRow[];
  marinersRank: string | null;
  lastGame: MlbGame | null;
  nextGame: MlbGame | null;
};

export type F1DriverRow = {
  position: string;
  name: string;
  team: string;
  points: string;
};

export type F1ConstructorRow = {
  position: string;
  name: string;
  points: string;
};

export type F1PodiumRow = {
  position: string;
  name: string;
  detail: string;
};

export type F1Data = {
  driversAvailable: boolean;
  constructorsAvailable: boolean;
  lastRaceAvailable: boolean;
  nextRaceAvailable: boolean;
  drivers: F1DriverRow[];
  constructors: F1ConstructorRow[];
  lastRaceName: string | null;
  lastRaceWhen: string | null;
  podium: F1PodiumRow[];
  nextRaceName: string | null;
  nextRaceWhen: string | null;
  nextRaceVenue: string | null;
};

export type Brief = {
  dateLine: string;
  mlb: MlbData;
  f1: F1Data;
  marinersNews: NewsItem[];
  f1News: NewsItem[];
};
