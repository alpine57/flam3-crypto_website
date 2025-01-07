// Store configurations and states for each bot separately
const botConfigurations = {
    spot: {},
    futures: {}
};

// Add a separate state tracker for bot status
const botStates = {
    spot: {},
    futures: {}
};

// Load saved states from localStorage on startup
function loadSavedStates() {
    const savedStates = localStorage.getItem('botStates');
    if (savedStates) {
        Object.assign(botStates, JSON.parse(savedStates));
    }
}

// Save states to localStorage
function saveBotStates() {
    localStorage.setItem('botStates', JSON.stringify(botStates));
}

// Section navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

// Update UI to reflect current bot states
function updateBotToggleUi() {
    document.querySelectorAll('.bot-container').forEach(container => {
        const botId = container.getAttribute('data-bot-id');
        const botType = container.closest('#spot-section') ? 'spot' : 'futures';
        const checkbox = container.querySelector('input[type="checkbox"][name="bot-status"]');

        if (checkbox && botStates[botType][botId] !== undefined) {
            checkbox.checked = botStates[botType][botId];
        }
    });
}

// Navigation event listeners
document.getElementById('home-link').addEventListener('click', function(event) {
    event.preventDefault();
    showSection('home-section');
});

document.getElementById('spot-link').addEventListener('click', function(event) {
    event.preventDefault();
    showSection('spot-section');
});

document.getElementById('futures-link').addEventListener('click', function(event) {
    event.preventDefault();
    showSection('futures-section');
});

document.getElementById('settings-link').addEventListener('click', function(event) {
    event.preventDefault();
    showSection('settings-section');
});

// Show bot configuration form
function showBotConfigForm(botType, botName, botId) {
    const form = document.getElementById(`${botType}-bot-config-form`);
    form.setAttribute('data-current-bot-id', botId);

    document.getElementById(`${botType}-bot-config-header`).innerText = `${botName} Configuration`;
    const existingConfig = botConfigurations[botType][botId];

    if (existingConfig) {
        Object.entries(existingConfig).forEach(([key, value]) => {
            const element = document.getElementById(`${botType}-${key}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });
    } else {
        form.reset();
    }

    const statusCheckbox = form.querySelector('input[name="bot-status"]');
    if (statusCheckbox) {
        statusCheckbox.checked = botStates[botType][botId] || false;
    }

    document.getElementById(`${botType}-bot-config-container`).style.display = 'block';
}

function closeBotConfigForm(botType) {
    document.getElementById(`${botType}-bot-config-container`).style.display = 'none';
}

// Form submission handlers
document.getElementById('spot-bot-config-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    await submitBotConfigForm('spot', this);
});

document.getElementById('futures-bot-config-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    await submitBotConfigForm('futures', this);
});

async function submitBotConfigForm(botType, form) {
    const currentBotId = form.getAttribute('data-current-bot-id');
    if (!currentBotId) {
        console.error('No bot ID found for form submission');
        return;
    }

    const botName = document.getElementById(`${botType}-bot-config-header`).innerText
        .replace(' Configuration', '');

    const config = {
        botId: currentBotId,
        botName,
        exchange: document.getElementById(`${botType}-exchange`).value,
        apiKey: document.getElementById(`${botType}-api-key`).value,
        apiSecret: document.getElementById(`${botType}-api-secret`).value,
        tradeAmount: document.getElementById(`${botType}-trade-amount`).value,
        tradePair: document.getElementById(`${botType}-trade-pair`).value,
        timeFrame: document.getElementById(`${botType}-time-frame`).value,
        status: botStates[botType][currentBotId] || false
    };

    if (botType === 'futures') {
        config.leverage = document.getElementById('leverage').value;
    }

    botConfigurations[botType][currentBotId] = config;

    try {
        const response = await fetch(`/api/bot/${botType}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        const result = await response.json();
        if (result.success) {
            alert(`${botName} configuration updated successfully!`);
        } else {
            alert(`Failed to update the configuration for ${botName}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the configuration for ${botName}`);
    }

    closeBotConfigForm(botType);
}

// Bot status management
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Status change request:", { botId, botName, botType, exchange, status });

    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bot_id: botId,
                bot_name: botName,
                bot_type: botType,
                exchange,
                status
            })
        });

        const result = await response.json();
        if (result.success) {
            botStates[botType][botId] = status;
            saveBotStates();
            updateBotToggleUi();
            alert(`${botName} on ${exchange} is now ${status ? 'ON' : 'OFF'}`);
            await fetchActiveBots();
        } else {
            throw new Error(result.message || 'Status update failed.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`Failed to update ${botName} status. Please try again.`);
    }
}

// Setup bot toggle listeners
function setupBotToggleListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="bot-status"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(event) {
            event.stopPropagation();

            const botContainer = this.closest('.bot-container');
            const botId = botContainer.getAttribute('data-bot-id');
            const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
            const botName = botContainer.querySelector('.bot-name').textContent.trim();
            const exchange = botType === 'spot' ? 'binance' : 'bybit';

            handleBotStatusChange(botId, botName, botType, exchange, this.checked);
        });
    });
}

// Data fetching functions
async function fetchActiveBots() {
    try {
        const response = await fetch('/api/active_bots');
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);

        const data = await response.json();
        if (data.binance !== undefined) {
            document.getElementById('binance-bots').textContent = `Number of bots running: ${data.binance}`;
        }
        if (data.bybit !== undefined) {
            document.getElementById('bybit-bots').textContent = `Number of bots running: ${data.bybit}`;
        }
    } catch (error) {
        console.error("Failed to fetch active bots:", error);
    }
}

async function fetchBalances() {
    try {
        const response = await fetch('/api/balances');
        if (!response.ok) throw new Error(`Error fetching balances: ${response.statusText}`);

        const data = await response.json();
        if (data.binance) {
            document.getElementById('binance-balance').textContent = `Balance: ${data.binance}`;
        }
        if (data.bybit) {
            document.getElementById('bybit-balance').textContent = `Balance: ${data.bybit}`;
        }
    } catch (error) {
        console.error("Failed to fetch balances:", error);
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    loadSavedStates();
    setupBotToggleListeners();
    updateBotToggleUi();
    await Promise.all([fetchActiveBots(), fetchBalances()]);
    setInterval(async () => {
        await Promise.all([fetchActiveBots(), fetchBalances()]);
    }, 60000);
});

