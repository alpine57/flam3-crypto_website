<script>
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

document.getElementById('futures-bot-config-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const exchange = document.getElementById('futures-exchange').value;
    const apiKey = document.getElementById('futures-api-key').value;
    const apiSecret = document.getElementById('futures-api-secret').value;
    const tradeAmount = document.getElementById('futures-trade-amount').value;
    const tradePair = document.getElementById('futures-trade-pair').value;
    const leverage = document.getElementById('leverage').value;
    const timeFrame = document.getElementById('futures-time-frame').value;

    const futuresBotConfig = {
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        leverage,
        timeFrame
    };

    console.log('Futures Bot Configuration:', futuresBotConfig);

    // Send the configuration to the backend
    try {
        const response = await fetch('/api/bot/futures/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(futuresBotConfig)
        });

        const result = await response.json();
        console.log('Server Response:', result);

        if (result.success) {
            alert('Futures bot configuration updated and restarted successfully!');
        } else {
            alert('Failed to update the futures bot configuration.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the futures bot configuration.');
    }

    closeFuturesBotConfigForm();
});
document.getElementById('spot-bot-status').addEventListener('change', async function() {
    const exchange = document.getElementById('spot-exchange').value;
    const apiKey = document.getElementById('spot-api-key').value;
    const apiSecret = document.getElementById('spot-api-secret').value;
    const tradeAmount = document.getElementById('spot-trade-amount').value;
    const tradePair = document.getElementById('spot-trade-pair').value;
    const timeFrame = document.getElementById('spot-time-frame').value;

    const spotBotConfig = {
        exchange,
        apiKey,
        apiSecret,
        tradeAmount,
        tradePair,
        timeFrame
    };

    console.log('Spot Bot Configuration:', spotBotConfig);

    // Send the configuration to the backend
    try {
        const response = await fetch('/api/bot/spot/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(spotBotConfig)
        });

        const result = await response.json();
        console.log('Spot Bot Status Updated:', result);

        if (result.success) {
            alert('Spot bot configuration updated and restarted successfully!');
        } else {
            alert('Failed to update the spot bot configuration.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while updating the spot bot configuration.');
    }
});
