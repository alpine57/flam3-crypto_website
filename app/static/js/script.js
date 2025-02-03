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

// Function to open the configuration form for a specific bot
function showSpotBotConfigForm(botName, botId) {
    // Ensure bot configuration exists
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

    // Populate the form with stored config values
    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('spot-exchange').value = config.exchange;
    document.getElementById('spot-api-key').value = config.apiKey;
    document.getElementById('spot-api-secret').value = config.apiSecret;
    document.getElementById('spot-trade-amount').value = config.tradeAmount;
    document.getElementById('spot-trade-pair').value = config.tradePair;
    document.getElementById('spot-time-frame').value = config.timeFrame;
    
    // Set the toggle state correctly from the saved config
    document.getElementById('spot-bot-status').checked = config.botStatus;

    document.getElementById('spot-bot-config-container').style.display = 'block';

    // Save the botId in the form dataset for future reference
    document.getElementById('spot-bot-config-form').dataset.botId = botId;
}

// Function to close the configuration form (but keep toggle state saved)
function closeSpotBotConfigForm() {
    const botId = document.getElementById('spot-bot-config-form').dataset.botId;

    if (botId) {
        // Save all form values (including the toggle status)
        botConfigs[botId] = {
            exchange: document.getElementById('spot-exchange').value,
            apiKey: document.getElementById('spot-api-key').value,
            apiSecret: document.getElementById('spot-api-secret').value,
            tradeAmount: document.getElementById('spot-trade-amount').value,
            tradePair: document.getElementById('spot-trade-pair').value,
            timeFrame: document.getElementById('spot-time-frame').value,
            botStatus: document.getElementById('spot-bot-status').checked,
        };
    }

    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Submit handler for the Spot Bot Configuration form
document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Prepare configuration object
    const config = {
        exchange: document.getElementById('spot-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked,
    };

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, ...config }),
        });
        const result = await response.json();
        console.log('Server Response:', result);
        alert(result.success ? `Configuration for ${botId} saved successfully!` : `Failed to save configuration for ${botId}.`);

        // Update local botConfigs if server save is successful
        if (result.success) {
            botConfigs[botId] = config;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }

    closeSpotBotConfigForm();
});

