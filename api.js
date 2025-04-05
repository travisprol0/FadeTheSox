export async function getGameData() {
    const apiUrl = 'https://your-api-url.com/odds'; // Replace with your API URL
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Filter for White Sox games
    return data.filter(game => game.team === 'White Sox');
}
