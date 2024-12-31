function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

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

function showSpotBotConfigForm(botName) {
    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('spot-bot-config-container').style.display = 'block';
}

function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

function showFuturesBotConfigForm(botName) {
    document.getElementById('futures-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('futures-bot-config-container').style.display = 'block';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

document.getElementById('futures-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botName = document.getElementById('futures-bot-config-header').innerText.replace(' Configuration', '');

    const futuresBotConfig = {
        botName,
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('futures-api-key').value,
        apiSecret: document.getElementById('futures-api-secret').value,
        tradeAmount: document.getElementById('futures-trade-amount').value,
        tradePair: document.getElementById('futures-trade-pair').value,
        leverage: document.getElementById('leverage').value,
        timeFrame: document.getElementById('futures-time-frame').value,
    };

    console.log('Futures Bot Configuration:', futuresBotConfig);

    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(futuresBotConfig),
        });

        const result = await response.json();
        console.log('Server Response:', result);

        if (result.success) {
            alert(`${botName} configuration updated and restarted successfully!`);
        } else {
            alert(`Failed to update the configuration for ${botName}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the configuration for ${botName}.`);
    }

    closeFuturesBotConfigForm();
});

document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botName = document.getElementById('spot-bot-config-header').innerText.replace(' Configuration', '');

    const spotBotConfig = {
        botName,
        exchange: document.getElementById('spot-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
    };

    console.log('Spot Bot Configuration:', spotBotConfig);

    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(spotBotConfig),
        });

        const result = await response.json();
        console.log('Server Response:', result);

        if (result.success) {
            alert(`${botName} configuration updated and restarted successfully!`);
        } else {
            alert(`Failed to update the configuration for ${botName}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the configuration for ${botName}.`);
    }

    closeSpotBotConfigForm();
});

async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId, botName, botType, exchange, status }),
        });

        const result = await response.json();
        console.log(`${botId} (${botName}, ${botType}) Status Updated:`, result);

        if (result.success) {
            alert(`${botName.replace('_', ' ')} on ${exchange} (${botType}) is now ${status ? 'ON' : 'OFF'}`);
        } else {
            alert(`Failed to update ${botName.replace('_', ' ')} on ${exchange} (${botType}) status.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the ${botName.replace('_', ' ')} status.`);
    }
}

document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const form = this.closest('form');
        const botContainer = form.closest('.bot-container');
        const botId = botContainer.getAttribute('data-bot-id');
        const botName = botContainer.innerText.trim();
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, botType, exchange, this.checked);
    });
});

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

document.addEventListener('DOMContentLoaded', () => {
    fetchActiveBots();
    fetchBalances();
    setInterval(fetchBalances, 60000); // Fetch every 60 seconds
});

