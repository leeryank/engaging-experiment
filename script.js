// Wait for the DOM to load before running functions
document.addEventListener("DOMContentLoaded", () => {
    getWeather();  // 
    getQuote();
});

// Define the getWeather function
function getWeather() {
    const apiKey = "651ba3df0fb896293ae2f4bb4f9f3b26";
    
    if (!navigator.geolocation) {
        document.getElementById("weather-info").innerText = "Geolocation is not supported.";
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
    }, () => {
        fetchWeather(40.7128, -74.0060); // Fallback: New York
    });
}

// Function to determine weather emoji based on temperature and conditions
function getWeatherEmoji(temp, description) {
    if (description.includes("rain")) { // Rainy weather
        return '🌧️'; // Cloud with rain
    } else if (temp < 32) { // Below freezing
        return '❄️'; // Snowflake
    } else if (temp < 60) { // Cool weather
        return '☁️'; // Cloud
    } else if (temp < 75) { // Mild weather
        return '🌤️'; // Sun behind small cloud
    } else { // Hot weather
        return '☀️'; // Sun
    }
}

// Define fetchWeather function
function fetchWeather(lat, lon) {
    const apiKey = "651ba3df0fb896293ae2f4bb4f9f3b26";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.list || data.list.length === 0) {
                throw new Error("No forecast data available.");
            }

            // Clear previous content
            const forecastContainer = document.getElementById("weather-info");
            forecastContainer.innerHTML = '';

            // Display the location
            const locationElement = document.getElementById("location");
            const cityName = data.city.name;
            const countryCode = data.city.country;
            locationElement.innerText = `${cityName}, ${countryCode}`;

            // Group forecasts by day
            const forecastsByDay = {};
            data.list.forEach(forecast => {
                const date = new Date(forecast.dt * 1000);
                const dateString = date.toLocaleDateString();
                
                if (!forecastsByDay[dateString]) {
                    forecastsByDay[dateString] = [];
                }
                forecastsByDay[dateString].push(forecast);
            });

            // Create a wrapper for the forecast cards
            const forecastWrapper = document.createElement("div");
            forecastWrapper.classList.add("forecast-container");

            // Get the first 3 days
            const days = Object.keys(forecastsByDay).slice(0, 3);

            days.forEach((dateString, index) => {
                const dayForecasts = forecastsByDay[dateString];
                
                // Find max and min temperatures for the day
                let highTemp = -Infinity;
                let lowTemp = Infinity;
                let description = dayForecasts[0].weather[0].description; // Default to first forecast's description
                
                dayForecasts.forEach(forecast => {
                    highTemp = Math.max(highTemp, forecast.main.temp_max);
                    lowTemp = Math.min(lowTemp, forecast.main.temp_min);
                    
                    // Use the description from midday forecast if available
                    const hours = new Date(forecast.dt * 1000).getHours();
                    if (hours >= 10 && hours <= 14) {
                        description = forecast.weather[0].description;
                    }
                });
            
                // If we didn't get a midday description, use the most common description of the day
                if (!description) {
                    const descCounts = {};
                    dayForecasts.forEach(forecast => {
                        const desc = forecast.weather[0].description;
                        descCounts[desc] = (descCounts[desc] || 0) + 1;
                    });
                    description = Object.keys(descCounts).reduce((a, b) => 
                        descCounts[a] > descCounts[b] ? a : b
                    );
                }
            
                // Capitalize first letter of description
                description = description.charAt(0).toUpperCase() + description.slice(1);
                
            
                highTemp = Math.round(highTemp);
                lowTemp = Math.round(lowTemp);
                
                // Get average temp for emoji selection
                const avgTemp = (highTemp + lowTemp) / 2;
                
                // Get date info
                const date = new Date(dayForecasts[0].dt * 1000);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = date.toLocaleDateString(undefined, options);
            
                // Determine if it's today
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = date.toDateString() === today.toDateString();
            
                // Get weather emoji
                const weatherEmoji = getWeatherEmoji(avgTemp, description);
            
                // Create forecast card
                const card = document.createElement("div");
                card.classList.add("forecast-card");
                if (isToday) card.classList.add("today-card");
            
                card.innerHTML = `
                    <p>${formattedDate}${isToday ? ' (Today)' : ''}</p>
                    <p>${weatherEmoji}</p>
                    <p>High: ${highTemp}°F</p>
                    <p>Low: ${lowTemp}°F</p>
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

async function getQuote() {
    const quoteText = document.getElementById("quote-text");
    quoteText.innerHTML = '<span class="loader">Loading...</span>';
    
    try {
        // Fetch a random quote from API Ninjas
        const response = await fetch(`https://api.api-ninjas.com/v1/quotes`, {
            headers: { 'X-Api-Key': 'ICPb+Q7ZFU0UytHsdwl6xg==1ywo4ejo5uFyiBhf' }
        });

        if (!response.ok) throw new Error('Failed to fetch quote');

        const data = await response.json();

        // Update DOM elements
        document.getElementById("quote-text").innerText = data[0].quote;
        document.getElementById("quote-author").innerText = `— ${data[0].author}`;

    } catch (error) {
        document.getElementById("quote-text").innerText = "Could not fetch quote. Here's one: 'Never give up!'";
        console.error('Quote fetch error:', error);
    }
}

// Update the current time and timezone every second
function updateTime() {
    const now = new Date();
    const options = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    const formattedTime = now.toLocaleTimeString(undefined, options);
    const formattedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // Get timezone

    document.getElementById("time").innerText = formattedTime;
    document.getElementById("timezone").innerText = `Timezone: ${formattedTimezone}`;

    // Determine greeting based on time
    const hours = now.getHours();
    let greetingText = "";

    if (hours < 12) {
        greetingText = "Good Morning! ☀️";
    } else if (hours < 18) {
        greetingText = "Good Afternoon! 🌤️";
    } else {
        greetingText = "Good Evening! 🌙";
    }

    // Update greeting message
    document.getElementById("greeting-message").innerText = greetingText;
}

// Call updateTime every second
setInterval(updateTime, 1000);

// Call the function to set initial time
updateTime();







