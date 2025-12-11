"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import useWebSocket from "@/hooks/useWebSocket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws";

export function LightCard({ deviceIds }: { deviceIds: string[] }) {
  const [activeSection, setActiveSection] = useState("white");
  const [brightness, setBrightness] = useState(50);
  const [temperature, setTemperature] = useState(3000);
  const [isPowerOn, setIsPowerOn] = useState(false);

  const { ws, messages } = useWebSocket(WS_URL);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("📥 Received WebSocket message:", data);

        if (data.command === "state") {
          setIsPowerOn(data.state === "on");
          setBrightness(data.brightness);
          setTemperature(data.temperature);
        }
      };
    }
  }, [ws]);

  const handlePowerToggle = () => {
    const command = isPowerOn ? "turn_off_multiple" : "turn_on_multiple";

    const payload = {
      command,
      device_ids: deviceIds,
    };

    if (ws) {
      ws.send(JSON.stringify(payload));
      console.log("📤 Sent WebSocket message:", payload);
    } else {
      console.error("❌ WebSocket is not connected.");
    }

    setIsPowerOn(!isPowerOn);
  };

  const sendModeChange = (mode: string) => {
    const payload = {
      command: mode, // Trimite "set_color_mode" sau "set_white_mode" ca valoare pentru cheia "command"
      device_ids: deviceIds,
    };

    if (ws) {
      ws.send(JSON.stringify(payload)); // Trimite payload-ul ca JSON
      console.log(`📤 Sent WebSocket message: ${JSON.stringify(payload)}`);
    } else {
      console.error("❌ WebSocket is not connected.");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md bg-background rounded-lg border p-4">
      {/* Preview Area */}
      <div className="mb-6 h-40 flex items-center justify-center rounded-lg bg-muted/50 relative overflow-hidden">
        {isPowerOn ? (
          <div className="text-center text-primary">
            <SunIcon className="h-16 w-16 mx-auto mb-2" />
            <p>Light is ON</p>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            <MoonIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <p>Light is OFF</p>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 mb-6">
        {activeSection === "power" && (
          <div className="flex flex-col items-center">
            <button
              className={`w-20 h-20 rounded-full border flex items-center justify-center ${
                isPowerOn
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
              onClick={handlePowerToggle}
            >
              {isPowerOn ? <SunIcon className="h-10 w-10" /> : <MoonIcon className="h-10 w-10" />}
            </button>
            <p className="mt-4 text-center">
              {isPowerOn ? "Light is ON" : "Light is OFF"}
            </p>
          </div>
        )}

        {/* Alte secțiuni */}
        {activeSection === "white" && (
          <div className="flex flex-col items-center">
            <div className="text-xl font-semibold mb-2">{brightness}%</div>
            <div className="text-xs text-muted-foreground mb-6">Brightness</div>

            <div className="relative h-64 w-16 flex items-end justify-center">
              {/* Input range */}
              <input
                type="range"
                min="0"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="absolute rotate-[-90deg] w-64 origin-bottom opacity-0 cursor-pointer z-10"
                aria-label="Brightness slider"
              />

              {/* Bara de progres */}
              <div
                className="absolute bottom-0 w-16 rounded-t-full transition-all duration-300 bg-primary"
                style={{
                  height: `${brightness}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Navbar */}
      <div className="flex justify-around border-t pt-4">
        <button
          className={`py-2 px-4 rounded-lg ${
            activeSection === "power"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => setActiveSection("power")}
        >
          Power
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${
            activeSection === "white"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => {
            setActiveSection("white");
            sendModeChange("set_white_mode"); // Trimite payload-ul "set_white_mode"
          }}
        >
          White Light
        </button>
        <button
          className={`py-2 px-4 rounded-lg ${
            activeSection === "colors"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
          onClick={() => {
            setActiveSection("colors");
            sendModeChange("set_color_mode"); // Trimite payload-ul "set_color_mode"
          }}
        >
          Colors
        </button>
      </div>
    </div>
  );
}