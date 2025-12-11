# 🏠 HomeLab - Smart Home Control System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)

A modern, extensible smart home control platform inspired by [Home Assistant](https://www.home-assistant.io/), designed to integrate devices from multiple manufacturers into a unified control interface.

![HomeLab Architecture](https://via.placeholder.com/800x400.png?text=Add+Your+Dashboard+Screenshot)

## ✨ Features

- **🔌 Multi-Manufacturer Support** - Extensible architecture for integrating devices from different brands
- **⚡ Real-Time Control** - WebSocket-based communication for instant device updates
- **📱 Cross-Platform** - Web dashboard (Next.js) and native iOS app
- **🎨 Modern UI** - Beautiful, responsive interface built with Tailwind CSS and Shadcn UI
- **🔐 Local Control** - Runs entirely on your local network via MQTT
- **🎯 Room Organization** - Group devices by rooms for easy management
- **🌈 RGB Lighting Control** - Full color and temperature control for smart bulbs
- **📊 Device Status Monitoring** - Real-time power consumption and status tracking

### Currently Supported Devices

- **Shelly Duo RGBW** - Full RGB color bulbs with brightness and temperature control
- _More integrations coming soon..._

## 🏗️ Architecture

HomeLab is a monorepo consisting of three interconnected applications:

```
┌─────────────────┐
│  Smart Devices  │ (Shelly, etc.)
└────────┬────────┘
         │ MQTT
         ▼
┌─────────────────┐
│  MQTT Broker    │ (Mosquitto)
└────────┬────────┘
         │
         ▼
┌─────────────────┐      WebSocket      ┌─────────────────┐
│  Python Backend │◄───────────────────►│  Next.js Web    │
│    (FastAPI)    │                     │    Frontend     │
└────────┬────────┘                     └─────────────────┘
         │                                      
         │ SQLite (Prisma)                     
         │                                      
         ▼                              
┌─────────────────┐                     
│   iOS App       │                     
│    (Swift)      │                     
└─────────────────┘                     
```

### Core Components

- **`core/`** - FastAPI backend server
  - MQTT service for device communication
  - WebSocket server for real-time updates
  - SQLite database with Prisma ORM
  - Device state machine (in-memory cache)
  
- **`frontend/`** - Next.js 15 web application
  - Server-side rendering with React Server Components
  - Real-time device control via WebSocket
  - Shadcn UI component library
  
- **`iOS_homelab/`** - Native iOS companion app
  - Swift SwiftUI interface
  - WebSocket integration for real-time updates

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** and npm
- **MQTT Broker** (Mosquitto recommended)
- **Xcode** (for iOS app development, optional)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/homelab.git
cd homelab
```

#### 2. Set Up MQTT Broker

**macOS:**
```bash
brew install mosquitto
brew services start mosquitto
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients
sudo systemctl start mosquitto
sudo systemctl enable mosquitto
```

#### 3. Configure Backend

```bash
cd core

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=file:./database.db
MQTT_BROKER=localhost
MQTT_PORT=1883
EOF

# Initialize database
prisma db push
```

#### 4. Configure Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
DATABASE_URL=file:../core/database.db
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
EOF

# Generate Prisma client
npx prisma generate
```

### 🎯 Running the Application

#### Start Backend Server

```bash
cd core
source venv/bin/activate
python main.py
```

The backend will be available at `http://localhost:8000`

#### Start Frontend

```bash
cd frontend
npm run dev
```

The web interface will be available at `http://localhost:3000`

#### Start iOS App (Optional)

1. Open `iOS_homelab/iOS_homelab.xcodeproj` in Xcode
2. Update WebSocket URL in `ViewModels/WebSocketManager.swift` to your backend IP
3. Run on simulator or device

## 📖 Usage

### Adding Devices

1. Ensure your smart device is connected to the same network
2. The device will auto-announce via MQTT
3. Navigate to **Settings → Devices** in the web interface
4. Click **Add Device** and select from discovered devices
5. Assign the device to a room

### Controlling Devices

- **Web Dashboard**: Click on device cards to toggle on/off or adjust settings
- **iOS App**: Swipe or tap devices for quick control
- **WebSocket API**: Send JSON commands directly to `ws://backend:8000/ws`

### WebSocket Command Examples

**Turn on a device:**
```json
{
  "command": "turn_on",
  "device_ids": "shellyduorgbw-abc123"
}
```

**Set RGB color:**
```json
{
  "command": "set_color",
  "device_ids": ["shellyduorgbw-abc123"],
  "red": 255,
  "green": 0,
  "blue": 0
}
```

**Get all device data:**
```json
{
  "command": "get_all_data"
}
```

## 🔧 Configuration

### Environment Variables

#### Backend (`core/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./database.db` |
| `MQTT_BROKER` | MQTT broker IP address | `localhost` |
| `MQTT_PORT` | MQTT broker port | `1883` |

#### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Path to backend SQLite DB | `file:../core/database.db` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `ws://localhost:8000/ws` |

## 🛠️ Development

### Project Structure

```
homelab/
├── core/                      # Python FastAPI backend
│   ├── api/                   # REST API routes
│   ├── config/                # Configuration settings
│   ├── database/              # Database connection
│   ├── integration/           # Device integrations
│   │   ├── base_model.py     # Base device class
│   │   └── shelly/           # Shelly device implementations
│   ├── prisma/               # Prisma schema and migrations
│   ├── services/             # Core services
│   │   ├── mqtt/             # MQTT service
│   │   ├── state_machine/    # Device state management
│   │   └── websocket/        # WebSocket service
│   └── main.py               # Application entry point
│
├── frontend/                  # Next.js web application
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   └── db/               # Prisma client
│   └── prisma/               # Prisma schema (synced with backend)
│
└── iOS_homelab/              # iOS application
    └── iOS_homelab/
        ├── Models/           # Data models
        ├── View/             # SwiftUI views
        └── ViewModels/       # View models and WebSocket manager
```

### Adding New Device Integrations

HomeLab is designed to be easily extensible. To add support for a new device:

1. **Create device class** in `core/integration/{manufacturer}/{model}/`

```python
from integration.base_model import BaseDevice
from typing import Dict, Any

class NewDevice(BaseDevice):
    manufacturer = "manufacturer_name"
    device_type = "device_model"
    
    def __init__(self, device_id: str, **kwargs):
        self._device_id = device_id
        self._status = {}
    
    @property
    def device_id(self) -> str:
        return self._device_id
    
    def get_status(self) -> Dict[str, Any]:
        return self._status
    
    def update_status(self, status_data: Dict[str, Any]) -> bool:
        self._status.update(status_data)
        return True
```

2. **Implement control functions** (MQTT, HTTP, or other protocols)

3. **Update state machine** in `services/state_machine/device_state_machine.py` to handle device-specific MQTT topics

4. **Add WebSocket handlers** in `services/websocket/websocket_service.py`

5. **Create frontend components** in `frontend/src/components/customComponents/`

See `.github/copilot-instructions.md` for detailed development guidelines.

### Database Schema

The application uses Prisma ORM with SQLite. Key models:

- **Room** - Physical rooms containing devices
- **Entity** - Smart devices with status, config, and relationships

To modify the schema:

```bash
cd core
# Edit prisma/schema.prisma
prisma db push
# Copy changes to frontend/prisma/schema.prisma (keep generator as prisma-client-js)
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Ideas

- 🔌 Add support for new device manufacturers (Philips Hue, IKEA Tradfri, Zigbee, etc.)
- 🎨 Improve UI/UX design
- 📱 Enhance iOS app features
- 🧪 Add unit and integration tests
- 📚 Improve documentation
- 🌍 Add internationalization support
- 🔐 Implement authentication and multi-user support

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Home Assistant](https://www.home-assistant.io/)
- Built with [FastAPI](https://fastapi.tiangolo.com/), [Next.js](https://nextjs.org/), and [Prisma](https://www.prisma.io/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)

## 📧 Contact

**Mihail Brazdis** - [@mbrazdis](https://github.com/mbrazdis)

Project Link: [https://github.com/mbrazdis/homelab](https://github.com/mbrazdis/homelab)

---

⭐ If you find this project useful, please consider giving it a star!
