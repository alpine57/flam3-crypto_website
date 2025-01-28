// Object to store toggle statuses (client-side)
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
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Submit handler for the Spot Bot Configuration form
document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Save the form data into the botConfigs object
    const config = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked, // Save toggle state locally
    };

    botConfigs[botId] = config;

    console.log(`Saved configuration for ${botId} (local state):`, config);

    // Send the configuration to the backend
    try {
        const response = await fetch('/api/bot/spot/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                botId,
                ...config,
            }),
        });

        const result = await response.json();
        console.log('Server Response:', result);

        if (result.success) {
            alert(`Configuration for ${botId} saved successfully!`);
        } else {
            alert(`Failed to save configuration for ${botId}.`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the configuration.');
    }

    closeSpotBotConfigForm();
});

// Function to handle toggle status changes (client-side only)
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
        const botId = this.dataset.botId; // Assume the checkbox has a data-bot-id attribute
        const botStatus = this.checked;

        if (!botConfigs[botId]) {
            botConfigs[botId] = { botStatus }; // Initialize with default values if not present
        } else {
            botConfigs[botId].botStatus = botStatus; // Update the bot's status in local state
        }

        console.log(`Bot ${botId} status updated (local):`, botStatus);
    });
});

