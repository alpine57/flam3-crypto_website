// script.js

// Navigation logic
document.getElementById("home-link").addEventListener("click", function () {
    showSection("home-section");
});
document.getElementById("spot-link").addEventListener("click", function () {
    showSection("spot-section");
});
document.getElementById("futures-link").addEventListener("click", function () {
    showSection("futures-section");
});
document.getElementById("settings-link").addEventListener("click", function () {
    showSection("settings-section");
});

function showSection(sectionId) {
    const sections = document.querySelectorAll(".content");
    sections.forEach(section => section.style.display = "none");
    document.getElementById(sectionId).style.display = "flex";
}

// Spot Bot Configuration Form
function showSpotBotConfigForm(botName) {
    const configContainer = document.getElementById("spot-bot-config-container");
    const configHeader = document.getElementById("spot-bot-config-header");
    configHeader.textContent = `${botName} Configuration`;
    configContainer.style.display = "block";
}

function closeSpotBotConfigForm() {
    document.getElementById("spot-bot-config-container").style.display = "none";
}

// Futures Bot Configuration Form
function showFuturesBotConfigForm(botName) {
    const configContainer = document.getElementById("futures-bot-config-container");
    const configHeader = document.getElementById("futures-bot-config-header");
    configHeader.textContent = `${botName} Configuration`;
    configContainer.style.display = "block";
}

function closeFuturesBotConfigForm() {
    document.getElementById("futures-bot-config-container").style.display = "none";
}

// Initialize Charts
document.addEventListener("DOMContentLoaded", function () {
    const spotProfitCtx = document.getElementById('spotProfitChart').getContext('2d');
    const futuresProfitCtx = document.getElementById('futuresProfitChart').getContext('2d');

    new Chart(spotProfitCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Spot Profit',
                data: [500, 1000, 1500, 1200, 1800, 2000],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    new Chart(futuresProfitCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Futures Profit',
                data: [700, 1200, 1600, 1400, 2000, 2500],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

