import { useState, useEffect } from "react";
import { interpretDevices } from "./deviceStateMachine";

type Devices = {
  [deviceId: string]: {
    id: string;
    name: string;
    type: string;
    status: any;
  };
};

export function useDeviceState(initialDevices: Devices, wsUrl: string) {
  const [devices, setDevices] = useState(interpretDevices(initialDevices));

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.devices) {
          const updatedDevices = interpretDevices(data.devices);
          setDevices(updatedDevices);
        }
      } catch (error) {
        console.error("❌ Failed to parse WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("⚠️ WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  return devices;
}