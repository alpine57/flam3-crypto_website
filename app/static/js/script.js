function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';

        // Save the active section
        if (section.id === sectionId) {
            localStorage.setItem('active-section', sectionId);
        }
    });
}

// On page load, restore the last active section
document.addEventListener('DOMContentLoaded', function () {
    const activeSection = localStorage.getItem('active-section');
    if (activeSection) {
        showSection(activeSection);
    } else {
        showSection('home-section'); // Default to the home section
    }
});

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

function showSpotBotConfigForm(botName, botId) {
    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('spot-bot-config-container').style.display = 'block';

    // Save the visibility state
    localStorage.setItem(`${botId}-form-visible`, true);
}

function closeSpotBotConfigForm(botId) {
    document.getElementById('spot-bot-config-container').style.display = 'none';

    // Save the visibility state
    localStorage.setItem(`${botId}-form-visible`, false);
}

function showFuturesBotConfigForm(botName, botId) {
    document.getElementById('futures-bot-config-header').innerText = `${botName} Configuration`;
    document.getElementById('futures-bot-config-container').style.display = 'block';

    // Save the visibility state
    localStorage.setItem(`${botId}-form-visible`, true);
}

function closeFuturesBotConfigForm(botId) {
    document.getElementById('futures-bot-config-container').style.display = 'none';

    // Save the visibility state
    localStorage.setItem(`${botId}-form-visible`, false);
}

// Restore form visibility on page load
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bot-container').forEach((container) => {
        const botId = container.getAttribute('data-bot-id');
        const formVisible = JSON.parse(localStorage.getItem(`${botId}-form-visible`));
        if (formVisible) {
            showSpotBotConfigForm(container.innerText.trim(), botId);
        }
    });
});

async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Payload to be sent:", {
        bot_id: botId,
        bot_name: botName,
        bot_type: botType,
        exchange,
        status,
    });

    try {
        const response = await fetch(`/api/bot/toggle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bot_id: botId,
                bot_name: botName,
                bot_type: botType,
                exchange,
                status,
            }),
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

// Add event listeners dynamically for all bot toggle checkboxes
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach((checkbox) => {
    const botContainer = checkbox.closest('.bot-container');
    const botId = botContainer.getAttribute('data-bot-id');

    // Load the saved state from localStorage
    const savedState = localStorage.getItem(`${botId}-status`);
    if (savedState !== null) {
        checkbox.checked = JSON.parse(savedState); // Set the checkbox to the saved state
    }

    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;

        // Save the state in localStorage
        localStorage.setItem(`${botId}-status`, botStatus);

        const form = this.closest('form');
        const botName = botContainer.innerText.trim();
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

// Fetch active bots and balances on page load
async function fetchActiveBots() {
    try {
        const response = await fetch('/api/active_bots');
        if (!response.ok) throw new Error(`Error fetching data: ${response.statusText}`);
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

document.addEventListener('DOMContentLoaded', function () {
    fetchActiveBots();
    fetchBalances();
});

// Refresh balances periodically
setInterval(fetchBalances, 60000); // Fetch every 60 seconds

