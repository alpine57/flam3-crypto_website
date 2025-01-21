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

        document.getElementById('spot-bot-config-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const exchange = document.getElementById('spot-exchange').value;
            const apiKey = document.getElementById('spot-api-key').value;
            const apiSecret = document.getElementById('spot-api-secret').value;
            const tradeAmount = document.getElementById('spot-trade-amount').value;
            const tradePair = document.getElementById('spot-trade-pair').value;
            const timeFrame = document.getElementById('spot-time-frame').value;
            const botStatus = document.getElementById('spot-bot-status').checked;

            const spotBotConfig = {
                exchange,
                apiKey,
                apiSecret,
                tradeAmount,
                tradePair,
                timeFrame,
                
            };

            console.log('Spot Bot Configuration:', spotBotConfig);
            closeSpotBotConfigForm();
        });

        document.getElementById('futures-bot-config-form').addEventListener('submit', function(event) {
            event.preventDefault();

            const exchange = document.getElementById('futures-exchange').value;
            const apiKey = document.getElementById('futures-api-key').value;
            const apiSecret = document.getElementById('futures-api-secret').value;
            const tradeAmount = document.getElementById('futures-trade-amount').value;
            const tradePair = document.getElementById('futures-trade-pair').value;
            const leverage = document.getElementById('leverage').value;
            const timeFrame = document.getElementById('futures-time-frame').value;
            const botStatus = document.getElementById('futures-bot-status').checked;

            const futuresBotConfig = {
                exchange,
                apiKey,
                apiSecret,
                tradeAmount,
                tradePair,
                leverage,
                timeFrame,
                botStatus
            };

            console.log('Futures Bot Configuration:', futuresBotConfig);
            closeFuturesBotConfigForm();

        });
 // Function to update the profit charts
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
