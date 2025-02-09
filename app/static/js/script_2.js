// Handle Bot Status Change Function
async function handleBotStatusChange(botId, botName, botType, exchange, status) {
    console.log("Updating Bot Status:", { botId, botName, botType, exchange, status });

    try {
        const response = await fetch('/api/bot/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bot_id: botId, bot_name: botName, bot_type: botType, exchange, status }),
        });

        const result = await response.json();

        if (result.success) {
            alert(`${botName.replace('_', ' ')} (${exchange}, ${botType}) is now ${status ? 'ON' : 'OFF'}`);
        } else {
            alert(`Failed to update ${botName.replace('_', ' ')} status.`);
        }
    } catch (error) {
        console.error('Error while updating bot status:', error);
        alert(`An error occurred while updating the status for ${botName.replace('_', ' ')}`);
    }
}

// Add Event Listeners to All Toggle Switches
document.querySelectorAll('input[type="checkbox"][name="bot-status"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        const botStatus = this.checked;

        // Find the closest bot container
        const botContainer = this.closest('.bot-container');
        if (!botContainer) return;  // Prevents errors if the container is missing

        const botId = botContainer.getAttribute('data-bot-id');
        const botName = botContainer.innerText.trim();
        const botType = botContainer.closest('#spot-section') ? 'spot' : 'futures';

        // Extract exchange value from the associated form
        const form = this.closest('form');
        const exchange = form.querySelector('.futures-exchange').value; // Uses class, not ID

        handleBotStatusChange(botId, botName, botType, exchange, botStatus);
    });
});

