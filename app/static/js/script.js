function showSection(sectionId) {
            const sections = document.querySelectorAll('.content');
            sections.forEach(section => {
                section.style.display = section.id === sectionId ? 'flex' : 'none';
            });
        }

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

function showSpotBotConfigForm(botName) {
    document.getElementById('spot-bot-config-header').innerText = botName + ' Configuration';
    document.getElementById('spot-bot-config-container').style.display = 'block';
}

function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

function showFuturesBotConfigForm(botName) {
    document.getElementById('futures-bot-config-header').innerText = botName + ' Configuration';
    document.getElementById('futures-bot-config-container').style.display = 'block';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

document.getElementById('futures-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get the bot name from the header
    const botName = document.getElementById('futures-bot-config-header').innerText.replace(' Configuration', '');

    // Retrieve form values
    const exchange = document.getElementById('futures-exchange').value;
    const apiKey = document.getElementById('futures-api-key').value;
    const apiSecret = document.getElementById('futures-api-secret').value;
    const tradeAmount = document.getElementById('futures-trade-amount').value;
    const tradePair = document.getElementById('futures-trade-pair').value;
    const leverage = document.getElementById('leverage').value;
    const timeFrame = document.getElementById('futures-time-frame').value;

    // Add bot name to the configuration
    const futuresBotConfig = {
        botName,
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        leverage,
        timeFrame,
    };

    console.log('Futures Bot Configuration:', futuresBotConfig);

    // Send the configuration to the backend
    try {
        const response = await fetch('/api/bot/futures/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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

    // Get the bot name from the header
    const botName = document.getElementById('spot-bot-config-header').innerText.replace(' Configuration', '');

    // Retrieve form values
    const exchange = document.getElementById('futures-exchange').value;
    const apiKey = document.getElementById('spot-api-key').value;
    const apiSecret = document.getElementById('spot-api-secret').value;
    const tradeAmount = document.getElementById('spot-trade-amount').value;
    const tradePair = document.getElementById('spot-trade-pair').value;
    const timeFrame = document.getElementById('spot-time-frame').value;

    // Add bot name to the configuration
    const spotBotConfig = {
        botName,
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        timeFrame,
    };

    console.log('Spot Bot Configuration:', spotBotConfig);

    // Send the configuration to the backend
    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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


// Function to handle bot status change
async function handleBotStatusChange(botId, botName, exchange, status) {
    try {
        const response = await fetch(`/api/bot/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, exchange, status }),
        });

        const result = await response.json();
        console.log(`${botId} (${botName}) Status Updated:`, result);

        if (result.success) {
            alert(`${botName.replace('_', ' ')} on ${exchange} is now ${status ? 'ON' : 'OFF'}`);
        } else {
            alert(`Failed to update ${botName.replace('_', ' ')} on ${exchange} status.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert(`An error occurred while updating the ${botName.replace('_', ' ')} status.`);
    }
}

// Add event listeners dynamically for all bot toggle checkboxes
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;
        const form = this.closest('form'); // Get the parent form to extract other data

        const botId = form.parentElement.dataset.botId; // Ensure botId is added to the parent div in HTML
        const botName = form.parentElement.dataset.botName; // Ensure botName is added to the parent div in HTML
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, exchange, botStatus);
    });
});

