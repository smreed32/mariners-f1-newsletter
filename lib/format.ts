const PT = "America/Los_Angeles";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function stripDashes(value: string): string {
  return value
    .replace(/\u2014/g, ",")
    .replace(/\u2013/g, ",")
    .replace(/ -- /g, ", ")
    .replace(/\s+,/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function nowInPt(): Date {
  return new Date();
}

export function formatOrdinal(value: string): string {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return value;
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}


export function formatDateLine(date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PT,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatPtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return stripDashes(iso);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: PT,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatPtDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return stripDashes(iso);
  const base = new Intl.DateTimeFormat("en-US", {
    timeZone: PT,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${base} PT`;
}

export function ymdInPt(date: Date, offsetDays = 0): string {
  const shifted = new Date(date.getTime() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PT,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(shifted);
}

export function isoFromErgast(date: string, time?: string): string {
  if (time) {
    const t = time.endsWith("Z") ? time : `${time}Z`;
    return `${date}T${t}`;
  }
  return `${date}T12:00:00Z`;
}
