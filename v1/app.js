/**
 * Apex - F1 2026 Season Dashboard
 * Features: Local team logo mapping, Driver headshot integration, and Result caching.
 */

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';
const OPEN_F1_API = 'https://api.openf1.org/v1/drivers?session_key=latest';

const CACHE_CONFIG = {
    DEFAULT_TTL: 4 * 60 * 60 * 1000, // 4 hours
    DRIVER_IMAGES_TTL: 7 * 24 * 60 * 60 * 1000, // 7 days
    HISTORICAL_TTL: 30 * 24 * 60 * 60 * 1000, // 30 days
};

let driverImagesMap = {};
let driverCodesMap = {};

/**
 * Official 2026 Team Mapping
 * Matches API strings to your local /images folder filenames.
 */
const teamLogos = {
    'mclaren': 'mclaren.png',
    'red bull': 'red-bull.png',
    'ferrari': 'ferrari.png',
    'mercedes': 'mercedes.png',
    'aston martin': 'aston-martin.png',
    'alpine': 'alpine.png',
    'haas': 'haas.png',
    'williams': 'williams.png',
    'racing bulls': 'rb.png',
    'rb': 'rb.png',
    'audi': 'audi.png',
    'cadillac': 'cadillac.png',
    'sauber': 'audi.png'
};

// --- UTILITIES ---

async function fetchWithCache(url, ttl) {
    const cached = localStorage.getItem(url);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < ttl) return data;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    localStorage.setItem(url, JSON.stringify({ data, timestamp: Date.now() }));
    return data;
}

/**
 * Maps constructor name to local file path using keyword matching.
 */
function getTeamLogo(teamName) {
    if (!teamName) return '';
    const name = teamName.toLowerCase();
    const match = Object.keys(teamLogos).find(key => name.includes(key));
    const filename = match ? teamLogos[match] : 'default.png';
    return `images/${filename}`;
}

// --- UI COMPONENTS ---

const UI = {
    navBtns: document.querySelectorAll('.nav-btn'),
    views: document.querySelectorAll('.view'),
    loader: document.getElementById('loader'),
    racesGrid: document.getElementById('races-grid'),
    standingsList: document.getElementById('standings-list'),
    seasonSelectRaces: document.getElementById('season-select-races'),
    seasonSelectStandings: document.getElementById('season-select-standings'),
    modal: document.getElementById('race-modal'),
    modalBody: document.getElementById('modal-body'),
    closeBtn: document.querySelector('.close-btn')
};

// --- CORE LOGIC ---

function initApp() {
    loadRaces('current');
    setupEventListeners();
}

function setupEventListeners() {
    UI.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.target.dataset.view));
    });

    UI.seasonSelectRaces.addEventListener('change', (e) => loadRaces(e.target.value));
    UI.seasonSelectStandings.addEventListener('change', (e) => loadStandings(e.target.value));

    UI.closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => { if (e.target === UI.modal) closeModal(); });
}

function switchView(viewName) {
    UI.navBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    UI.views.forEach(view => view.classList.add('hidden'));

    const target = document.getElementById(`${viewName}-view`);
    if (target) target.classList.remove('hidden');

    if (viewName === 'standings' && UI.standingsList.children.length === 0) {
        loadStandings(UI.seasonSelectStandings.value);
    }
}

async function loadDriverImages() {
    try {
        const data = await fetchWithCache(OPEN_F1_API, CACHE_CONFIG.DRIVER_IMAGES_TTL);
        data.forEach(driver => {
            const info = {
                image: driver.headshot_url?.replace('d_driver_fallback_image.png/', '') || 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback/fallback.png.transform/1col/image.png',
                teamColor: driver.team_colour ? `#${driver.team_colour}` : '#e10600'
            };
            if (driver.driver_number) driverImagesMap[driver.driver_number] = info;
            if (driver.name_acronym) driverCodesMap[driver.name_acronym.toUpperCase()] = info;
        });
    } catch (e) {
        console.error("Failed to load driver assets:", e);
    }
}

async function loadRaces(season) {
    UI.loader.classList.remove('hidden');
    try {
        const data = await fetchWithCache(`${BASE_URL}/${season}.json?limit=30`, CACHE_CONFIG.DEFAULT_TTL);
        renderRaces(data.MRData.RaceTable.Races);
    } catch (e) {
        UI.racesGrid.innerHTML = '<p class="error">Error loading race schedule.</p>';
    }
    UI.loader.classList.add('hidden');
}

function renderRaces(races) {
    UI.racesGrid.innerHTML = '';
    const today = new Date();

    races.forEach(race => {
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
        const isCompleted = raceDate < today;

        const card = document.createElement('div');
        card.className = 'race-card';
        card.innerHTML = `
            <span class="race-round">Round ${race.round}</span>
            <div class="race-status ${isCompleted ? 'status-completed' : 'status-upcoming'}">${isCompleted ? 'Completed' : 'Upcoming'}</div>
            <h3 class="race-name">${race.raceName}</h3>
            <div class="race-date">${raceDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
            <div class="race-circuit">${race.Circuit.circuitName}</div>
        `;
        card.onclick = () => openRaceModal(race, isCompleted);
        UI.racesGrid.appendChild(card);
    });
}

async function loadStandings(season) {
    UI.loader.classList.remove('hidden');
    if (Object.keys(driverImagesMap).length === 0) await loadDriverImages();

    try {
        const data = await fetchWithCache(`${BASE_URL}/${season}/driverstandings.json`, CACHE_CONFIG.DEFAULT_TTL);
        const standings = data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

        let html = `
            <div class="standing-row header">
                <div class="pos">Pos</div>
                <div class="driver-photo-col">Photo</div>
                <div class="driver">Driver</div>
                <div class="points">Points</div>
            </div>
        `;

        standings.forEach(std => {
            const d = std.Driver;
            const driverData = driverImagesMap[d.permanentNumber] || driverCodesMap[d.code] || { image: '', teamColor: '#e10600' };
            const team = std.Constructors[0].name;

            html += `
                <div class="standing-row" style="border-left: 4px solid ${driverData.teamColor}">
                    <div class="pos">${std.position}</div>
                    <div class="driver-photo-col">
                        <img src="${driverData.image}" class="driver-headshot" onerror="this.src='https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback/fallback.png.transform/1col/image.png'">
                    </div>
                    <div class="driver">
                        <span>${d.givenName} <strong>${d.familyName}</strong></span>
                        <div class="constructor-info">
                            <img src="${getTeamLogo(team)}" class="team-logo-small" onerror="this.style.display='none'">
                            <span class="constructor">${team}</span>
                        </div>
                    </div>
                    <div class="points">${std.points}</div>
                </div>`;
        });
        UI.standingsList.innerHTML = html;
    } catch (e) {
        UI.standingsList.innerHTML = '<p class="error">Error loading standings.</p>';
    }
    UI.loader.classList.add('hidden');
}

async function openRaceModal(race, isCompleted) {
    UI.modalBody.innerHTML = '<h2 style="text-align:center">Loading Results...</h2>';
    UI.modal.style.display = 'flex';
    UI.modal.classList.add('show');

    if (!isCompleted) {
        UI.modalBody.innerHTML = `
            <h2>${race.raceName}</h2>
            <p><strong>Round:</strong> ${race.round}</p>
            <p><strong>Date:</strong> ${new Date(race.date).toLocaleDateString()}</p>
            <div style="margin-top:20px; padding:15px; background:#f4f4f4; border-radius:10px;">
                Results will be available once the session concludes.
            </div>
        `;
        return;
    }

    try {
        const resData = await fetchWithCache(`${BASE_URL}/${new Date(race.date).getFullYear()}/${race.round}/results.json`, CACHE_CONFIG.HISTORICAL_TTL);
        const results = resData.MRData.RaceTable.Races[0]?.Results || [];

        UI.modalBody.innerHTML = `
            <h2>${race.raceName}</h2>
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Driver</th>
                        <th>Team</th>
                        <th>Time/Status</th>
                        <th>Pts</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => {
            // Look up driver data for the photo
            const d = r.Driver;
            const driverData = driverImagesMap[d.permanentNumber] ||
                driverCodesMap[d.code] ||
                { image: 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/fallback/fallback.png.transform/1col/image.png', teamColor: '#ccc' };

            return `
                        <tr>
                            <td>${r.position}</td>
                            <td>
                                <div class="res-driver-wrapper">
                                    <img src="${driverData.image}" class="driver-photo-mini" style="border-left: 3px solid ${driverData.teamColor}">
                                    <strong>${d.familyName}</strong>
                                </div>
                            </td>
                            <td>
                                <div class="res-team-wrapper">
                                    <img src="${getTeamLogo(r.Constructor.name)}" class="team-logo-small" onerror="this.style.display='none'">
                                    <span>${r.Constructor.name}</span>
                                </div>
                            </td>
                            <td>${r.Time?.time || r.status}</td>
                            <td class="points-col">${r.points}</td>
                        </tr>`;
        }).join('')}
                </tbody>
            </table>`;
    } catch (e) {
        UI.modalBody.innerHTML = '<h2>Error</h2><p>Could not fetch race results.</p>';
    }
}

function closeModal() {
    UI.modal.classList.remove('show');
    setTimeout(() => UI.modal.style.display = 'none', 300);
}

// Start
document.addEventListener('DOMContentLoaded', initApp);