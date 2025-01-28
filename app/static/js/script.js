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

         // Object to store configurations for each bot
const botConfigs = {};

// Function to open the configuration form for a specific bot
function showSpotBotConfigForm(botName, botId) {
    const config = botConfigs[botId] || {
        exchange: 'binance',
        apiKey: '',
        apiSecret: '',
        tradeAmount: '',
        tradePair: '',
        timeFrame: '1m',
        botStatus: false,
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
document.getElementById('spot-bot-config-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const botId = event.target.dataset.botId;

    // Save the form data into the botConfigs object
    botConfigs[botId] = {
        exchange: document.getElementById('futures-exchange').value,
        apiKey: document.getElementById('spot-api-key').value,
        apiSecret: document.getElementById('spot-api-secret').value,
        tradeAmount: document.getElementById('spot-trade-amount').value,
        tradePair: document.getElementById('spot-trade-pair').value,
        timeFrame: document.getElementById('spot-time-frame').value,
        botStatus: document.getElementById('spot-bot-status').checked,
    };

    console.log(`Saved configuration for ${botId}:`, botConfigs[botId]);
    closeSpotBotConfigForm();
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
