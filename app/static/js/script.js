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
    
    // ✅ Ensure checkbox has the correct dataset attribute
    const spotStatusCheckbox = document.getElementById('spot-bot-status');
    spotStatusCheckbox.checked = config.botStatus;
    spotStatusCheckbox.dataset.botId = botId; // Assign botId to checkbox

    document.getElementById('spot-bot-config-container').style.display = 'block';
    document.getElementById('spot-bot-config-form').dataset.botId = botId;
}

// Function to close the Spot Bot Configuration form
function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
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
        botStatus: document.getElementById('spot-bot-status').checked, // ✅ Fetch latest status
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

// ✅ Event delegation for toggling bot status
document.addEventListener('change', function (event) {
    if (event.target.matches('input[type="checkbox"][name="bot-status"]')) {
        const checkbox = event.target;
        const botId = checkbox.dataset.botId;

        if (!botId) {
            console.error("Bot ID missing for checkbox toggle.");
            return;
        }

        const botStatus = checkbox.checked;

        // ✅ Ensure botConfigs stores the latest bot status
        if (!botConfigs[botId]) {
            botConfigs[botId] = { botStatus };
        } else {
            botConfigs[botId].botStatus = botStatus;
        }

        console.log(`Bot ${botId} status updated (local):`, botStatus);
    }
});

