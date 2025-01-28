// Object to store configurations for each bot
const botConfigs = {};

// Function to open the configuration form for a specific bot
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

    // Populate the form with the bot's specific configuration
    const exchangeSelect = document.getElementById('spot-exchange');
    if (exchangeSelect) {
        exchangeSelect.value = config.exchange;
    }

    document.getElementById('spot-api-key').value = config.apiKey;
    document.getElementById('spot-api-secret').value = config.apiSecret;
    document.getElementById('spot-trade-amount').value = config.tradeAmount;
    document.getElementById('spot-trade-pair').value = config.tradePair;
    document.getElementById('spot-time-frame').value = config.timeFrame;
    document.getElementById('spot-bot-status').checked = config.botStatus;

    document.getElementById('spot-bot-config-container').style.display = 'block';

    // Save the botId for use in the submit handler
    document.getElementById('spot-bot-config-form').dataset.botId = botId;
}

// Function to close the configuration form
function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Submit handler for the Spot Bot Configuration form
document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Save the form data into the botConfigs object
    botConfigs[botId] = {
        exchange: document.getElementById('spot-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked,
    };

    console.log(`Saved configuration for ${botId}:`, botConfigs[botId]);

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botConfigs[botId]),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Configuration for bot ${botId} saved successfully.`);
        } else {
            alert(`Failed to save configuration for bot ${botId}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    }

    closeSpotBotConfigForm();
});

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

// Spot bot configuration submission
document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
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

    console.log('Spot Bot Configuration:', spotBotConfig);

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spotBotConfig),
        });

        const result = await response.json();
        if (result.success) {
            alert(`${botName} configuration updated successfully.`);
        } else {
            alert(`Failed to update ${botName} configuration.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    }

    closeSpotBotConfigForm();
});

// Toggle bot status dynamically
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;
        const form = this.closest('form');
        const botContainer = form.closest('.bot-container');
        const botId = botContainer.getAttribute('data-bot-id');
        const botName = botContainer.innerText.trim();
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

// Function to handle bot status change
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Payload to be sent:", {
        bot_id: botId,
        bot_name: botName,
        bot_type: botType,
        exchange,
        status,
    });

    try {
        const response = await fetch(`/api/bot/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, bot_type: botType, exchange, status }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`${botName.replace('_', ' ')} on ${exchange} (${botType}) is now ${status ? 'ON' : 'OFF'}`);
        } else {
            alert(`Failed to update ${botName.replace('_', ' ')} on ${exchange} (${botType}) status.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating ${botName} status.`);
    }
}

