// Object to store bot configurations (client-side, temporary)
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
// Modified function to save bot configuration to server
async function saveSpotBotConfiguration(botId) {
    // Retrieve configuration from form
    const config = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked
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
        
        // Still keep the local config as a temporary backup
        botConfigs[botId] = config;
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }
}

// Modify the submit event listener to use the new save function
document.getElementById('spot-bot-config-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const botId = event.target.dataset.botId;
    
    // Call the new async save function
    saveSpotBotConfiguration(botId);
    
    // Close the configuration form
    closeSpotBotConfigForm();
});

// Modify showSpotBotConfigForm to keep existing local storage logic
function showSpotBotConfigForm(botName, botId) {
    // Ensure bot configuration exists locally
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
    document.getElementById('futures-exchange').value = config.exchange;
    document.getElementById('spot-api-key').value = config.apiKey;
    document.getElementById('spot-api-secret').value = config.apiSecret;
    document.getElementById('spot-trade-amount').value = config.tradeAmount;
    document.getElementById('spot-trade-pair').value = config.tradePair;
    document.getElementById('spot-time-frame').value = config.timeFrame;
    document.getElementById('spot-bot-status').checked = config.botStatus;

    document.getElementById('spot-bot-config-container').style.display = 'block';
    document.getElementById('spot-bot-config-form').dataset.botId = botId;
}
