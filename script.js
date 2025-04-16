import { schedule } from './data.js';

const gameList = document.getElementById('gameList');

// Wager input and button (initially hidden)
const wagerContainer = document.createElement('div');
wagerContainer.id = 'wagerContainer';
wagerContainer.classList.add('wager-container');

const wagerLabel = document.createElement('label');
wagerLabel.id = 'wagerLabel';
wagerLabel.textContent = 'Custom Wager Amount: ';
wagerLabel.classList.add('wager-label');
wagerLabel.style.display = 'none';

const wagerInput = document.createElement('input');
wagerInput.id = 'wagerInput';
wagerInput.type = 'number';
wagerInput.value = '';
wagerInput.label = 'wager';
wagerInput.classList.add('wager-input');
wagerInput.style.display = 'none';

const addWagerButton = document.createElement('button');
addWagerButton.id = 'addWagerButton';
addWagerButton.textContent = 'Add Custom Wager';
addWagerButton.classList.add('wager-button', 'add-wager-button');

const hideWagerButton = document.createElement('button');
hideWagerButton.id = 'hideWagerButton';
hideWagerButton.textContent = 'Hide Wager';
hideWagerButton.classList.add('wager-button', 'hide-wager-button');
hideWagerButton.style.display = 'none';

hideWagerButton.addEventListener('mouseover', () => {
    hideWagerButton.classList.add('hover');
});

hideWagerButton.addEventListener('mouseout', () => {
    hideWagerButton.classList.remove('hover');
});

addWagerButton.addEventListener('mouseover', () => {
    addWagerButton.classList.add('hover');
});

addWagerButton.addEventListener('mouseout', () => {
    addWagerButton.classList.remove('hover');
});

wagerContainer.appendChild(wagerLabel);
wagerContainer.appendChild(wagerInput);

document.body.insertBefore(addWagerButton, document.body.firstChild);
document.body.insertBefore(wagerContainer, addWagerButton);
document.body.insertBefore(hideWagerButton, wagerContainer.nextSibling);

let currentWager = null;

// Total Stats Section
const totalStats = document.createElement('div');
totalStats.id = 'totalStats';

totalStats.innerHTML = `
    <div class="stat-item">
        <span class="stat-label">Wins: <span id="totalWinsStat" class="wins">0</span></span>
    </div>
    <div class="stat-item">
        <span class="stat-label">Losses: <span id="totalLossesStat" class="losses">0</span></span>
    </div>
    <div class="stat-item">
        <span class="stat-label">Units: <span id="totalUnitsStat" class="units">0.00</span></span>
    </div>
    <div class="stat-item" id="totalWinningsContainer" style="display: none;">
        <span class="stat-label">Winnings: <span id="totalWinningsStat" class="winnings">0.00</span></span>
    </div>
`;

document.body.insertBefore(totalStats, document.body.firstChild);

let totalWins = 0;
let totalLosses = 0;
let totalUnits = 0;
let totalWinnings = 0;

function updateTotalStats(win, units, winnings) {
    if (win) {
        totalWins++;
        totalUnits += units;
        if (currentWager !== null) {
            totalWinnings += winnings;
        }
    } else {
        totalLosses++;
        totalUnits -= 1;
        if (currentWager !== null) {
            totalWinnings -= currentWager || 0;
        }
    }
    document.getElementById('totalWinsStat').textContent = totalWins;
    document.getElementById('totalLossesStat').textContent = totalLosses;
    document.getElementById('totalUnitsStat').textContent = (totalUnits >= 0 ? '+' : '') + totalUnits.toFixed(2);
    document.getElementById('totalWinningsStat').textContent = (totalWinnings >= 0 ? '+' : '') + '$' + Math.abs(totalWinnings).toFixed(2);
    document.getElementById('totalWinningsContainer').style.display = currentWager !== null ? 'block' : 'none';
}

function formatDate(gameDate) {
    const date = new Date(gameDate.slice(0, 4), gameDate.slice(4, 6) - 1, gameDate.slice(6, 8));
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function calculateWinnings(odds, betAmount) {
    if (!odds) return 'Odds not available';
    if (odds.startsWith('+')) {
        return (betAmount * (parseInt(odds.slice(1)) / 100)).toFixed(2);
    } else {
        return (betAmount / (parseInt(odds.slice(1)) / 100)).toFixed(2);
    }
}

function renderGameCard(game) {
    const card = document.createElement('div');
    card.classList.add('game-card');
    card.classList.add('scoreboard-card');
    if (game.betStatus === 'Win') {
        card.classList.add('win');
    } else if (game.betStatus === 'Loss') {
        card.classList.add('loss');
    } else if (!game.betStatus && game.gameDate > new Date().toISOString().slice(0, 10).replace(/-/g, '')) {
        card.classList.add('future');
    }

    let scoreDisplay = '';
    if (game.score) {
        const scores = game.score.split('-');
        const awayScore = scores[0] ? scores[0].trim() : '-';
        const homeScore = scores[1] ? scores[1].trim() : '-';
        scoreDisplay = `<div class="score-display">
                                    <span class="away-score">${awayScore}</span> - <span class="home-score">${homeScore}</span>
                                </div>`;
    }

    let betDetails = '';
    if (game.odds) {
        betDetails += `<p class="odds">Odds: ${game.odds}</p>`;
        betDetails += `<p class="unit-winnings">1 Unit: ${calculateWinnings(game.odds, 1)} units</p>`;
        if (currentWager !== null && game.betStatus === 'Win') {
            betDetails += `<p class="gain">Gain: $${calculateWinnings(game.odds, currentWager)}</p>`;
        } else if (currentWager !== null && game.betStatus === 'Loss') {
            betDetails += `<p class="loss">Loss: $${currentWager}</p>`;
        }
    }
    if (game.betStatus) {
        betDetails += `<p class="bet-status ${game.betStatus.toLowerCase()}">${game.betStatus}</p>`;
    }

    card.innerHTML = `
        <div class="game-info">
            <p class="date">${formatDate(game.gameDate)}</p>
            <p class="teams">
                <img src="logos/${game.teamIDAway}.png" alt="${game.away} Logo" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 3px;">
                <span class="away-team">${game.away}</span> @
                <span class="home-team">${game.home}</span>
                <img src="logos/${game.teamIDHome}.png" alt="${game.home} Logo" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 3px;">
            </p>
            ${scoreDisplay}
            ${game.gameTime ? `<p class="time">Time: ${game.gameTime}</p>` : ''}
        </div>
        <div class="bet-info">
            ${betDetails}
        </div>
    `;

    return card;
}

function renderMainGame(game) {
    const listItem = document.createElement('li');
    listItem.classList.add('scoreboard-main-card');
    if (game.betStatus === 'Win') {
        listItem.classList.add('win');
    } else if (game.betStatus === 'Loss') {
        listItem.classList.add('loss');
    } else if (!game.betStatus && game.gameDate > new Date().toISOString().slice(0, 10).replace(/-/g, '')) {
        listItem.classList.add('future');
    }

    let scoreDisplay = '';
    if (game.score) {
        const scores = game.score.split('-');
        const awayScore = scores[0] ? scores[0].trim() : '-';
        const homeScore = scores[1] ? scores[1].trim() : '-';
        scoreDisplay = `<div class="score-display">
                                    <span class="away-score">${awayScore}</span> - <span class="home-score">${homeScore}</span>
                                </div>`;
    }

    listItem.innerHTML = `
        <div class="game-info">
            <p class="date"><strong>Date:</strong> ${formatDate(game.gameDate)}</p>
            <p class="teams">
                <img src="logos/${game.teamIDAway}.png" alt="${game.away} Logo" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">
                <span class="away-team">${game.away}</span> @
                <span class="home-team">${game.home}</span>
                <img src="logos/${game.teamIDHome}.png" alt="${game.home} Logo" style="width: 24px; height: 24px; vertical-align: middle; margin-left: 5px;">
            </p>
            ${scoreDisplay}
            <p class="time"><strong>Game Time:</strong> ${game.gameTime}</p>
            ${game.odds ? `<p class="odds"><strong>Odds:</strong> ${game.odds}</p>` : ''}
            ${game.odds ? `<p class="unit-winnings"><strong>1 Unit Winnings:</strong> ${calculateWinnings(game.odds, 1)} units</p>` : ''}
            ${currentWager !== null && game.odds && game.betStatus !== 'Win' && game.betStatus !== 'Loss' ? `<p class="potential"><strong>$${currentWager} Wins:</strong> $${calculateWinnings(game.odds, currentWager)}</p>` : ''}
            ${game.betStatus === 'Win' && game.odds && currentWager !== null ? `<p class="gain"><strong>Gain:</strong> $${calculateWinnings(game.odds, currentWager)}</p>` : ''}
            ${game.betStatus === 'Loss' && game.odds && currentWager !== null ? `<p class="loss"><strong>Loss:</strong> $${currentWager}</p>` : ''}
            ${game.betStatus ? `<p class="bet-status ${game.betStatus.toLowerCase()}"><strong>Status:</strong> ${game.betStatus}</p>` : ''}
        </div>
    `;

    return listItem;
}

function findCurrentOrNextGame() {
    const today = new Date();
    const todayString = today.toISOString().slice(0, 10).replace(/-/g, '');
    for (const game of schedule) {
        if (game.gameDate === todayString) return game;
        if (game.gameDate > todayString) return game;
    }
    return null;
}

function getPastGames(startIndex, count) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const pastGames = schedule.filter(game => game.gameDate < today).reverse();
    return pastGames.slice(startIndex, startIndex + count);
}

function getFutureGames(startIndex, count) {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const futureGames = schedule.filter(game => game.gameDate > today);
    return futureGames.slice(startIndex, startIndex + count);
}

function createDropdown(label, gamesFunction, id) {
    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-container');
    dropdown.innerHTML = `
        <button class="dropdown-button">${label}</button>
        <div class="dropdown-list" id="${id}" style="display: none;"></div>
        <button class="load-more" style="display:none;">Load More</button>
    `;
    document.body.appendChild(dropdown);
    const button = dropdown.querySelector('.dropdown-button');
    const list = dropdown.querySelector('.dropdown-list');
    const loadMoreButton = dropdown.querySelector('.load-more');
    let startIndex = 0;
    const count = 5;

    function loadGames() {
        const games = gamesFunction(startIndex, count);
        games.forEach(game => {
            const card = renderGameCard(game);
            list.appendChild(card);
            // ENSURING NO EVENT LISTENER IS ADDED HERE
        });
        startIndex += count;
        loadMoreButton.style.display = games.length < count ? 'none' : 'block';
    }

    button.addEventListener('click', () => {
        list.style.display = list.style.display === 'none' ? 'block' : 'none';
        if (list.style.display === 'block' && list.children.length === 0) loadGames();
        loadMoreButton.style.display = list.style.display === 'none' ? 'none' : 'block';
    });

    loadMoreButton.addEventListener('click', loadGames);

    // ABSOLUTELY NO EVENT LISTENER FOR CLICK ON THE LIST OR ITS CHILDREN
    // list.addEventListener('click', (event) => { ... });
}

function recalculateStats() {
    totalWins = 0;
    totalLosses = 0;
    totalUnits = 0;
    totalWinnings = 0;
    schedule.forEach(game => {
        if (game.betStatus === 'Win' && game.odds) {
            updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), currentWager ? parseFloat(calculateWinnings(game.odds, currentWager)) : 0);
        } else if (game.betStatus === 'Loss' && game.odds) {
            updateTotalStats(false, 1, currentWager ? currentWager : 0);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    recalculateStats();

    const currentGame = findCurrentOrNextGame();
    if (currentGame) {
        const mainGameElement = renderMainGame(currentGame);
        gameList.appendChild(mainGameElement);
        // OPTIONALLY REMOVE ANY CLICK LISTENERS FROM THE MAIN GAME ELEMENT IF ANY WERE ADDED ELSEWHERE
        // gameList.removeEventListener('click', /* ... your listener ... */);
        // If individual elements inside mainGameElement had listeners:
        // const someElement = mainGameElement.querySelector('.some-class');
        // if (someElement) {
        //     someElement.removeEventListener('click', /* ... listener ... */);
        // }
    }
    createDropdown('Past Games', getPastGames, 'pastGamesList');
    createDropdown('Future Games', getFutureGames, 'futureGamesList');

    addWagerButton.addEventListener('click', () => {
        wagerLabel.style.display = 'block';
        wagerInput.style.display = 'block';
        addWagerButton.style.display = 'none';
        hideWagerButton.style.display = 'block';
    });

    hideWagerButton.addEventListener('click', () => {
        wagerLabel.style.display = 'none';
        wagerInput.style.display = 'none';
        addWagerButton.style.display = 'block';
        hideWagerButton.style.display = 'none';
        currentWager = null;
        wagerInput.value = '';
        gameList.innerHTML = '';
        gameList.appendChild(renderMainGame(findCurrentOrNextGame()));
        recalculateStats();
    });

    wagerInput.addEventListener('input', () => {
        currentWager = wagerInput.value ? parseFloat(wagerInput.value) : null;
        gameList.innerHTML = '';
        gameList.appendChild(renderMainGame(findCurrentOrNextGame()));
        recalculateStats();
    });
});