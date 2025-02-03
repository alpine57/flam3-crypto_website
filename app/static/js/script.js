// Object to store bot configurations (client-side)
const botConfigs = {};

// Function to show a section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach((section) => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

// Event listeners for navigation links
document.getElementById('home-link').addEventListener('click', function (event) {
    event.preventDefault();
    showSection('home-section');
});

document.getElementById('spot-link').addEventListener('click', function (event) {
    event.preventDefault();
    showSection('spot-section');
});

document.getElementById('futures-link').addEventListener('click', function (event) {
    event.preventDefault();
    showSection('futures-section');
});

document.getElementById('settings-link').addEventListener('click', function (event) {
    event.preventDefault();
    showSection('settings-section');
});

// Function to open the configuration form for a specific Spot bot
function showSpotBotConfigForm(botName, botId) {
    if (!botConfigs[botId]) {
        botConfigs[botId] = {
            exchange: 'binance',
            apiKey: '',
            apiSecret: '',
            tradeAmount: '',
            tradePair: '',
            timeFrame: '1m',
            botStatus: false, // Default off
        };
    }

    const config = botConfigs[botId];

    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('spot-exchange').value = config.exchange;
    document.getElementById('spot-api-key').value = config.apiKey;
    document.getElementById('spot-api-secret').value = config.apiSecret;
    document.getElementById('spot-trade-amount').value = config.tradeAmount;
    document.getElementById('spot-trade-pair').value = config.tradePair;
    document.getElementById('spot-time-frame').value = config.timeFrame;
    document.getElementById('spot-bot-status').checked = config.botStatus;

    document.getElementById('spot-bot-config-container').style.display = 'block';
    document.getElementById('spot-bot-config-form').dataset.botId = botId;
}

// Function to open the configuration form for a specific Futures bot
function showFuturesBotConfigForm(botName, botId) {
    if (!botConfigs[botId]) {
        botConfigs[botId] = {
            exchange: 'binance',
            apiKey: '',
            apiSecret: '',
            tradeAmount: '',
            tradePair: '',
            leverage: '10',
            botStatus: false, // Default off
        };
    }

    const config = botConfigs[botId];

    document.getElementById('futures-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('futures-exchange').value = config.exchange;
    document.getElementById('futures-api-key').value = config.apiKey;
    document.getElementById('futures-api-secret').value = config.apiSecret;
    document.getElementById('futures-trade-amount').value = config.tradeAmount;
    document.getElementById('futures-trade-pair').value = config.tradePair;
    document.getElementById('futures-leverage').value = config.leverage;
    document.getElementById('futures-bot-status').checked = config.botStatus;

    document.getElementById('futures-bot-config-container').style.display = 'block';
    document.getElementById('futures-bot-config-form').dataset.botId = botId;
}

// Function to save Spot bot configuration and send to backend
async function saveSpotBotConfig(botId) {
    const config = {
        exchange: document.getElementById('spot-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked,
    };

    botConfigs[botId] = config;

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ botId, ...config }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Configuration for ${botId} saved successfully!`);
        } else {
            alert(`Failed to save configuration for ${botId}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }
}

// Function to save Futures bot configuration and send to backend
async function saveFuturesBotConfig(botId) {
    const config = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('futures-api-key').value,
        apiSecret: document.getElementById('futures-api-secret').value,
        tradeAmount: document.getElementById('futures-trade-amount').value,
        tradePair: document.getElementById('futures-trade-pair').value,
        leverage: document.getElementById('futures-leverage').value,
        botStatus: document.getElementById('futures-bot-status').checked,
    };

    botConfigs[botId] = config;

    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ botId, ...config }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Configuration for ${botId} saved successfully!`);
        } else {
            alert(`Failed to save configuration for ${botId}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }
}

// Function to close the Spot bot configuration form
function closeSpotBotConfigForm() {
    const botId = document.getElementById('spot-bot-config-form').dataset.botId;
    if (!botId) {
        console.error("Error: Bot ID is missing!");
        return;
    }
    saveSpotBotConfig(botId); 
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Function to close the Futures bot configuration form
function closeFuturesBotConfigForm() {
    const botId = document.getElementById('futures-bot-config-form').dataset.botId;
    if (!botId) {
        console.error("Error: Bot ID is missing!");
        return;
    }
    saveFuturesBotConfig(botId); 
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Submit handler for Spot Bot Configuration form
document.getElementById('spot-bot-config-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const botId = event.target.dataset.botId;
    if (!botId) {
        console.error("Error: Bot ID is missing!");
        return;
    }
    saveSpotBotConfig(botId);
    closeSpotBotConfigForm();
});

// Submit handler for Futures Bot Configuration form
document.getElementById('futures-bot-config-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const botId = event.target.dataset.botId;
    if (!botId) {
        console.error("Error: Bot ID is missing!");
        return;
    }
    saveFuturesBotConfig(botId);
    closeFuturesBotConfigForm();
});

