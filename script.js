// Initialize the app when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    getWeather();
    getQuote();
});

// Get user's weather based on geolocation with fallback to NYC
function getWeather() {
    const apiKey = "651ba3df0fb896293ae2f4bb4f9f3b26";
    
    if (!navigator.geolocation) {
        document.getElementById("weather-info").innerText = "Geolocation is not supported.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => fetchWeather(40.7128, -74.0060) // Fallback to New York coordinates
    );
}

// Return appropriate weather emoji based on conditions
function getWeatherEmoji(temp, description) {
    if (description.includes("rain")) return '🌧️';
    if (temp < 32) return '❄️';  // Freezing
    if (temp < 60) return '☁️';  // Cool
    if (temp < 75) return '🌤️'; // Mild
    return '☀️';                 // Hot
}

// Fetch and display 3-day weather forecast from API
function fetchWeather(lat, lon) {
    const apiKey = "651ba3df0fb896293ae2f4bb4f9f3b26";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.list || data.list.length === 0) {
                throw new Error("No forecast data available.");
            }

            // Update current weather display
            updateCurrentWeather(data);
            
            // Display location
            document.getElementById("location").innerText = 
                `${data.city.name}, ${data.city.country}`;

            // Create chart with points
            createTemperatureChart(data.list);

            // 3-day forecast card creation
            const forecastContainer = document.getElementById("weather-info");
            forecastContainer.innerHTML = '';
            
            // Group forecasts by day
            const forecastsByDay = {};
            data.list.forEach(forecast => {
                const dateString = new Date(forecast.dt * 1000).toLocaleDateString();
                forecastsByDay[dateString] = forecastsByDay[dateString] || [];
                forecastsByDay[dateString].push(forecast);
            });

            // Create forecast cards for next 3 days
            const forecastWrapper = document.createElement("div");
            forecastWrapper.classList.add("forecast-container");

            Object.keys(forecastsByDay).slice(0, 3).forEach(dateString => {
                const dayForecasts = forecastsByDay[dateString];
                
                // Calculate day's high/low temps and get midday description
                let highTemp = -Infinity, lowTemp = Infinity;
                let description = dayForecasts[0].weather[0].description;
                
                dayForecasts.forEach(forecast => {
                    highTemp = Math.max(highTemp, forecast.main.temp_max);
                    lowTemp = Math.min(lowTemp, forecast.main.temp_min);
                    
                    // Prefer description from midday forecast (10am-2pm)
                    const hours = new Date(forecast.dt * 1000).getHours();
                    if (hours >= 10 && hours <= 14) description = forecast.weather[0].description;
                });
            
                // Format weather data
                description = description.charAt(0).toUpperCase() + description.slice(1);
                const avgTemp = (Math.round(highTemp) + Math.round(lowTemp)) / 2;
                const date = new Date(dayForecasts[0].dt * 1000);
                const isToday = date.toDateString() === new Date().toDateString();
            
                // Create forecast card
                const card = document.createElement("div");
                card.classList.add("forecast-card", ...(isToday ? ["today-card"] : []));
                card.innerHTML = `
                    <p>${date.toLocaleDateString(undefined, { 
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                    })}${isToday ? ' (Today)' : ''}</p>
                    <p>${getWeatherEmoji(avgTemp, description)}</p>
                    <p>High: ${Math.round(highTemp)}°F</p>
                    <p>Low: ${Math.round(lowTemp)}°F</p>
                    <p>${description}</p>
                `;
                forecastWrapper.appendChild(card);
            });

            forecastContainer.appendChild(forecastWrapper);
        })
        .catch(error => {
            console.error("Error fetching weather:", error);
            document.getElementById("weather-info").innerText = "Could not fetch weather data.";
        });
}

// Helper function to update current weather display
function updateCurrentWeather(data) {
    const current = data.list[0];
    const icon = getWeatherEmoji(current.main.temp, current.weather[0].description);
    
    document.getElementById('weather-icon').textContent = icon;
    document.getElementById('current-temp').textContent = `${Math.round(current.main.temp)}°F`;
    document.getElementById('weather-description').textContent = 
        current.weather[0].description.charAt(0).toUpperCase() + 
        current.weather[0].description.slice(1);
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${Math.round(current.wind.speed)} mph`;
    document.getElementById('feels-like').textContent = `${Math.round(current.main.feels_like)}°F`;
}

// Create temperature trend chart
function createTemperatureChart(forecasts) {
    // Group forecasts by local date
    const forecastsByDate = {};
    forecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toLocaleDateString();
        if (!forecastsByDate[dateString]) {
            forecastsByDate[dateString] = [];
        }
        forecastsByDate[dateString].push(forecast);
    });

    // Get today's forecasts (or first available day if today has no data)
    const todayString = new Date().toLocaleDateString();
    const todayForecasts = forecastsByDate[todayString] || Object.values(forecastsByDate)[0] || [];
    
    // Prepare data arrays
    const labels = [];
    const temps = [];
    const feelsLike = [];
    const windSpeeds = [];

    todayForecasts.forEach(forecast => {
        const time = new Date(forecast.dt * 1000);
        labels.push(time.toLocaleTimeString([], { hour: '2-digit', hour12: true }));
        temps.push(Math.round(forecast.main.temp));
        feelsLike.push(Math.round(forecast.main.feels_like));
        windSpeeds.push(Math.round(forecast.wind.speed));
    });

    const ctx = document.getElementById('temperatureChart').getContext('2d');
    
    if (window.tempChart) {
        window.tempChart.destroy();
    }
    
    window.tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temp (°F)',
                    data: temps,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Feels Like (°F)',
                    data: feelsLike,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#eeeeee',
                        boxWidth: 12,
                        font: {
                            size: 12
                        }
                    },
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    displayColors: true,
                    bodyFont: {
                        size: 12
                    },
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return `Wind: ${windSpeeds[index]} mph`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: '#eeeeee',
                        maxRotation: 45,
                        minRotation: 45
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { 
                        color: '#eeeeee',
                        callback: function(value) { return value + '°F'; }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    title: {
                        display: true,
                        text: 'Temperature (°F)',
                        color: '#eeeeee'
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 5
                }
            }
        }
    });
}

// Fetch and display random inspirational quote
async function getQuote() {
    const quoteText = document.getElementById("quote-text");
    quoteText.innerHTML = '<span class="loader">Loading...</span>';
    
    try {
        const response = await fetch(`https://api.api-ninjas.com/v1/quotes`, {
            headers: { 'X-Api-Key': 'ICPb+Q7ZFU0UytHsdwl6xg==1ywo4ejo5uFyiBhf' }
        });

        if (!response.ok) throw new Error('Failed to fetch quote');

        const data = await response.json();
        document.getElementById("quote-text").innerText = data[0].quote;
        document.getElementById("quote-author").innerText = `— ${data[0].author}`;

    } catch (error) {
        document.getElementById("quote-text").innerText = "Could not fetch quote. Here's one: 'Never give up!'";
        console.error('Quote fetch error:', error);
    }
}

// Update clock and greeting message every second
function updateTime() {
    const now = new Date();
    
    // Display current time and timezone
    document.getElementById("time").innerText = 
        now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    document.getElementById("timezone").innerText = 
        `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

    // Set appropriate greeting based on time of day
    const hours = now.getHours();
    document.getElementById("greeting-message").innerText = 
        hours < 12 ? "Good Morning! ☀️" : 
        hours < 18 ? "Good Afternoon! 🌤️" : "Good Evening! 🌙";
}

// Initialize clock and update every second
updateTime();
setInterval(updateTime, 1000);