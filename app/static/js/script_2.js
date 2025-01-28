// Object to store configurations for each bot
const botConfigs = {};

// Function to open the configuration form for a specific bot
function showSpotBotConfigForm(botName, botId) {
    // Load the bot's saved configuration or use default values
    const config = botConfigs[botId] || {
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        tradeAmount: '',
        tradePair: '',
        timeFrame: '1m',
        botStatus: false, // Default off
    };

    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;

    // Populate the form with the bot's specific configuration
    document.getElementById('futures-exchange').value = config.exchange;
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
    // Save the current form state before closing
    const botId = document.getElementById('spot-bot-config-form').dataset.botId;

    botConfigs[botId] = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked, // Save toggle state
    };

    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Submit handler for the Spot Bot Configuration form
document.getElementById('spot-bot-config-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Save the form data into the botConfigs object
    botConfigs[botId] = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked, // Save toggle state
    };

    console.log(`Saved configuration for ${botId}:`, botConfigs[botId]);
    closeSpotBotConfigForm();
});

