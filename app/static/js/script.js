// Object to store bot configurations (client-side)
const botConfigs = {};

// Function to show a section and hide others
function showSection(sectionId) {
    document.querySelectorAll('.content').forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

// Ensure navigation links exist before adding event listeners
document.getElementById('home-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showSection('home-section');
});

document.getElementById('spot-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showSection('spot-section');
});

document.getElementById('futures-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showSection('futures-section');
});

document.getElementById('settings-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    showSection('settings-section');
});

// Function to open the Spot Bot Configuration form
function showSpotBotConfigForm(botName, botId) {
    const config = botConfigs[botId] || {
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        tradeAmount: '',
        tradePair: '',
        timeFrame: '1m',
        botStatus: false,
    };

    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;

    // Populate form fields with bot's settings
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

// Function to open the Futures Bot Configuration form
function showFuturesBotConfigForm(botName, botId) {
    const config = botConfigs[botId] || {
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        tradeAmount: '',
        tradePair: '',
        timeFrame: '1m',
        botStatus: false,
    };

    document.getElementById('futures-bot-config-header').innerText = `${botName} Configuration`;

    // Populate form fields with bot's settings
    document.getElementById('futures-exchange').value = config.exchange;
    document.getElementById('futures-api-key').value = config.apiKey;
    document.getElementById('futures-api-secret').value = config.apiSecret;
    document.getElementById('futures-trade-amount').value = config.tradeAmount;
    document.getElementById('futures-trade-pair').value = config.tradePair;
    document.getElementById('futures-time-frame').value = config.timeFrame;
    document.getElementById('futures-bot-status').checked = config.botStatus;

    document.getElementById('futures-bot-config-container').style.display = 'block';
    document.getElementById('futures-bot-config-form').dataset.botId = botId;
}

// Function to close the Spot Bot Configuration form
function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Function to close the Futures Bot Configuration form
function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Spot Bot Form Submit Handler
document.getElementById('spot-bot-config-form')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const botId = event.target.dataset.botId;

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
    console.log(`Saved configuration for ${botId} (local state):`, config);

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, ...config }),
        });
        const result = await response.json();
        alert(result.success ? `Configuration for ${botId} saved successfully!` : `Failed to save configuration for ${botId}.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }

    closeSpotBotConfigForm();
});

// Futures Bot Form Submit Handler
document.getElementById('futures-bot-config-form')?.addEventListener('submit', async function (event) {
    event.preventDefault();
    const botId = event.target.dataset.botId;

    const config = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('futures-api-key').value,
        apiSecret: document.getElementById('futures-api-secret').value,
        tradeAmount: document.getElementById('futures-trade-amount').value,
        tradePair: document.getElementById('futures-trade-pair').value,
        timeFrame: document.getElementById('futures-time-frame').value,
        botStatus: document.getElementById('futures-bot-status').checked,
    };

    botConfigs[botId] = config;
    console.log(`Saved configuration for ${botId} (local state):`, config);

    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, ...config }),
        });
        const result = await response.json();
        alert(result.success ? `Configuration for ${botId} saved successfully!` : `Failed to save configuration for ${botId}.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }

    closeFuturesBotConfigForm();
});

// Event delegation for toggle switches (client-side only)
document.addEventListener('change', function (event) {
    if (event.target.matches('input[type="checkbox"][name="bot-status"]')) {
        const checkbox = event.target;
        const botId = checkbox.dataset.botId;
        const botStatus = checkbox.checked;

        if (!botConfigs[botId]) {
            botConfigs[botId] = { botStatus };
        } else {
            botConfigs[botId].botStatus = botStatus;
        }

        console.log(`Bot ${botId} status updated (local):`, botStatus);
    }
});

