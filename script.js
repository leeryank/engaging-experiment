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
                const tomorrow = new Date(today);
                tomorrow.setDate(today.getDate() + 1); // Set to tomorrow

                // Create a new forecast card
                const card = document.createElement("div");
                card.classList.add("forecast-card");
                card.innerHTML = `
                    <p>${formattedDate} ${date.toDateString() === today.toDateString() ? "(Today)" : date.toDateString() === tomorrow.toDateString() ? "(Tomorrow)" : ""}</p>
                    <p>🌡️ ${temp}°F</p>
                    <p>${description}</p>
                `;

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

// Fetch Random Advice
let lastAdvice = null;

async function getAdvice() {
    const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
    const data = await response.json();
    
    if (data.slip.advice !== lastAdvice) {
        lastAdvice = data.slip.advice;
        // Display advice
    } else {
        // If same advice comes, fetch again
        getAdvice();
    }

    const quoteText = document.getElementById("quote-text");
    quoteText.innerHTML = '<span class="loader">...</span>';
    try {
        // Add timestamp to prevent caching
        const response = await fetch(`https://api.adviceslip.com/advice?t=${Date.now()}`);
        
        if (!response.ok) throw new Error('Failed to fetch advice');
        
        const data = await response.json();
        
        // Update DOM elements
        document.getElementById("quote-text").innerText = data.slip.advice;
        document.getElementById("quote-author").innerText = "— Life Advice";
        
    } catch (error) {
        document.getElementById("quote-text").innerText = "Could not fetch advice. Here's one: 'Never give up!'";
        console.error('Advice fetch error:', error);
    }
}

// Call the function when page loads
getAdvice();






