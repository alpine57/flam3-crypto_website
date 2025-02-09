// Spot Bot Configuration Functions
function showSpotBotConfigForm(botName, botId) {
    const configHeader = document.getElementById('spot-bot-config-header');
    const configContainer = document.getElementById('spot-bot-config-container');
    
    configHeader.innerText = `${botName} Configuration`;
    configContainer.dataset.botId = botId;
    configContainer.style.display = 'block';

    // Populate the form with the correct bot details
    updateFormFields(configContainer, botId, 'spot');
}

// Futures Bot Configuration Functions
function showFuturesBotConfigForm(botName, botId) {
    const configHeader = document.getElementById('futures-bot-config-header');
    const configContainer = document.getElementById('futures-bot-config-container');

    configHeader.innerText = `${botName} Configuration`;
    configContainer.dataset.botId = botId;
    configContainer.style.display = 'block';

    // Populate the form with the correct bot details
    updateFormFields(configContainer, botId, 'futures');
}

// Function to update form fields dynamically for each bot
function updateFormFields(configContainer, botId, botType) {
    const form = configContainer.querySelector('form');
    const botData = document.querySelector(`.bot-container[data-bot-id="${botId}"]`);

    if (botData) {
        form.querySelectorAll('input, select').forEach(input => {
            const fieldName = input.name;
            const savedValue = botData.dataset[fieldName] || '';
            if (input.type === 'checkbox') {
                input.checked = savedValue === 'true';
            } else {
                input.value = savedValue;
            }
        });
    }
}

// Handle Bot Status Change
async function handleBotStatusChange(botId, botType, status) {
    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_type: botType, status })
        });

        const result = await response.json();
        alert(result.success ? `Bot ${botId} is now ${status ? 'ON' : 'OFF'}` : `Failed to update Bot ${botId}`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the bot status.');
    }
}

// Add Event Listeners for Bot Toggles
document.querySelectorAll('.bot-container .switch input[type="checkbox"]').forEach(toggle => {
    toggle.addEventListener('change', function () {
        const botContainer = this.closest('.bot-container');
        const botId = botContainer.dataset.botId;
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        handleBotStatusChange(botId, botType, this.checked);
    });
});

// Close Forms
function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Spot Bot Form Submission
document.getElementById('spot-bot-config-form').addEventListener('submit', async event => {
    event.preventDefault();

    const configContainer = document.getElementById('spot-bot-config-container');
    const botId = configContainer.dataset.botId;

    const botConfig = {
        botId,
        exchange: document.getElementById('spot-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        status: document.getElementById('spot-bot-status').checked
    };

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botConfig),
        });

        const result = await response.json();
        alert(result.success ? `Bot ${botId} configuration updated successfully!` : `Failed to update Bot ${botId}`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the configuration.');
    }

    closeSpotBotConfigForm();
});

// Futures Bot Form Submission
document.getElementById('futures-bot-config-form').addEventListener('submit', async event => {
    event.preventDefault();

    const configContainer = document.getElementById('futures-bot-config-container');
    const botId = configContainer.dataset.botId;

    const botConfig = {
        botId,
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('futures-api-key').value,
        apiSecret: document.getElementById('futures-api-secret').value,
        tradeAmount: document.getElementById('futures-trade-amount').value,
        tradePair: document.getElementById('futures-trade-pair').value,
        leverage: document.getElementById('leverage').value,
        timeFrame: document.getElementById('futures-time-frame').value,
        status: document.getElementById('futures-bot-status').checked
    };

    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(botConfig),
        });

        const result = await response.json();
        alert(result.success ? `Bot ${botId} configuration updated successfully!` : `Failed to update Bot ${botId}`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the configuration.');
    }

    closeFuturesBotConfigForm();
});

