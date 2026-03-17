# APEX TRACKER

A sleek, modern Formula 1 race tracker and dashboard. Browse race schedules, view detailed race results, and check driver standings — all powered by live F1 data.

> **Disclaimer:** This is an unofficial project and is not affiliated with Formula 1, the FIA, or any related companies.

## Features

- **Race Schedule** — View the full season calendar with upcoming and completed race indicators
- **Race Results** — Click any completed race to see full results with driver photos and team logos
- **Driver Standings** — Live driver championship standings with headshots and team branding
- **Season Selector** — Browse historical data for the 2023–2025 seasons or the current season
- **Smart Caching** — API responses are cached in `localStorage` with configurable TTLs to minimize network requests

## APIs

- **[Ergast F1 API](https://api.jolpi.ca/ergast/f1)** — Race schedules, results, and driver standings
- **[OpenF1 API](https://api.openf1.org)** — Driver headshots and team colours

## Tech Stack

- **HTML / CSS / Vanilla JS** — No frameworks, no build step
- **Google Fonts** — Outfit and Space Grotesk typefaces
- Local team logo assets in `images/`

## Project Structure

```
f1tracker/
├── v1/                  # Application root
│   ├── index.html       # Entry point
│   ├── app.js           # Application logic & API integration
│   ├── styles.css       # Styling
│   ├── .env.local       # Environment config (not committed)
│   └── images/          # Team logo assets
│       ├── alpine.png
│       ├── aston-martin.png
│       ├── audi.png
│       ├── cadillac.png
│       ├── ferrari.png
│       ├── haas.png
│       ├── mclaren.png
│       ├── mercedes.png
│       ├── rb.png
│       ├── red-bull.png
│       └── williams.png
└── README.md
```

## Getting Started

No build tools required. Serve the `v1/` directory with any static file server:

```bash
# Using Python
python3 -m http.server 8000 --directory v1

# Using Node (npx)
npx serve v1
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## Caching

API responses are stored in `localStorage` with the following TTLs:

| Data               | TTL     |
| ------------------- | ------- |
| Race schedule/standings | 4 hours  |
| Driver images       | 7 days  |
| Historical results  | 30 days |

Clear your browser's local storage to force a refresh.

## Author

Developed by [rssllssn](https://github.com/rssllssn)
