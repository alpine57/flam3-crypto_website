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

         async function showSpotBotConfigForm(botName, botId) {
    document.getElementById('spot-bot-config-header').innerText = `${botName} Configuration`;

    try {
        // Fetch configuration for the bot from the backend
        const response = await fetch(`/api/spot-bots/${botId}`);
        const config = await response.json();

        // Populate the form with the bot's specific configuration
        document.getElementById('futures-exchange').value = config.exchange || 'binance';
        document.getElementById('spot-api-key').value = config.apiKey || '';
        document.getElementById('spot-api-secret').value = config.apiSecret || '';
        document.getElementById('spot-trade-amount').value = config.tradeAmount || '';
        document.getElementById('spot-trade-pair').value = config.tradePair || '';
        document.getElementById('spot-time-frame').value = config.timeFrame || '1m';
        document.getElementById('spot-bot-status').checked = config.botStatus || false;

        document.getElementById('spot-bot-config-container').style.display = 'block';

        // Save the botId for use in the submit handler
        document.getElementById('spot-bot-config-form').dataset.botId = botId;
    } catch (error) {
        console.error('Failed to fetch bot configuration:', error);
        alert('Error loading bot configuration. Please try again.');
    }
}

// Close form
function closeSpotBotConfigForm() {
    document.getElementById('spot-bot-config-container').style.display = 'none';
}

// Submit handler
document.getElementById('spot-bot-config-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Collect form data
    const config = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked,
    };

    try {
        // Save configuration to the backend
        const response = await fetch(`/api/spot-bots/${botId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            throw new Error('Failed to save configuration');
        }

        alert('Configuration saved successfully!');
        closeSpotBotConfigForm();
    } catch (error) {
        console.error('Failed to save bot configuration:', error);
        alert('Error saving bot configuration. Please try again.');
    }
});

      
 // 
        function updateCharts() {
            // Short forms of the days of the week
            const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

            // Spot profit chart
            var spotCtx = document.getElementById('spotProfitChart').getContext('2d');
            var spotChart = new Chart(spotCtx, {
                type: 'line',
                data: {
                    labels: daysOfWeekShort,
                    datasets: [
                        {
                            label: 'Coinbase Profit',
                            data: [10, 15, 8, 12, 7, 10, 20],
                            borderColor: 'rgb(54, 162, 235)',
                            borderWidth: 1,
                            fill: false
                        },
                        {
                            label: 'Binance Profit',
                            data: [12, 19, 3, 5, 2, 3, 15],
                            borderColor: 'rgb(255, 205, 86)',
                            borderWidth: 1,
                            fill: false
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Futures profit chart
            var futuresCtx = document.getElementById('futuresProfitChart').getContext('2d');
            var futuresChart = new Chart(futuresCtx, {
                type: 'line',
                data: {
                    labels: daysOfWeekShort,
                    datasets: [{
                        label: 'Futures Market Profit',
                        data: [7, 11, 5, 8, 3, 7, 10],
                        borderColor: 'rgb(54, 162, 235)',
                        borderWidth: 1,
                        fill: false
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Call the function to update charts
        updateCharts();
