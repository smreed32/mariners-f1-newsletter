import { escapeHtml, formatOrdinal } from "./format";
import type { Brief, NewsItem } from "./types";

const PAGE = "#070B14";
const CARD = "#0C2C56";
const TEAL = "#1F8A8A";
const RED = "#E10600";
const WHITE = "#F4F7FB";
const MUTED = "#9BB0C9";
const ROW_ALT = "#0A2448";
const MARINERS_ROW = "#123A6B";

function newsList(items: NewsItem[], accent: string): string {
  if (!items.length) return "";
  const rows = items
    .map((item) => {
      const title = escapeHtml(item.title);
      const url = escapeHtml(item.url);
      return `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #163A66;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;">
          <a href="${url}" target="_blank" rel="noopener" style="color:${WHITE};text-decoration:none;"><span style="color:${accent};">*</span> ${title}</a>
        </td>
      </tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

function sectionBar(label: string, color: string): string {
  return `<tr>
    <td style="background-color:${color};padding:10px 20px;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:2px;font-weight:bold;color:${WHITE};text-transform:uppercase;">
      ${escapeHtml(label)}
    </td>
  </tr>`;
}

function unavailable(): string {
  return `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${MUTED};">Live feed unavailable</p>`;
}

function marinersSection(brief: Brief): string {
  const { mlb, marinersNews } = brief;
  if (!mlb.available) {
    return `${sectionBar("Mariners", TEAL)}
      <tr><td style="background-color:${CARD};padding:20px;">${unavailable()}</td></tr>`;
  }

  const header = `<tr>
    <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;">Team</td>
    <td align="right" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;">W-L</td>
    <td align="right" style="padding:8px 0 8px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:${MUTED};text-transform:uppercase;">GB</td>
  </tr>`;

  const body = mlb.standings
    .map((row) => {
      const bg = row.isMariners ? MARINERS_ROW : "transparent";
      const weight = row.isMariners ? "bold" : "normal";
      const name = escapeHtml(row.name);
      return `<tr style="background-color:${bg};">
        <td style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${WHITE};font-weight:${weight};">${name}</td>
        <td align="right" style="padding:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${WHITE};font-weight:${weight};">${row.wins}-${row.losses}</td>
        <td align="right" style="padding:9px 0 9px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:${MUTED};">${escapeHtml(row.gamesBack)}</td>
      </tr>`;
    })
    .join("");

  const rank = mlb.marinersRank
    ? `Mariners sit ${escapeHtml(formatOrdinal(mlb.marinersRank))} in the ${escapeHtml(mlb.divisionName)}.`
    : `${escapeHtml(mlb.divisionName)} snapshot.`;

  let last = "";
  if (mlb.lastGame) {
    last = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${TEAL};text-transform:uppercase;">Last result</p>
      <p style="margin:0 0 6px 0;font-family:Georgia,serif;font-size:26px;line-height:32px;color:${WHITE};">${escapeHtml(mlb.lastGame.headline)}</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:21px;color:${MUTED};">${escapeHtml([mlb.lastGame.detail, mlb.lastGame.whenPt].filter(Boolean).join(". "))}</p>`;
  } else {
    last = `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};">Live feed unavailable</p>`;
  }

  let next = "";
  if (mlb.nextGame) {
    const bits = [
      mlb.nextGame.headline,
      mlb.nextGame.whenPt,
      mlb.nextGame.venue,
      mlb.nextGame.probable ? `Probable: ${mlb.nextGame.probable}` : null,
    ].filter(Boolean);
    next = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${TEAL};text-transform:uppercase;">Next game</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:${WHITE};">${escapeHtml(bits.join(". "))}</p>`;
  } else {
    next = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${TEAL};text-transform:uppercase;">Next game</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};">Live feed unavailable</p>`;
  }

  const news = marinersNews.length
    ? `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${TEAL};text-transform:uppercase;">News</p>${newsList(marinersNews, TEAL)}`
    : "";

  return `${sectionBar("Mariners", TEAL)}
    <tr>
      <td style="background-color:${CARD};padding:20px 24px 8px 24px;">
        <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">${rank}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #163A66;">
          ${header}${body}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background-color:${CARD};padding:20px 24px;border-top:1px solid #163A66;">${last}</td>
    </tr>
    <tr>
      <td style="background-color:${CARD};padding:0 24px 20px 24px;">${next}</td>
    </tr>
    ${news ? `<tr><td style="background-color:${CARD};padding:8px 24px 24px 24px;">${news}</td></tr>` : ""}`;
}

function f1Section(brief: Brief): string {
  const { f1, f1News } = brief;
  const any =
    f1.driversAvailable || f1.constructorsAvailable || f1.lastRaceAvailable || f1.nextRaceAvailable;
  if (!any) {
    return `${sectionBar("Formula One", RED)}
      <tr><td style="background-color:${CARD};padding:20px;">${unavailable()}</td></tr>`;
  }

  let drivers = "";
  if (f1.driversAvailable) {
    const rows = f1.drivers
      .map((row, i) => {
        const bg = i % 2 === 1 ? ROW_ALT : "transparent";
        return `<tr style="background-color:${bg};">
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};width:28px;">P${escapeHtml(row.position)}</td>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${WHITE};">${escapeHtml(row.name)}</td>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">${escapeHtml(row.team)}</td>
          <td align="right" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${WHITE};">${escapeHtml(row.points)}</td>
        </tr>`;
      })
      .join("");
    drivers = `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Drivers (top 8)</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
  } else {
    drivers = `<p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Drivers</p>${unavailable()}`;
  }

  let constructors = "";
  if (f1.constructorsAvailable) {
    const rows = f1.constructors
      .map((row, i) => {
        const bg = i % 2 === 1 ? ROW_ALT : "transparent";
        return `<tr style="background-color:${bg};">
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};width:28px;">P${escapeHtml(row.position)}</td>
          <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${WHITE};">${escapeHtml(row.name)}</td>
          <td align="right" style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${WHITE};">${escapeHtml(row.points)}</td>
        </tr>`;
      })
      .join("");
    constructors = `<p style="margin:16px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Constructors (top 5)</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
  } else {
    constructors = `<p style="margin:16px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Constructors</p>${unavailable()}`;
  }

  let last = "";
  if (f1.lastRaceAvailable) {
    const podium = f1.podium
      .map(
        (row) => `<tr>
        <td style="padding:6px 0;font-family:Georgia,serif;font-size:18px;color:${WHITE};">P${escapeHtml(row.position)} ${escapeHtml(row.name)}</td>
        <td align="right" style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">${escapeHtml(row.detail)}</td>
      </tr>`,
      )
      .join("");
    last = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Last race</p>
      <p style="margin:0 0 10px 0;font-family:Georgia,serif;font-size:22px;line-height:28px;color:${WHITE};">${escapeHtml(f1.lastRaceName || "Last race")}</p>
      <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">${escapeHtml(f1.lastRaceWhen || "")}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${podium}</table>`;
  } else {
    last = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Last race</p>${unavailable()}`;
  }

  let next = "";
  if (f1.nextRaceAvailable) {
    const bits = [f1.nextRaceName, f1.nextRaceWhen, f1.nextRaceVenue].filter(Boolean);
    next = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Next GP</p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:${WHITE};">${escapeHtml(bits.join(". "))}</p>`;
  } else {
    next = `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">Next GP</p>${unavailable()}`;
  }

  const news = f1News.length
    ? `<p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;color:${RED};text-transform:uppercase;">News</p>${newsList(f1News, RED)}`
    : "";

  return `${sectionBar("Formula One", RED)}
    <tr><td style="background-color:${CARD};padding:20px 24px 8px 24px;">${drivers}${constructors}</td></tr>
    <tr><td style="background-color:${CARD};padding:16px 24px;border-top:1px solid #163A66;">${last}</td></tr>
    <tr><td style="background-color:${CARD};padding:0 24px 20px 24px;">${next}</td></tr>
    ${news ? `<tr><td style="background-color:${CARD};padding:8px 24px 24px 24px;">${news}</td></tr>` : ""}`;
}

export function renderHtml(brief: Brief): string {
  const date = escapeHtml(brief.dateLine);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>Navy and Red, Daily brief</title>
</head>
<body style="margin:0;padding:0;background-color:${PAGE};">
  <div style="display:none;max-height:0;overflow:hidden;color:${PAGE};font-size:1px;line-height:1px;">Mariners first. Then the grid. ${date}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAGE};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
          <tr>
            <td style="background-color:${CARD};padding:28px 24px 24px 24px;border-top:4px solid ${TEAL};">
              <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;color:${TEAL};text-transform:uppercase;">Navy and Red</p>
              <h1 style="margin:0 0 8px 0;font-family:Georgia,serif;font-size:36px;line-height:40px;font-weight:normal;color:${WHITE};">Daily brief</h1>
              <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${MUTED};">${date}</p>
              <p style="margin:0;font-family:Georgia,serif;font-size:16px;font-style:italic;color:${WHITE};">Mariners first. Then the grid.</p>
            </td>
          </tr>
          <tr><td style="height:16px;font-size:16px;line-height:16px;">&nbsp;</td></tr>
          ${marinersSection(brief)}
          <tr><td style="height:16px;font-size:16px;line-height:16px;">&nbsp;</td></tr>
          ${f1Section(brief)}
          <tr>
            <td style="padding:24px 8px 8px 8px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${MUTED};">
              Compiled for Scott in Spokane. Sent by Chief of Staff. Numbers from MLB Stats API and Jolpica F1. Private daily brief.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
