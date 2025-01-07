// Handle Bot Status Change Function
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Updating Bot Status:", { botId, botName, botType, exchange, status });

    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, bot_type: botType, exchange, status }),
        });

        const result = await response.json();

        if (result.success) {
            alert(`${botName.replace('_', ' ')} (${exchange}, ${botType}) is now ${status ? 'ON' : 'OFF'}`);
        } else {
            alert(`Failed to update ${botName.replace('_', ' ')} status.`);
        }
    } catch (error) {
        console.error('Error while updating bot status:', error);
        alert(`An error occurred while updating the status for ${botName.replace('_', ' ')}`);
    }
}

// Add Event Listeners to All Toggle Switches
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;

        // Find the closest container with bot-related attributes
        const botContainer = this.closest('.bot-container');
        const botId = botContainer.getAttribute('data-bot-id');
        const botName = botContainer.querySelector('.bot-name').innerText.trim();
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';

        // Extract exchange value from the associated form or dropdown
        const form = this.closest('form');
        const exchange = form.querySelector('select[name="exchange"]').value;

        // Update the status for this specific bot
        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

// Function to show a section based on sectionId
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

// Event Listeners for Navigation Links
document.getElementById('home-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('home-section');
});

document.getElementById('spot-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('spot-section');
});

document.getElementById('futures-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('futures-section');
});

document.getElementById('settings-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('settings-section');
});

// Spot Bot Configuration Functions
function showSpotBotConfigForm(botName) {
    const configHeader = document.getElementById('spot-bot-config-header');
    const configContainer = document.getElementById('spot-bot-config-container');
    configHeader.innerText = `${botName} Configuration`;
    configContainer.style.display = 'block';
}

function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Futures Bot Configuration Functions
function showFuturesBotConfigForm(botName) {
    const configHeader = document.getElementById('futures-bot-config-header');
    const configContainer = document.getElementById('futures-bot-config-container');
    configHeader.innerText = `${botName} Configuration`;
    configContainer.style.display = 'block';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Spot Bot Form Submission
document.getElementById('spot-bot-config-form').addEventListener('submit', async event => {
    event.preventDefault();

    const botName = document.getElementById('spot-bot-config-header').innerText.replace(' Configuration', '');
    const exchange = document.getElementById('spot-exchange').value;
    const apiKey = document.getElementById('spot-api-key').value;
    const apiSecret = document.getElementById('spot-api-secret').value;
    const tradeAmount = document.getElementById('spot-trade-amount').value;
    const tradePair = document.getElementById('spot-trade-pair').value;
    const timeFrame = document.getElementById('spot-time-frame').value;

    const spotBotConfig = {
        botName,
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        timeFrame,
    };

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spotBotConfig),
        });

        const result = await response.json();
        alert(result.success
            ? `${botName} configuration updated successfully!`
            : `Failed to update ${botName} configuration.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the configuration.');
    }

    closeSpotBotConfigForm();
});

// Futures Bot Form Submission
document.getElementById('futures-bot-config-form').addEventListener('submit', async event => {
    event.preventDefault();

    const botName = document.getElementById('futures-bot-config-header').innerText.replace(' Configuration', '');
    const exchange = document.getElementById('futures-exchange').value;
    const apiKey = document.getElementById('futures-api-key').value;
    const apiSecret = document.getElementById('futures-api-secret').value;
    const tradeAmount = document.getElementById('futures-trade-amount').value;
    const tradePair = document.getElementById('futures-trade-pair').value;
    const leverage = document.getElementById('leverage').value;
    const timeFrame = document.getElementById('futures-time-frame').value;

    const futuresBotConfig = {
        botName,
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        leverage,
        timeFrame,
    };

    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(futuresBotConfig),
        });

        const result = await response.json();
        alert(result.success
            ? `${botName} configuration updated successfully!`
            : `Failed to update ${botName} configuration.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the configuration.');
    }

    closeFuturesBotConfigForm();
});

// Handle Bot Status Change
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, bot_type: botType, exchange, status }),
        });

        const result = await response.json();
        alert(result.success
            ? `${botName} (${exchange}, ${botType}) is now ${status ? 'ON' : 'OFF'}`
            : `Failed to update ${botName} status.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the bot status.');
    }
}

// Add Event Listeners for Bot Toggles
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;
        const form = this.closest('form');
        const botContainer = form.closest('.bot-container');
        const botId = botContainer.getAttribute('data-bot-id');
        const botName = botContainer.querySelector('.bot-name').innerText;
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

// Fetch Active Bots
async function fetchActiveBots() {
    try {
        const response = await fetch('/api/active_bots');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();

        if (data.binance) document.getElementById('binance-bots').textContent = `Number of bots running: ${data.binance}`;
        if (data.bybit) document.getElementById('bybit-bots').textContent = `Number of bots running: ${data.bybit}`;
    } catch (error) {
        console.error('Failed to fetch active bots:', error);
    }
}

// Fetch Balances
async function fetchBalances() {
    try {
        const response = await fetch('/api/balances');
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();

        if (data.binance) document.getElementById('binance-balance').textContent = `Balance: ${data.binance}`;
        if (data.bybit) document.getElementById('bybit-balance').textContent = `Balance: ${data.bybit}`;
    } catch (error) {
        console.error('Failed to fetch balances:', error);
    }
}

// Initialize Fetch on Page Load
document.addEventListener('DOMContentLoaded', () => {
    fetchActiveBots();
    fetchBalances();
    setInterval(fetchBalances, 60000); // Refresh balances every 60 seconds
});

