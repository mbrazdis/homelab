import asyncio
import json
from typing import Dict, Any
from threading import Lock
import traceback
from database import db  # Conexiunea la baza de date

class DeviceStateMachine:
    def __init__(self):
        self.devices: Dict[str, Dict[str, Any]] = {}  
        self.new_devices: Dict[str, Dict[str, Any]] = {}  
        self.rooms: Dict[str, Dict[str, Any]] = {} 
        self.lock = Lock()

    async def initialize_cache(self):
        """Încarcă dispozitivele din baza de date în cache."""
        devices = await db.entity.find_many()
        with self.lock:
            for device in devices:
                self.devices[device.id] = {
                    "id": device.id,
                    "name": device.name,
                    "type": device.type,
                    "status": json.loads(device.status) if device.status else {},
                }
        print(f"Cache initialized with {len(self.devices)} devices.")

    async def get_rooms_data(self):
        """Returnează datele despre camerele din baza de date, inclusiv dispozitivele asociate."""
        try:

            rooms = await db.room.find_many(
                include={
                    "entities": True 
                }
            )

            # Actualizează cache-ul camerelor
            with self.lock:
                self.rooms = {
                    room.id: {
                        "id": room.id,
                        "name": room.name,
                        "status": json.loads(room.status) if room.status else {},
                        "image": room.image,
                        "entities": [
                            {
                                "id": entity.id,
                                "name": entity.name,
                                "type": entity.type,
                                "manufacturer": entity.manufacturer,
                                "model": entity.model,
                                "status": json.loads(entity.status) if entity.status else {},
                                "config": json.loads(entity.config) if entity.config else {},
                                "lastUpdated": entity.lastUpdated.isoformat() if entity.lastUpdated else None,
                            }
                            for entity in room.entities
                        ],
                    }
                    for room in rooms
                }

            print(f"Cache updated with {len(self.rooms)} rooms.")
            return self.rooms

        except Exception as e:
            print(f"Error fetching rooms data: {e}")
            return {}

    def clear_new_devices(self):
        """Golește cache-ul de dispozitive noi."""
        with self.lock:
            self.new_devices.clear()
        print("New devices cache cleared.")

    def handle_message(self, topic: str, payload: str):
        """Procesează mesajele primite de la MQTT și actualizează cache-ul."""
        try:
            if "announce" in topic:
                payload_json = json.loads(payload)
                device_id = payload_json.get("id")
                if device_id:
                    self.add_new_device(payload_json)
                    return

            device_id = topic.split("/")[1] if len(topic.split("/")) > 1 else None
            
            if not device_id:
                print(f"Could not extract device ID from topic: {topic}")
                return

            try:
                payload_json = json.loads(payload)
                if isinstance(payload_json, dict):
                    with self.lock:
                        if device_id in self.devices:
                            self.devices[device_id]["status"].update(payload_json)
                            print(f"Updated status for device {device_id}: {payload_json}")
                        else:
                            print(f"Device {device_id} not found in cache.")
                else:
                    self.handle_simple_value(device_id, topic, payload_json)
            except json.JSONDecodeError:
                self.handle_non_json_value(device_id, topic, payload)
        except Exception as e:
            print(f"Error handling message for topic {topic}: {e}")

    def handle_simple_value(self, device_id: str, topic: str, value: Any):
        """Procesează valori simple (numere, boolean) pentru un dispozitiv."""
        with self.lock:
            if device_id in self.devices:
                topic_name = topic.split("/")[-1]  
                self.devices[device_id]["status"][topic_name] = value
                print(f"Updated simple value for device {device_id}: {topic_name}={value}")
            else:
                print(f"Device {device_id} not found in cache for simple value: {topic}={value}")

    def handle_non_json_value(self, device_id: str, topic: str, value: str):
        """Procesează valori non-JSON (text simplu) pentru un dispozitiv."""
        with self.lock:
            if device_id in self.devices:
                topic_name = topic.split("/")[-1]
                if value.lower() == "on":
                    converted_value = True
                elif value.lower() == "off":
                    converted_value = False
                elif value.lower() in ["true", "false"]:
                    converted_value = value.lower() == "true"
                else:
                    converted_value = value
                    
                self.devices[device_id]["status"][topic_name] = converted_value
                print(f"Updated non-JSON value for device {device_id}: {topic_name}={converted_value}")
            else:
                print(f"Device {device_id} not found in cache for non-JSON value: {topic}={value}")

    async def get_all_devices(self) -> Dict[str, Dict[str, Any]]:
        """Returnează toate dispozitivele din cache."""
        with self.lock:
            result = {
                "devices": self.devices,
                "new_devices": self.new_devices
            }
            return result
        
    def add_new_device(self, device_data: Dict[str, Any]):
        """Adaugă un dispozitiv nou în cache-ul de dispozitive noi."""
        device_id = device_data.get("id")
        if not device_id:
            print("Device ID is missing in announce message.")
            return

        with self.lock:
            if device_id not in self.devices and device_id not in self.new_devices:
                self.new_devices[device_id] = {
                    "id": device_id,
                    "name": device_data.get("id"),
                    "type": device_data.get("model", "unknown"),
                    "ip": device_data.get("ip"),
                    "mac": device_data.get("mac"),
                    "fw_ver": device_data.get("fw_ver"),
                    "new_fw": device_data.get("new_fw"),
                }
                print(f"New device added to new_devices cache: {device_id}")
            else:
                print(f"Device {device_id} already exists in cache.")

    async def process_new_devices(self):
        """Verifică periodic dacă dispozitivele noi există în baza de date."""
        print("Starting process_new_devices task")
        while True:
            try:
                print("Checking for new devices in database")
                async with asyncio.Lock():  
                    for device_id in list(self.new_devices.keys()):
                        print(f"Checking device {device_id} in database")
                        device = await db.entity.find_unique(where={"id": device_id})
                        print(f"Database check result for {device_id}: {'Found' if device else 'Not found'}")
                        if device:
                            self.devices[device_id] = {
                                "id": device.id,
                                "name": device.name,
                                "type": device.type,
                                "status": json.loads(device.status) if device.status else {},
                            }
                            print(f"Device {device_id} moved from new_devices to devices cache.")
                            del self.new_devices[device_id]
                print("Finished checking for new devices, sleeping for 5 seconds")
                await asyncio.sleep(5) 
            except Exception as e:
                print(f"Error processing new devices: {e}")
                traceback.print_exc() 

    from prisma import Prisma


   