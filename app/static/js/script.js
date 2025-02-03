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

// Function to toggle bot status
async function toggleBotStatus(botType, botId, status) {
    try {
        const response = await fetch(`/api/bot/${botType}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, status }),
        });
        const result = await response.json();
        
        if (result.success) {
            // Update local config
            if (botConfigs[botId]) {
                botConfigs[botId].botStatus = status;
            }
            
            // Update UI toggle if needed
            const toggleElement = document.getElementById(`${botId}-${botType}-status-toggle`);
            if (toggleElement) {
                toggleElement.checked = status;
            }
        } else {
            // Revert UI toggle if server update fails
            const toggleElement = document.getElementById(`${botId}-${botType}-status-toggle`);
            if (toggleElement) {
                toggleElement.checked = !status;
            }
            alert(`Failed to ${status ? 'start' : 'stop'} ${botType} bot ${botId}`);
        }
    } catch (error) {
        console.error(`Error toggling ${botType} bot status:`, error);
        alert('An error occurred while changing bot status.');
        
        // Revert UI toggle if there's a network error
        const toggleElement = document.getElementById(`${botId}-${botType}-status-toggle`);
        if (toggleElement) {
            toggleElement.checked = !status;
        }
    }
}

// Function to open the configuration form for a specific bot
function showBotConfigForm(botName, botId, botType) {
    // Ensure bot configuration exists with specified structure
    if (!botConfigs[botId]) {
        botConfigs[botId] = botType === 'spot' 
            ? {
                botName,
                exchange: 'binance',
                apiKey: '',
                apiSecret: '',
                tradeAmount: '',
                tradePair: '',
                timeFrame: '1m',
                botStatus: false,
            }
            : {
                botName,
                exchange: 'binance',
                apiKey: '',
                apiSecret: '',
                tradeAmount: '',
                tradePair: '',
                leverage: '1',
                timeFrame: '1m',
                botStatus: false,
            };
    }

    const config = botConfigs[botId];

    // Populate the form with stored config values
    document.getElementById(`${botType}-bot-config-header`).innerText = `${config.botName} Configuration`;
    document.getElementById(`${botType}-exchange`).value = config.exchange;
    document.getElementById(`${botType}-api-key`).value = config.apiKey;
    document.getElementById(`${botType}-api-secret`).value = config.apiSecret;
    document.getElementById(`${botType}-trade-amount`).value = config.tradeAmount;
    document.getElementById(`${botType}-trade-pair`).value = config.tradePair;
    document.getElementById(`${botType}-time-frame`).value = config.timeFrame;
    
    // Add futures-specific leverage field
    if (botType === 'futures') {
        document.getElementById('futures-leverage').value = config.leverage;
    }
    
    // Set the toggle state correctly from the saved config
    document.getElementById(`${botType}-bot-status`).checked = config.botStatus;

    document.getElementById(`${botType}-bot-config-container`).style.display = 'block';

    // Save the botId and type in the form dataset for future reference
    document.getElementById(`${botType}-bot-config-form`).dataset.botId = botId;
    document.getElementById(`${botType}-bot-config-form`).dataset.botType = botType;
}

// Function to close the configuration form
function closeBotConfigForm(botType) {
    const botId = document.getElementById(`${botType}-bot-config-form`).dataset.botId;

    if (botId) {
        // Prepare config object based on bot type
        const config = {
            botName: botConfigs[botId].botName, // Preserve original bot name
            exchange: document.getElementById(`${botType}-exchange`).value,
            apiKey: document.getElementById(`${botType}-api-key`).value,
            apiSecret: document.getElementById(`${botType}-api-secret`).value,
            tradeAmount: document.getElementById(`${botType}-trade-amount`).value,
            tradePair: document.getElementById(`${botType}-trade-pair`).value,
            timeFrame: document.getElementById(`${botType}-time-frame`).value,
            botStatus: document.getElementById(`${botType}-bot-status`).checked,
        };

        // Add futures-specific leverage if applicable
        if (botType === 'futures') {
            config.leverage = document.getElementById('futures-leverage').value;
        }

        // Save config
        botConfigs[botId] = config;
    }

    document.getElementById(`${botType}-bot-config-container`).style.display = 'none';
}

// Submit handler for Bot Configuration forms
document.getElementById('spot-bot-config-form').addEventListener('submit', handleBotConfigSubmit);
document.getElementById('futures-bot-config-form').addEventListener('submit', handleBotConfigSubmit);

// Generic submit handler for both spot and futures bot configurations
async function handleBotConfigSubmit(event) {
    event.preventDefault();

    const botType = event.target.dataset.botType;
    const botId = event.target.dataset.botId;

    // Prepare configuration object
    const config = {
        botName: botConfigs[botId].botName, // Preserve original bot name
        exchange: document.getElementById(`${botType}-exchange`).value,
        apiKey: document.getElementById(`${botType}-api-key`).value,
        apiSecret: document.getElementById(`${botType}-api-secret`).value,
        tradeAmount: document.getElementById(`${botType}-trade-amount`).value,
        tradePair: document.getElementById(`${botType}-trade-pair`).value,
        timeFrame: document.getElementById(`${botType}-time-frame`).value,
        botStatus: document.getElementById(`${botType}-bot-status`).checked,
    };

    // Add futures-specific leverage if applicable
    if (botType === 'futures') {
        config.leverage = document.getElementById('futures-leverage').value;
    }

    try {
        const response = await fetch(`/api/bot/${botType}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, ...config }),
        });
        const result = await response.json();
        console.log('Server Response:', result);
        
        if (result.success) {
            // Update local botConfigs if server save is successful
            botConfigs[botId] = config;
            
            // Trigger status change if needed
            if (config.botStatus !== botConfigs[botId].botStatus) {
                toggleBotStatus(botType, botId, config.botStatus);
            }
            
            alert(`Configuration for ${config.botName} saved successfully!`);
        } else {
            alert(`Failed to save configuration for ${config.botName}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }

    closeBotConfigForm(botType);
}

// Add generic close button handlers
document.getElementById('spot-bot-config-close').addEventListener('click', () => closeBotConfigForm('spot'));
document.getElementById('futures-bot-config-close').addEventListener('click', () => closeBotConfigForm('futures'));
