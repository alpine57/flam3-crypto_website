// Function to show a section based on sectionId
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => {
        section.style.display = section.id === sectionId ? 'flex' : 'none';
    });
}

// Event Listeners for Navigation Links
document.getElementById('home-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('home-section');
});

document.getElementById('spot-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('spot-section');
});

document.getElementById('futures-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('futures-section');
});

document.getElementById('settings-link').addEventListener('click', event => {
    event.preventDefault();
    showSection('settings-section');
});

// Spot Bot Configuration Functions
function showSpotBotConfigForm(botName, botId) {
    const configHeader = document.getElementById('spot-bot-config-header');
    const configContainer = document.getElementById('spot-bot-config-container');
    configHeader.innerText = `${botName} Configuration`;
    configContainer.setAttribute('data-bot-id', botId);
    configContainer.style.display = 'block';
}

function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Futures Bot Configuration Functions
function showFuturesBotConfigForm(botName, botId) {
    const configHeader = document.getElementById('futures-bot-config-header');
    const configContainer = document.getElementById('futures-bot-config-container');
    configHeader.innerText = `${botName} Configuration`;
    configContainer.setAttribute('data-bot-id', botId);
    configContainer.style.display = 'block';
}

function closeFuturesBotConfigForm() {
    document.getElementById('futures-bot-config-container').style.display = 'none';
}

// Handle Bot Status Change
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, bot_type: botType, exchange, status }),
        });

        const result = await response.json();
        alert(result.success
            ? `${botName} (${exchange}, ${botType}) is now ${status ? 'ON' : 'OFF'}`
            : `Failed to update ${botName} status.`);
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the bot status.');
    }
}

// Add Event Listeners for Bot Toggles
document.querySelectorAll('.bot-container').forEach(botContainer => {
    botContainer.addEventListener('click', function () {
        const botId = this.getAttribute('data-bot-id');
        const botName = this.innerText;
        const botType = this.closest('#spot-section') ? 'spot' : 'futures';
        const exchange = document.querySelector(`#${botType}-bot-config-container select[name='exchange']`).value;
        
        showSpotBotConfigForm(botName, botId);
    });
});

document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;
        const form = this.closest('form');
        const configContainer = form.closest('.form-container');
        const botId = configContainer.getAttribute('data-bot-id');
        const botName = document.getElementById(configContainer.id + '-header').innerText.replace(' Configuration', '');
        const botType = configContainer.id.includes('spot') ? 'spot' : 'futures';
        const exchange = form.querySelector('select[name="exchange"]').value;

        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

