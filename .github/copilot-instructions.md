# Homelab Smart Home Control System

## Project Vision

An extensible smart home control platform inspired by **Home Assistant**, designed to integrate devices from multiple manufacturers. Currently supports Shelly devices with architecture ready for expansion.

## Architecture Overview

This is a **monorepo** with three interconnected apps:
- **`core/`** - Python FastAPI backend (port 8000) managing devices via MQTT and WebSocket
- **`frontend/`** - Next.js 15 React app (port 3000) with real-time UI
- **`iOS_homelab/`** - Swift iOS companion app

**External Dependencies:**
- MQTT Broker (Mosquitto recommended) - Must be running before starting backend

### Critical Data Flow Pattern

```
Shelly Devices → MQTT Broker → core/mqtt_service → DeviceStateMachine (cache) → WebSocket → Frontend/iOS
```

All device state lives in `DeviceStateMachine` in-memory cache. MQTT messages update cache → WebSocket broadcasts to clients every 5s.

## Backend (`core/`)

### Entry Point: `main.py`
- **Lifespan management**: DB connection, MQTT start, background tasks (device processing + WebSocket broadcast)
- **Singleton pattern**: `state_machine` and `websocket_manager` instances shared across services
- Configure MQTT with `configure_mqtt(state_machine, websocket_manager)` before starting

### State Management
`DeviceStateMachine` (`services/state_machine/device_state_machine.py`) is the **single source of truth**:
- `devices` dict: All known devices from DB
- `new_devices` dict: Announced but unregistered devices
- `rooms` dict: Room hierarchy with entities
- Thread-safe with `Lock()` for all dict access

### Device Integration Pattern
All integrations extend `BaseDevice` (`integration/base_model.py`):
```python
class ShellyColorBulb(BaseDevice):
    manufacturer = "shelly"
    device_type = "duorgbw"
    # Implement: device_id, get_status(), update_status()
```

Control functions in `integration/shelly/duorgbw/control.py` publish MQTT commands:
```python
topic = f"shellies/{device_id}/color/0/command"
mqtt_service.safe_publish(topic, "on")
```

### Database: Dual Prisma Setup
- **Backend**: `prisma-client-py` pointing to `core/prisma/schema.prisma` → SQLite at `file:./database.db`
- **Frontend**: `prisma-client-js` pointing to `frontend/prisma/schema.prisma` → Same SQLite via `DATABASE_URL` env var
- **Schema sync required**: Keep both `.prisma` files identical (only generator differs)
- Run migrations from `core/` directory: `prisma db push` or handle via Prisma CLI

### WebSocket Commands
`websocket_service.py` handles JSON messages with `command` field:
- `get_all_data` - Full device/room state
- `turn_on`/`turn_off` - Single device control (requires `device_ids`)
- `turn_on_multiple`/`turn_off_multiple` - Bulk operations (requires `device_ids` array)
- `set_color_mode`/`set_white_mode`/`set_color` - Shelly Duo RGBW control

### Configuration
Environment variables in `config/settings.py` from `.env`:
- `DATABASE_URL` - SQLite path (e.g., `file:./database.db`)
- `MQTT_BROKER` - Mosquitto broker IP (e.g., `192.168.1.100`)
- `MQTT_PORT` - Default 1883

### MQTT Broker Setup
External Mosquitto broker required. Basic config:
```bash
# Install Mosquitto
brew install mosquitto  # macOS
sudo apt install mosquitto mosquitto-clients  # Linux

# Start broker
mosquitto -v  # Verbose mode for debugging
```
Configure `MQTT_BROKER` env var to broker's IP address.

## Frontend (`frontend/`)

### Real-Time Architecture
- **Hook**: `useWebSocket(url)` connects to backend WS, auto-reconnects on close
- **Data interpretation**: `hooks/deviceStateMachine.ts` → `interpretDevices()` transforms raw MQTT status to UI-friendly state
- **Server Components**: Dashboard pages use Prisma Client directly (`db.room.findMany()`)
- **Client Components**: Use WebSocket for live updates

### WebSocket URLs
**⚠️ HARDCODED - Needs Refactoring**: Currently hardcoded in multiple files with inconsistent IPs:
- `frontend/src/app/page.tsx`: `ws://192.168.100.205:8000/ws`
- `frontend/src/components/customComponents/lightCard.tsx`: `ws://192.168.0.67:8000/ws`
- `frontend/src/app/view/entities/_components/add/page.tsx`: `ws://localhost:8000/ws`

**TODO**: Move to environment variable (`NEXT_PUBLIC_WS_URL`) in `frontend/.env.local`

### Styling
- Tailwind + Shadcn UI components (`components/ui/`)
- Custom components in `components/customComponents/`
- Theme provider supports dark mode

## iOS App (`iOS_homelab/`)

### WebSocket Manager
`ViewModels/WebSocketManager.swift` is a singleton:
```swift
WebSocketManager.shared.connect()
```
Hardcoded to `ws://192.168.0.67:8000/ws` - update for your network.

### Models
- `Room.swift`, `Entity.swift` - Mirror Prisma schema
- `AnyCodable.swift` - JSON decoding helper for dynamic status fields

## Development Workflow

### Starting Backend
```bash
cd core
python main.py  # Uvicorn with auto-reload on port 8000
```

### Starting Frontend
```bash
cd frontend
npm run dev  # Next.js on port 3000
```

### Database Migrations
Run from `core/` directory:
```bash
prisma db push  # Apply schema changes
```
Then copy schema changes to `frontend/prisma/schema.prisma` (keep generator as `prisma-client-js`).

### Adding New Device Types
**Extensibility is a core design goal** - the system is built to support multiple manufacturers.

1. Create device class in `core/integration/{manufacturer}/{model}/`
2. Extend `BaseDevice` with device-specific logic:
   ```python
   class NewDevice(BaseDevice):
       manufacturer = "brand_name"
       device_type = "device_model"
   ```
3. Add control functions using `mqtt_service.safe_publish()` (or HTTP/other protocols)
4. Update `DeviceStateMachine.handle_message()` if new MQTT topics needed
5. Add WebSocket command handlers in `websocket_service.py`
6. Add frontend components in `frontend/src/components/customComponents/`

**Current Integrations:**
- Shelly Duo RGBW (MQTT-based color bulbs)

**Planned/Possible Integrations:**
- Other Shelly devices (plugs, switches, sensors)
- Zigbee devices via MQTT bridge
- WiFi devices with HTTP APIs
- Cloud-based devices with OAuth

## Key Conventions

- **No async/await in MQTT callbacks** - Use `asyncio.create_task()` or call sync wrappers
- **Status is always JSON string in DB** - Use `json.loads(device.status)` when reading
- **Device IDs come from Shelly** - Format: `shellyduorgbw-{MAC}`
- **MQTT topics**: `shellies/{device_id}/{component}/{index}/{action}`
- **Thread safety**: Always wrap `DeviceStateMachine.devices` access with `with self.lock:`


