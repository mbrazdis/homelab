"use client";

import { useState, useEffect } from "react";


interface WeatherInfo {
  current: {
    location: string;
    temperature: number;
    condition: string;
    minTemp: number;
    maxTemp: number;
    icon: string;
  };
  hourly: { hour: string; temp: number; icon: string }[];
  daily: { day: string; minTemp: number; maxTemp: number; icon: string }[];
}

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeatherData() {
      try {
        const response = await fetch("/api/fetchWeather"); 
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        let data = await response.json();
        if (data && data.current) {
          data.current.location = "București";
        }
        setWeather(data);
      } catch (err: any) {
        console.error("Failed to fetch weather data:", err);
        setError(err.message || "Failed to load weather data.");
      }
    }
    fetchWeatherData();
  }, []);

  if (error) {

    return <div className="text-red-500 p-4 bg-background rounded-lg border shadow-md w-full">{error}</div>;
  }

  if (!weather) {
    return <div className="p-4 bg-background rounded-lg border shadow-md w-full">Loading weather...</div>;
  }

  return (

    <div className="flex flex-col w-full rounded-xl shadow-lg border p-6 gap-6">
      {/* Rândul 1: Condițiile curente */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          {/* Afișăm numele orașului setat */}
          <h2 className="text-2xl font-bold text-foreground">{weather.current.location}</h2>
          <p className="text-5xl font-light text-foreground mt-1">{weather.current.temperature}°</p>
        </div>
        <div className="flex flex-col items-end text-right">
          <img src={weather.current.icon} alt={weather.current.condition} className="w-16 h-16 -mt-2 -mr-2" />
          <p className="text-sm text-muted-foreground mt-1">{weather.current.condition}</p>
          <p className="text-xs text-muted-foreground">
            H: {weather.current.maxTemp}° L: {weather.current.minTemp}°
          </p>
        </div>
      </div>

      <hr className="border-border/50" />

      {/* Rândul 2: Prognoza pe 5 ore */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Hourly Forecast</h3>
        <div className="grid grid-cols-5 gap-3">
          {weather.hourly.map((hour, index) => (
            <div key={index} className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground">{hour.hour}</p>
              <img src={hour.icon} alt="Weather Icon" className="w-8 h-8 my-1" />
              <p className="text-sm font-semibold">{hour.temp}°</p>
            </div>
          ))}
        </div>
      </div>
      
      <hr className="border-border/50" />

      {/* Rândul 3: Prognoza pe 5 zile */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">5-Day Forecast</h3>
        <div className="grid grid-cols-5 gap-3">
          {weather.daily.map((day, index) => (
            <div key={index} className="flex flex-col items-center p-2 bg-muted/30 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground">{day.day}</p>
              <img src={day.icon} alt="Weather Icon" className="w-8 h-8 my-1" />
              <p className="text-xs text-muted-foreground">
                {day.minTemp}° / {day.maxTemp}°
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}