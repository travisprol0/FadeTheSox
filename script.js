import { schedule } from './data.js';

const gameList = document.getElementById('gameList');

// Wager input and button (initially hidden)
const wagerContainer = document.createElement('div');
wagerContainer.style.display = 'flex';
wagerContainer.style.alignItems = 'center';
wagerContainer.style.justifyContent = 'center';

const wagerLabel = document.createElement('label');
wagerLabel.textContent = 'Custom Wager Amount: ';
wagerLabel.style.display = 'none';
wagerLabel.style.marginRight = '5px';
wagerLabel.style.fontFamily = 'Arial, sans-serif';
wagerLabel.style.fontSize = '16px';

const wagerInput = document.createElement('input');
wagerInput.type = 'number';
wagerInput.value = '';
wagerInput.label = 'wager';
wagerInput.style.width = '100px';
wagerInput.style.display = 'none';
wagerInput.style.padding = '8px';
wagerInput.style.border = '1px solid #ccc';
wagerInput.style.borderRadius = '4px';
wagerInput.style.fontFamily = 'Arial, sans-serif';
wagerInput.style.fontSize = '16px';
wagerInput.style.textAlign = 'center';

const addWagerButton = document.createElement('button');
addWagerButton.textContent = 'Add Custom Wager';
addWagerButton.style.display = 'block';
addWagerButton.style.margin = '5px auto 10px auto';
addWagerButton.style.padding = '10px 15px';
addWagerButton.style.backgroundColor = '#4CAF50';
addWagerButton.style.color = 'white';
addWagerButton.style.border = 'none';
addWagerButton.style.borderRadius = '4px';
addWagerButton.style.cursor = 'pointer';
addWagerButton.style.fontFamily = 'Arial, sans-serif';
addWagerButton.style.fontSize = '16px';
addWagerButton.style.transition = 'background-color 0.3s ease';

const hideWagerButton = document.createElement('button');
hideWagerButton.textContent = 'Hide Wager';
hideWagerButton.style.display = 'none';
hideWagerButton.style.margin = '5px auto 10px auto';
hideWagerButton.style.padding = '10px 15px';
hideWagerButton.style.backgroundColor = '#ccc';
hideWagerButton.style.color = 'black';
hideWagerButton.style.border = 'none';
hideWagerButton.style.borderRadius = '4px';
hideWagerButton.style.cursor = 'pointer';
hideWagerButton.style.fontFamily = 'Arial, sans-serif';
hideWagerButton.style.fontSize = '16px';
hideWagerButton.style.transition = 'background-color 0.3s ease';

hideWagerButton.addEventListener('mouseover', () => {
    hideWagerButton.style.backgroundColor = '#bbb';
});

hideWagerButton.addEventListener('mouseout', () => {
    hideWagerButton.style.backgroundColor = '#ccc';
});

addWagerButton.addEventListener('mouseover', () => {
  addWagerButton.style.backgroundColor = '#45a049';
});

addWagerButton.addEventListener('mouseout', () => {
  addWagerButton.style.backgroundColor = '#4CAF50';
});

wagerContainer.appendChild(wagerLabel);
wagerContainer.appendChild(wagerInput);

document.body.insertBefore(addWagerButton, document.body.firstChild);
document.body.insertBefore(wagerContainer, addWagerButton);
document.body.insertBefore(hideWagerButton, wagerContainer.nextSibling);

let currentWager = null;

// Total Stats Section - Fun Styling
const totalStats = document.createElement('div');
totalStats.id = 'totalStats';
totalStats.style.position = 'sticky';
totalStats.style.top = '0';
totalStats.style.backgroundColor = '#f0f8ff';
totalStats.style.padding = '20px';
totalStats.style.borderBottom = '3px solid #add8e6';
totalStats.style.zIndex = '100';
totalStats.style.fontFamily = 'Arial, sans-serif';
totalStats.style.fontSize = '18px';
totalStats.style.color = '#2f4f4f';
totalStats.style.borderRadius = '10px';
totalStats.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
totalStats.style.display = 'flex';
totalStats.style.justifyContent = 'space-around';
totalStats.style.alignItems = 'center';

totalStats.innerHTML = `
    <div style="text-align: center;">
        <span style="color: #008000; font-weight: bold;">Wins: <span id="totalWinsStat">0</span></span>
    </div>
    <div style="text-align: center;">
        <span style="color: #ff0000; font-weight: bold;">Losses: <span id="totalLossesStat">0</span></span>
    </div>
    <div style="text-align: center;">
        <span style="color: #ffa500; font-weight: bold;">Units: <span id="totalUnitsStat">0.00</span></span>
    </div>
    <div style="text-align: center; display: none;" id="totalWinningsContainer">
        <span style="color: #4682b4; font-weight: bold;">Winnings: $<span id="totalWinningsStat">0.00</span></span>
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
        if(currentWager !== null){
          totalWinnings += winnings;
        }
    } else {
        totalLosses++;
        totalUnits -= 1;
        if(currentWager !== null){
          totalWinnings -= currentWager || 0;
        }
    }
    document.getElementById('totalWinsStat').textContent = totalWins;
    document.getElementById('totalLossesStat').textContent = totalLosses;
    document.getElementById('totalUnitsStat').textContent = totalUnits.toFixed(2);
    document.getElementById('totalWinningsStat').textContent = totalWinnings.toFixed(2);
    if(currentWager !== null){
      document.getElementById('totalWinningsContainer').style.display = 'block';
    }else{
      document.getElementById('totalWinningsContainer').style.display = 'none';
    }
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
    let cardStyle = '';
    let textColor = 'white'; // Default text color

    if (game.betStatus === 'Win') {
        cardStyle = 'background-color: #a8e0a8; border: 1px solid #7ac27a; color: black;';
        textColor = 'black';
    } else if (game.betStatus === 'Loss') {
        cardStyle = 'background-color: #e8a8a8; border: 1px solid #d08080; color: black;';
        textColor = 'black';
    } else if (!game.betStatus && game.gameDate > new Date().toISOString().slice(0, 10).replace(/-/g, '')) {
        // Future game
        cardStyle = 'background-color: #333; border: 1px solid #555;';
        textColor = 'white';
    } else {
        cardStyle = 'border: 1px solid #ccc;';
    }

    card.innerHTML = `
        <p style="color: ${textColor};"><strong>Date:</strong> ${formatDate(game.gameDate)}</p>
        <p style="color: ${textColor};"><strong>Teams:</strong> ${game.away} @ ${game.home}</p>
        ${game.score ? `<p style="color: ${textColor};"><strong>Score:</strong> ${game.score}</p>` : ''}        
        ${game.odds ? `<p style="color: ${textColor};"><strong>Odds:</strong> ${game.odds}</p>` : ''}
        ${game.odds ? `<p style="color: ${textColor};"><strong>1 Unit Winnings:</strong> ${calculateWinnings(game.odds, 1)} units</p>` : ''}
        ${game.betStatus ? `<p style="color: ${textColor};"><strong>Bet Status:</strong> ${game.betStatus}</p>` : ''}
        ${game.gameTime ? `<p style="color: ${textColor};"><strong>Time:</strong> ${game.gameTime}</p>` : ''}
    `;

    card.setAttribute('style', cardStyle);

    return card;
}

function renderMainGame(game) {
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <p><strong>Game Date:</strong> ${formatDate(game.gameDate)}</p>
        <p><strong>Teams:</strong> ${game.away} @ ${game.home}</p>
        <p><strong>Game Time:</strong> ${game.gameTime}</p>
        ${game.odds ? `<p><strong>Odds:</strong> ${game.odds}</p>` : ''}
        ${game.odds ? `<p><strong>1 Unit Winnings:</strong> ${calculateWinnings(game.odds, 1)} units</p>` : ''}
        ${game.score ? `<p><strong>Score:</strong> ${game.score}</p>` : ''}
        ${game.betStatus ? `<p><strong>Bet Status:</strong> ${game.betStatus}</p>` : ''}
    `;
    if (game.betStatus === 'Win' && game.odds && wagerInput.style.display === 'block' && currentWager !== null) {
        listItem.innerHTML += `<p><strong>Gain:</strong> $${calculateWinnings(game.odds, currentWager)}</p>`;
        updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), parseFloat(calculateWinnings(game.odds, currentWager)));
    } else if (game.betStatus === 'Loss' && game.odds && wagerInput.style.display === 'block' && currentWager !== null) {
        listItem.innerHTML += `<p><strong>Loss:</strong> $${currentWager}</p>`;
        updateTotalStats(false, 1, currentWager);
    } else if (game.betStatus === 'Win' && game.odds && currentWager === null){
        updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), 0);
    } else if (game.betStatus === 'Loss' && game.odds && currentWager === null) {
        updateTotalStats(false, 1, 0);
    }
    if (wagerInput.style.display === 'block' && currentWager !== null && game.odds && game.betStatus !== 'Win' && game.betStatus !== 'Loss') {
        listItem.innerHTML += `
            <p><strong>Wager:</strong> $${currentWager}</p>
            <p><strong>Potential Winnings:</strong> $${calculateWinnings(game.odds, currentWager)}</p>
        `;
    }
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
    dropdown.innerHTML = `
        <button class="dropdown-button">${label}</button>
        <div class="dropdown-list" id="${id}"></div>
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
        games.forEach(game => list.appendChild(renderGameCard(game)));
        startIndex += count;
        loadMoreButton.style.display = games.length < count ? 'none' : 'block';
    }
    button.addEventListener('click', () => {
        list.style.display = list.style.display === 'block' ? 'none' : 'block';
        if (list.style.display === 'block' && list.children.length === 0) loadGames();
        loadMoreButton.style.display = list.style.display === 'none' ? 'none' : 'block';
    });
    loadMoreButton.addEventListener('click', loadGames);
    list.addEventListener('click', (event) => {
        const card = event.target.closest('.game-card');
        if (card) {
            const index = Array.from(list.children).indexOf(card);
            gameList.innerHTML = '';
            gameList.appendChild(renderMainGame(gamesFunction(0, Infinity)[index]));
            list.style.display = 'none';
            loadMoreButton.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    schedule.forEach(game => {
        if (game.betStatus === 'Win' && game.odds) {
            updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), 0);
        } else if (game.betStatus === 'Loss' && game.odds) {
            updateTotalStats(false, 1, 0);
        }
    });

    const currentGame = findCurrentOrNextGame();
    if (currentGame) gameList.appendChild(renderMainGame(currentGame));
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
        totalWins = 0;
        totalLosses = 0;
        totalUnits = 0;
        totalWinnings = 0;
        schedule.forEach(game => {
            if (game.betStatus === 'Win' && game.odds) {
                updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), 0);
            } else if (game.betStatus === 'Loss' && game.odds) {
                updateTotalStats(false, 1, 0);
            }
        });
    });

    wagerInput.addEventListener('input', () => {
        if (wagerInput.value) {
            currentWager = parseFloat(wagerInput.value);
            gameList.innerHTML = '';
            gameList.appendChild(renderMainGame(findCurrentOrNextGame()));
            totalWins = 0;
            totalLosses = 0;
            totalUnits = 0;
            totalWinnings = 0;
            schedule.forEach(game => {
                if (game.betStatus === 'Win' && game.odds) {
                    updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), parseFloat(calculateWinnings(game.odds, currentWager)));
                } else if (game.betStatus === 'Loss' && game.odds) {
                    updateTotalStats(false, 1, currentWager);
                }
            });
        } else {
            currentWager = null;
            gameList.innerHTML = '';
            gameList.appendChild(renderMainGame(findCurrentOrNextGame()));
            totalWins = 0;
            totalLosses = 0;
            totalUnits = 0;
            totalWinnings = 0;
            schedule.forEach(game => {
                if (game.betStatus === 'Win' && game.odds) {
                    updateTotalStats(true, parseFloat(calculateWinnings(game.odds, 1)), 0);
                } else if (game.betStatus === 'Loss' && game.odds) {
                    updateTotalStats(false, 1, 0);
                }
            });
        }
    });
});