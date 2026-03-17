# APEX TRACKER

A sleek, modern Formula 1 race tracker and dashboard. Browse race schedules, view detailed race results, and check driver standings — all powered by live F1 data.

> **Disclaimer:** This is an unofficial project and is not affiliated with Formula 1, the FIA, or any related companies.

## Features

- **Race Schedule** — View the full season calendar with upcoming and completed race indicators
- **Race Results** — Click any completed race to see full results with driver photos and team logos
- **Driver Standings** — Live driver championship standings with headshots and team branding
- **Driver Profiles** — Browse detailed driver profiles with statistics and team information
- **Team Profiles** — Explore team information, current drivers, and constructor details
- **Season Selector** — Browse historical data for the 2023–2025 seasons or the current season
- **Smart Caching** — API responses are cached in `localStorage` with configurable TTLs to minimize network requests
- **Modern Landing Page** — Beautiful homepage with feature highlights and quick navigation
- **Responsive Design** — Fully responsive across all devices with consistent styling

## APIs

- **[Ergast F1 API](https://api.jolpi.ca/ergast/f1)** — Race schedules, results, and driver standings
- **[OpenF1 API](https://api.openf1.org)** — Driver headshots and team colours

## Tech Stack

- **HTML / CSS / Vanilla JS** — No frameworks, no build step
- **Google Fonts** — Outfit and Space Grotesk typefaces
- Local team logo assets in `images/`

## Project Structure

```
apextrackerf1/
├── v1/                          # Application root
│   ├── index.html               # Landing page (home)
│   ├── races.html               # Race schedule & results
│   ├── standings.html           # Driver standings
│   ├── drivers.html             # Driver profiles
│   ├── teams.html               # Team profiles
│   ├── privacy-policy.html      # Privacy policy (Philippines DPA compliant)
│   ├── terms-of-service.html    # Terms of service
│   ├── app.js                   # Application logic & API integration
│   ├── styles.css               # Shared styling for races/standings
│   ├── .env.local               # Environment config (not committed)
│   └── images/                  # Team logo assets
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

Then open [http://localhost:8000](http://localhost:8000) in your browser to view the landing page.

## Caching

API responses are stored in `localStorage` with the following TTLs:

| Data               | TTL     |
| ------------------- | ------- |
| Race schedule/standings | 4 hours  |
| Driver images       | 7 days  |
| Historical results  | 30 days |

Clear your browser's local storage to force a refresh.

## Pages

- **[Home](v1/index.html)** — Landing page with feature overview and quick links
- **[Races](v1/races.html)** — Race schedule and detailed results with modal view
- **[Standings](v1/standings.html)** — Live driver championship standings
- **[Drivers](v1/drivers.html)** — Browse drivers by season with statistics and team filtering
- **[Teams](v1/teams.html)** — Explore teams and their current rosters
- **[Privacy Policy](v1/privacy-policy.html)** — Data protection and privacy practices (Philippines DPA compliant)
- **[Terms of Service](v1/terms-of-service.html)** — Usage terms and third-party service disclosures (Vercel, Ergast F1 API, OpenF1 API)

## Author

Developed by [rssllssn](https://github.com/rssllssn)
