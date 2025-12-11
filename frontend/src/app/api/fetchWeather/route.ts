import { NextResponse } from "next/server";

const API_KEY = process.env.ACCUWEATHER_API_KEY;
const LOCATION_KEY = process.env.ACCUWEATHER_LOCATION_KEY || "287430";

function getWeatherIconUrl(iconId: number): string {
  return `https://developer.accuweather.com/sites/default/files/${iconId < 10 ? `0${iconId}` : iconId}-s.png`;
}

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "AccuWeather API key not configured" },
      { status: 500 }
    );
  }

  try {
    const currentConditionsUrl = `http://dataservice.accuweather.com/currentconditions/v1/${LOCATION_KEY}?apikey=${API_KEY}`;
    const hourlyForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/${LOCATION_KEY}?apikey=${API_KEY}&metric=true`;
    const dailyForecastUrl = `http://dataservice.accuweather.com/forecasts/v1/daily/5day/${LOCATION_KEY}?apikey=${API_KEY}&metric=true`;

    const [currentConditionsRes, hourlyForecastRes, dailyForecastRes] = await Promise.all([
      fetch(currentConditionsUrl),
      fetch(hourlyForecastUrl),
      fetch(dailyForecastUrl),
    ]);

    if (!currentConditionsRes.ok || !hourlyForecastRes.ok || !dailyForecastRes.ok) {
      throw new Error("Failed to fetch weather data from AccuWeather");
    }

    const currentConditions = await currentConditionsRes.json();
    const hourlyForecast = await hourlyForecastRes.json();
    const dailyForecast = await dailyForecastRes.json();

    const weatherData = {
      current: {
        location: currentConditions[0].LocalizedName, 
        temperature: currentConditions[0].Temperature.Metric.Value,
        condition: currentConditions[0].WeatherText,
        minTemp: dailyForecast.DailyForecasts[0].Temperature.Minimum.Value,
        maxTemp: dailyForecast.DailyForecasts[0].Temperature.Maximum.Value,
        icon: getWeatherIconUrl(currentConditions[0].WeatherIcon),
      },
      hourly: hourlyForecast.slice(0, 5).map((hour: any) => ({
        hour: new Date(hour.DateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        temp: hour.Temperature.Value,
        icon: getWeatherIconUrl(hour.WeatherIcon),
      })),
      daily: dailyForecast.DailyForecasts.map((day: any) => ({
        day: new Date(day.Date).toLocaleDateString([], { weekday: "short" }),
        minTemp: day.Temperature.Minimum.Value,
        maxTemp: day.Temperature.Maximum.Value,
        icon: getWeatherIconUrl(day.Day.Icon),
      })),
    };

    // Returnăm datele
    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Failed to fetch weather data:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}