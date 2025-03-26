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
            const cityName = data.city.name; // Get the city name from the response
            const countryCode = data.city.country; // Get the country code from the response
            locationElement.innerText = `${cityName}, ${countryCode}`; // Set location text

            // Create a wrapper for the forecast cards
            const forecastWrapper = document.createElement("div");
            forecastWrapper.classList.add("forecast-container"); // Add the flex container class

            // Create forecast cards for the next 3 days
            for (let i = 0; i < 3; i++) {
                const forecast = data.list[i * 8]; // Get the forecast for every 8th entry (every 24 hours)
                const temp = Math.round(forecast.main.temp);
                const description = forecast.weather[0].description;
                const date = new Date(forecast.dt * 1000);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const formattedDate = date.toLocaleDateString(undefined, options);

                // Determine if the date is today or tomorrow
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to the start of today
                const isToday = date.toDateString() === today.toDateString(); // Check if it's today

                // Get the appropriate emoji for the temperature and description
                const weatherEmoji = getWeatherEmoji(temp, description);

                // Create a new forecast card
                const card = document.createElement("div");
                card.classList.add("forecast-card");

                // Add a special class for today's card
                if (isToday) {
                    card.classList.add("today-card");
                    // Set inner HTML for today card with explicit "Today" text
                    card.innerHTML = `
                    <p>${formattedDate} (Today)</p>
                    <p>${weatherEmoji}  ${temp}°F</p>
                    <p>${description}</p>
                    `;
                } else {
                    card.innerHTML = `
                        <p>${formattedDate}</p>
                        <p>${weatherEmoji}  ${temp}°F</p>
                        <p>${description}</p>
                    `;
                }

                // Append the card to the forecast wrapper
                forecastWrapper.appendChild(card);
            }

            // Append the forecast wrapper to the forecast container
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
}

// Call updateTime every second
setInterval(updateTime, 1000);

// Call the function to set initial time
updateTime();






