type DeviceStatus = {
    online?: boolean;
    ison?: boolean;
    mode?: string;
    brightness?: number;
    temp?: number;
    red?: number;
    green?: number;
    blue?: number;
    power?: number;
    energy?: number;
  };
  
  type Device = {
    id: string;
    name: string;
    type: string;
    status: DeviceStatus;
  };
  
  type Devices = {
    [deviceId: string]: Device;
  };
  
  type DeviceState = {
    id: string;
    name: string;
    type: string;
    isOnline: boolean;
    isOn: boolean;
    mode?: string;
    brightness?: number;
    temperature?: number;
    color?: { red: number; green: number; blue: number };
    power?: number;
    energy?: number;
  };
  
  export function interpretDevices(devices: Devices): DeviceState[] {
    const interpretedDevices: DeviceState[] = [];
  
    for (const deviceId in devices) {
      const device = devices[deviceId];
      const status = device.status || {};
  
      interpretedDevices.push({
        id: device.id,
        name: device.name,
        type: device.type,
        isOnline: status.online || false,
        isOn: status.ison || false,
        mode: status.mode,
        brightness: status.brightness,
        temperature: status.temp,
        color: status.red !== undefined && status.green !== undefined && status.blue !== undefined
          ? { red: status.red, green: status.green, blue: status.blue }
          : undefined,
        power: status.power,
        energy: status.energy,
      });
    }
  
    return interpretedDevices;
  }