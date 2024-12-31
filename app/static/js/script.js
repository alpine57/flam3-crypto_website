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

// Form display functions
function showSpotBotConfigForm(botName, botId) {
    const form = document.getElementById('spot-bot-config-form');
    form.setAttribute('data-current-bot-id', botId);
    
    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;
    
    // Load existing configuration if available
    const existingConfig = botConfigurations.spot[botId];
    if (existingConfig) {
        Object.entries(existingConfig).forEach(([key, value]) => {
            const element = document.getElementById(`spot-${key}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = botStates.spot[botId] || false;
                } else {
                    element.value = value;
                }
            }
        });
    } else {
        form.reset();
        const statusCheckbox = form.querySelector('input[name="bot-status"]');
        if (statusCheckbox) {
            statusCheckbox.checked = botStates.spot[botId] || false;
        }
    }
    
    document.getElementById('spot-bot-config-container').style.display = 'block';
}

function showFuturesBotConfigForm(botName, botId) {
    const form = document.getElementById('futures-bot-config-form');
    form.setAttribute('data-current-bot-id', botId);
    
    document.getElementById('futures-bot-config-header').innerText = `${botName} Configuration`;
    
    // Load existing configuration if available
    const existingConfig = botConfigurations.futures[botId];
    if (existingConfig) {
        Object.entries(existingConfig).forEach(([key, value]) => {
            const element = document.getElementById(`futures-${key}`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = botStates.futures[botId] || false;
                } else {
                    element.value = value;
                }
            }
        });
    } else {
        form.reset();
        const statusCheckbox = form.querySelector('input[name="bot-status"]');
        if (statusCheckbox) {
            statusCheckbox.checked = botStates.futures[botId] || false;
        }
    }
    
    document.getElementById('futures-bot-config-container').style.display = 'block';
}

function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Form submission handlers
document.getElementById('spot-bot-config-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const currentBotId = this.getAttribute('data-current-bot-id');
    if (!currentBotId) {
        console.error('No bot ID found for form submission');
        return;
    }
    
    const botName = document.getElementById('spot-bot-config-header').innerText
        .replace(' Configuration', '');
        
    const config = {
        botId: currentBotId,
        botName,
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        status: botStates.spot[currentBotId] || false
    };
    
    botConfigurations.spot[currentBotId] = config;
    
    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
    
    closeSpotBotConfigForm();
});

document.getElementById('futures-bot-config-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const currentBotId = this.getAttribute('data-current-bot-id');
    if (!currentBotId) {
        console.error('No bot ID found for form submission');
        return;
    }
    
    const botName = document.getElementById('futures-bot-config-header').innerText
        .replace(' Configuration', '');
        
    const config = {
        botId: currentBotId,
        botName,
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('futures-api-key').value,
        apiSecret: document.getElementById('futures-api-secret').value,
        tradeAmount: document.getElementById('futures-trade-amount').value,
        tradePair: document.getElementById('futures-trade-pair').value,
        leverage: document.getElementById('leverage').value,
        timeFrame: document.getElementById('futures-time-frame').value,
        status: botStates.futures[currentBotId] || false
    };
    
    botConfigurations.futures[currentBotId] = config;
    
    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
    
    closeFuturesBotConfigForm();
});

// Bot status management
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Status change request:", {
        bot_id: botId,
        bot_name: botName,
        bot_type: botType,
        exchange,
        status
    });

    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bot_id: botId,
                bot_name: botName,
                bot_type: botType,
                exchange,
                status
            })
        });
        
        const result = await response.json();
        console.log(`${botId} Status Updated:`, result);
        
        if (result.success) {
            botStates[botType][botId] = status;
            saveBotStates();
            
            alert(`${botName.replace('_', ' ')} on ${exchange} is now ${status ? 'ON' : 'OFF'}`);
            await fetchActiveBots();
        } else {
            const checkbox = document.querySelector(`[data-bot-id="${botId}"] input[type="checkbox"]`);
            if (checkbox) {
                checkbox.checked = botStates[botType][botId] || false;
            }
            alert(`Failed to update ${botName.replace('_', ' ')} status`);
        }
    } catch (error) {
        console.error('Error:', error);
        const checkbox = document.querySelector(`[data-bot-id="${botId}"] input[type="checkbox"]`);
        if (checkbox) {
            checkbox.checked = botStates[botType][botId] || false;
        }
        alert(`An error occurred while updating the ${botName.replace('_', ' ')} status`);
    }
}

// Setup bot toggle listeners
function setupBotToggleListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="bot-status"]');
    checkboxes.forEach(checkbox => {
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        const botContainer = newCheckbox.closest('.bot-container');
        const botId = botContainer.getAttribute('data-bot-id');
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        newCheckbox.checked = botStates[botType][botId] || false;
        
        newCheckbox.addEventListener('change', function(event) {
            event.stopPropagation();
            
            const botName = botContainer.innerText.trim();
            const form = this.closest('form');
            const exchange = form ? form.querySelector('select[name="exchange"]').value : 'binance';
            
            handleBotStatusChange(botId, botName, botType, exchange, this.checked);
        });
    });
}

// Data fetching functions
async function fetchActiveBots() {
    try {
        const response = await fetch('/api/active_bots');
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        
        if (data.binance !== undefined) {
            document.getElementById('binance-bots').textContent = 
                `Number of bots running: ${data.binance}`;
        }
        if (data.bybit !== undefined) {
            document.getElementById('bybit-bots').textContent = 
                `Number of bots running: ${data.bybit}`;
        }
    } catch (error) {
        console.error("Failed to fetch active bots:", error);
    }
}

async function fetchBalances() {
    try {
        const response = await fetch('/api/balances');
        if (!response.ok) {
            throw new Error(`Error fetching balances: ${response.statusText}`);
        }
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
document.addEventListener('DOMContentLoaded', function() {
    loadSavedStates();
    setupBotToggleListeners();
    updateBotToggleUi();
    fetchActiveBots();
    fetchBalances();
});

// Set up periodic data refresh
setInterval(async () => {
    await Promise.all([
        fetchActiveBots(),
        fetchBalances()
    ]);
}, 60000); // Refresh every minute
