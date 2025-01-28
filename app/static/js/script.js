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
