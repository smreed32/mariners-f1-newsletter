# Mariners and F1 daily brief

Private HTML email newsletter for Scott. Mariners first. Then the grid.

Production URL (intended): https://mariners-f1-newsletter.vercel.app

## Daily regeneration

Fetch this app every morning around 7am PT. No authentication. Anonymous GET works.

1. GET https://mariners-f1-newsletter.vercel.app
   Use the response body as the HTML email. Content-Type is text/html; charset=utf-8.
2. GET https://mariners-f1-newsletter.vercel.app/plain
   Plaintext alternative. Content-Type is text/plain; charset=utf-8.

The routes revalidate every 30 minutes (revalidate = 1800), so a 7am PT fetch is fresh.

There is no extra page chrome. GET / is the email document.

## Data sources

Live numbers are fetched at request time. Scores and standings are not hardcoded.

- MLB Stats API standings (AL West, Mariners team id 136)
- MLB Stats API schedule (last final, next game, probable pitchers, linescore)
- Jolpica F1 (Ergast successor): driver standings, constructor standings, last race results, season calendar
- News: MLB.com RSS (Mariners and Seattle filter) and Motorsport.com F1 RSS. If a feed is empty or fails, the brief falls back to a short list of known real articles. If those also fail, the news block is omitted. Headlines are never invented.

If an API fails, that section shows "Live feed unavailable" instead of guessed numbers.

Times and the date line use America/Los_Angeles.

## Local

Install dependencies, then run the production build and start the server.
GET http://localhost:3000 for HTML and http://localhost:3000/plain for plaintext.

## Footer copy

Compiled for Scott in Spokane. Sent by Chief of Staff. Numbers from MLB Stats API and Jolpica F1. Private daily brief.
