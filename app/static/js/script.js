// Function to handle bot status change
async function handleBotStatusChange(botId, botType, exchange, status) {
    try {
        const response = await fetch(`/api/bot/${botType}/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bot_id: botId,
                exchange,
                status,
            }),
        });

        const result = await response.json();

        if (result.success) {
            console.log(`${botId} (${botType}) on ${exchange} Status Updated:`, result);
            alert(`${botId} (${botType}) on ${exchange} is now ${status ? 'ON' : 'OFF'}`);
        } else {
            console.error(`Failed to update ${botId} (${botType}) on ${exchange}:`, result.message);
            alert(`Failed to update ${botId} (${botType}) on ${exchange}.`);
        }
    } catch (error) {
        console.error('Error toggling bot status:', error);
        alert(`An error occurred while updating the status of ${botId} (${botType}) on ${exchange}.`);
    }
}

// Initialize toggles for Spot and Futures sections
function initializeBotToggles() {
    const spotBotContainers = document.querySelectorAll('#spot-bot-container-container .bot-container');
    const futuresBotContainers = document.querySelectorAll('#futures-bot-container-container .bot-container');

    spotBotContainers.forEach(bot => {
        const botId = bot.getAttribute('data-bot-id');
        bot.addEventListener('click', () => {
            showBotConfigForm(botId, 'spot');
        });
    });

    futuresBotContainers.forEach(bot => {
        const botId = bot.getAttribute('data-bot-id');
        bot.addEventListener('click', () => {
            showBotConfigForm(botId, 'futures');
        });
    });

    initializeConfigFormListeners();
}

// Show bot configuration form dynamically
function showBotConfigForm(botId, botType) {
    const configContainer = document.getElementById(`${botType}-bot-config-container`);
    const header = document.getElementById(`${botType}-bot-config-header`);
    const form = document.getElementById(`${botType}-bot-config-form`);

    header.textContent = `${botType.charAt(0).toUpperCase() + botType.slice(1)} Bot Configuration - ${botId}`;
    configContainer.style.display = 'block';

    // Update the form's submit event listener
    form.onsubmit = (event) => {
        event.preventDefault();
        const exchange = form.querySelector(`#${botType}-exchange`).value;
        const apiKey = form.querySelector(`#${botType}-api-key`).value;
        const apiSecret = form.querySelector(`#${botType}-api-secret`).value;
        const tradeAmount = form.querySelector(`#${botType}-trade-amount`).value;
        const tradePair = form.querySelector(`#${botType}-trade-pair`).value;
        const timeFrame = form.querySelector(`#${botType}-time-frame`).value;
        const leverage = botType === 'futures' ? form.querySelector(`#leverage`).value : null;
        const status = form.querySelector(`#${botType}-bot-status`).checked;

        const botData = {
            bot_id: botId,
            exchange,
            api_key: apiKey,
            api_secret: apiSecret,
            trade_amount: tradeAmount,
            trade_pair: tradePair,
            time_frame: timeFrame,
            leverage,
            status,
        };

        handleBotConfigSubmission(botType, botData);
    };
}

// Handle bot configuration form submission
async function handleBotConfigSubmission(botType, botData) {
    try {
        const response = await fetch(`/api/bot/${botType}/configure`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(botData),
        });

        const result = await response.json();

        if (result.success) {
            alert(`${botData.bot_id} (${botType}) configuration saved successfully.`);
            closeConfigForm(botType);
        } else {
            alert(`Failed to save configuration for ${botData.bot_id} (${botType}).`);
        }
    } catch (error) {
        console.error('Error saving bot configuration:', error);
        alert(`An error occurred while saving configuration for ${botData.bot_id} (${botType}).`);
    }
}

// Close configuration form
function closeConfigForm(botType) {
    const configContainer = document.getElementById(`${botType}-bot-config-container`);
    configContainer.style.display = 'none';
}

// Initialize listeners for form close buttons
function initializeConfigFormListeners() {
    document.querySelector('.close-button[onclick="closeConfigForm('spot')"]').addEventListener('click', () => closeConfigForm('spot'));
    document.querySelector('.close-button[onclick="closeConfigForm('futures')"]').addEventListener('click', () => closeConfigForm('futures'));
}

// Initialize all bot toggles and forms
initializeBotToggles();

