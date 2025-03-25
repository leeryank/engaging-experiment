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
            console.log("API Data:", data); // Debugging Log

            if (!data.list || data.list.length === 0) {
                throw new Error("No forecast data available.");
            }

            const forecast = data.list[0];  
            const temp = Math.round(forecast.main.temp);
            const description = forecast.weather[0].description;
            const city = data.city.name;

            document.getElementById("weather-info").innerText = 
                `🌡️ ${temp}°F | ${description} in ${city}`;
        })
        .catch(error => {
            console.error("Error fetching weather:", error);
            document.getElementById("weather-info").innerText = "Could not fetch weather data.";
        });
}



// Fetch Daily Quote from ZenQuotes
async function getQuote() {
    const quoteUrl = "https://zenquotes.io/api/random";
    
    try {
        const response = await fetch(quoteUrl);
        
        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }
        
        const data = await response.json();
        
        // Update HTML elements
        document.getElementById("quote-text").textContent = data[0].q;
        document.getElementById("quote-author").textContent = `— ${data[0].a}`;
        
    } catch (error) {
        console.error("Error fetching quote:", error);
        document.getElementById("quote-text").textContent = "Could not fetch quote. Please try again later.";
        document.getElementById("quote-author").textContent = "";
    }
}

// Call the function when the page loads
window.addEventListener("load", getQuote);






