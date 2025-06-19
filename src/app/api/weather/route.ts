import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Coordinates for Pori, Finland
    const latitude = 61.4851;
    const longitude = 21.7972;
    
    // Using OpenWeatherMap One Call API (free tier)
    // For now, we'll simulate weather data for the demo
    // In production, you'd use: `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate different weather conditions for demo
    const weatherConditions = [
      { main: 'Clear', description: 'clear sky', icon: '01d' },
      { main: 'Clouds', description: 'scattered clouds', icon: '03d' },
      { main: 'Rain', description: 'light rain', icon: '10d' },
      { main: 'Snow', description: 'light snow', icon: '13d' },
    ];
    
    // Simple simulation based on time of day
    let weatherIndex = 0;
    if (hour >= 6 && hour < 12) weatherIndex = 0; // Morning - clear
    else if (hour >= 12 && hour < 18) weatherIndex = 1; // Afternoon - clouds
    else if (hour >= 18 && hour < 22) weatherIndex = 2; // Evening - rain
    else weatherIndex = 3; // Night - snow (for effect)
    
    // Simulate realistic Finnish summer weather
    const simulatedWeather = {
      current: {
        dt: Math.floor(Date.now() / 1000),
        sunrise: Math.floor(new Date().setHours(4, 30, 0, 0) / 1000), // Early sunrise in Finnish summer
        sunset: Math.floor(new Date().setHours(22, 30, 0, 0) / 1000), // Late sunset in Finnish summer
        temp: Math.random() * 10 + 15, // 15-25°C typical summer
        feels_like: Math.random() * 10 + 15,
        humidity: Math.random() * 30 + 60, // 60-90% typical for Finland
        wind_speed: Math.random() * 5 + 2, // 2-7 m/s
        weather: [weatherConditions[weatherIndex]]
      },
      location: {
        name: 'Pori',
        country: 'Finland',
        lat: latitude,
        lon: longitude
      }
    };
    
    return NextResponse.json(simulatedWeather);
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Fallback weather data
    const fallbackWeather = {
      current: {
        dt: Math.floor(Date.now() / 1000),
        sunrise: Math.floor(new Date().setHours(4, 30, 0, 0) / 1000),
        sunset: Math.floor(new Date().setHours(22, 30, 0, 0) / 1000),
        temp: 18,
        feels_like: 18,
        humidity: 75,
        wind_speed: 3,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
      },
      location: {
        name: 'Pori',
        country: 'Finland',
        lat: 61.4851,
        lon: 21.7972
      }
    };
    
    return NextResponse.json(fallbackWeather);
  }
}