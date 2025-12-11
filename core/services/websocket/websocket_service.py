from fastapi import WebSocket
from typing import List, Dict, Any
import logging
import asyncio
from services.state_machine.device_state_machine import DeviceStateMachine
import traceback
from integration.shelly.duorgbw.control import (
    turn_on,
    turn_off,
    turn_on_multiple,
    turn_off_multiple,
    set_color_mode,
    set_white_mode,
    set_color,
    set_white_brightness,
    set_white_temperature,
)
logger = logging.getLogger(__name__)


class WebSocketManager:
    def __init__(self, state_machine):
        self.active_connections: List[WebSocket] = []
        self.state_machine = state_machine
        self.command_handlers = {
            "get_all_data": self.handle_get_all_data,
            "turn_on": self.handle_turn_on,
            "turn_off": self.handle_turn_off,
            "turn_on_multiple": self.handle_turn_on_multiple,
            "turn_off_multiple": self.handle_turn_off_multiple,
            "set_color_mode": self.handle_set_color_mode,
            "set_white_mode": self.handle_set_white_mode,
            "set_color": self.handle_set_color,
            "set_white_temperature": self.handle_set_temperature,
            "set_white_brightness": self.handle_set_brightness,
        }

    async def connect(self, websocket: WebSocket):
        """Adaugă un client nou la lista de conexiuni active."""
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"New WebSocket connection. Total connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        """Elimină un client deconectat din lista de conexiuni active."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def send_all_data(self, websocket: WebSocket):
        """Trimite toate datele (dispozitive și camere) către un client WebSocket."""
        try:
            if not isinstance(websocket, WebSocket):
                raise TypeError("Expected a WebSocket object, but got a different type.")

            all_devices = await self.state_machine.get_all_devices()
            all_rooms = await self.state_machine.get_rooms_data()

            all_data = {
                "devices": all_devices,
                "rooms": all_rooms,
            }

            await websocket.send_json({"status": "success", "data": all_data})
            print(f"Sent all data (devices and rooms) to WebSocket client.")
        except Exception as e:
            logger.error(f"Error sending all data to WebSocket: {e}")
            traceback.print_exc()
            if isinstance(websocket, WebSocket):
                await websocket.send_json({"status": "error", "message": str(e)})

    async def broadcast_status(self):
        """Trimite periodic statusul dispozitivelor către toți clienții conectați."""
        print("Starting WebSocket broadcast task")
        while True:
            try:
                print("Getting all devices for WebSocket broadcast")
                all_data = await self.state_machine.get_all_devices()
                print(f"Broadcasting data to {len(self.active_connections)} WebSocket connections")
                for websocket in self.active_connections:
                    try:
                        await websocket.send_json(all_data)
                    except Exception as e:
                        print(f"Error sending device status to WebSocket: {e}")
                        try:
                            await websocket.send_json({"ping": "test"})
                        except:
                            print("WebSocket connection is closed, removing from active connections")
                            if websocket in self.active_connections:
                                self.active_connections.remove(websocket)
                print("Finished WebSocket broadcast, sleeping for 5 seconds")
                await asyncio.sleep(5)
            except Exception as e:
                print(f"Error during periodic broadcast: {e}")
                traceback.print_exc()

    async def broadcast_new_device(self, device: Dict[str, Any]):
        """Trimite un dispozitiv nou către toți clienții conectați"""
        logger.info(f"Broadcasting new device: {device}")
        for websocket in self.active_connections:
            try:
                await websocket.send_json({"tag": "newdevice", "device": device})
                logger.info(f"Device sent to WebSocket client: {device}")
            except Exception as e:
                logger.error(f"Failed to send new device to WebSocket: {e}")

    async def process_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Procesează un mesaj primit de la un client WebSocket."""
        try:
            command = message.get("command")
            if not command:
                await websocket.send_json({"status": "error", "message": "No command specified"})
                return

            handler = self.command_handlers.get(command)
            if not handler:
                await websocket.send_json({"status": "error", "message": f"Unknown command: {command}"})
                return
            result = await handler(websocket, message)
            if result:
                await websocket.send_json(result)
        except Exception as e:
            logger.error(f"Error processing WebSocket message: {e}")
            traceback.print_exc()
            await websocket.send_json({"status": "error", "message": str(e)})
    async def handle_turn_on(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        result = await turn_on(device_id)
        return {"status": "success" if result else "error", "device_id": device_id, "command": "turn_on"}

    async def handle_turn_off(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        result = await turn_off(device_id)
        return {"status": "success" if result else "error", "device_id": device_id, "command": "turn_off"}
    
    async def handle_turn_on_multiple(self, websocket: WebSocket, message: Dict[str, Any]):
        device_ids = message.get("device_ids")
        if not device_ids or not isinstance(device_ids, list):
            return {"status": "error", "message": "No device_ids specified or invalid format"}

        result = await turn_on_multiple(device_ids)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "turn_on_multiple"}
    
    async def handle_turn_off_multiple(self, websocket: WebSocket, message: Dict[str, Any]):
        device_ids = message.get("device_ids")
        if not device_ids or not isinstance(device_ids, list):
            return {"status": "error", "message": "No device_ids specified or invalid format"}

        result = await turn_off_multiple(device_ids)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "turn_off_multiple"}

    async def handle_set_color_mode(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        device_ids = message.get("device_ids", [device_id])


        result = await set_color_mode(device_ids)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "set_color_mode"}
    
    async def handle_set_white_mode(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        device_ids = message.get("device_ids", [device_id])


        result = await set_white_mode(device_ids)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "set_white_mode"}

    async def handle_set_color(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        device_ids = message.get("device_ids", [device_id])
        red = message.get("red", 255)
        green = message.get("green", 255)
        blue = message.get("blue", 255)
        gain = 100

        result = await set_color(device_ids, red, green, blue)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "set_color"}

    async def handle_set_temperature(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        device_ids = message.get("device_ids", [device_id])
        temp = message.get("temp", 4750)

        result = await set_white_temperature(device_ids, temp)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "set_temperature"}

    async def handle_set_brightness(self, websocket: WebSocket, message: Dict[str, Any]):
        device_id = message.get("device_ids")
        if not device_id:
            return {"status": "error", "message": "No device_id specified"}

        device_ids = message.get("device_ids", [device_id])
        brightness = message.get("brightness", 100)

        result = await set_white_brightness(device_ids, brightness)
        return {"status": "success", "device_ids": device_ids, "result": result, "command": "set_white_brightness"}
    
    async def handle_get_all_data(self, websocket: WebSocket, message: Dict[str, Any]):
        """Gestionează comanda 'get_all_data' și trimite toate datele către client."""
        try:
            await self.send_all_data(websocket)
            return {"status": "success", "message": "All data sent successfully"}
        except Exception as e:
            logger.error(f"Error handling 'get_all_data': {e}")
            traceback.print_exc()
            return {"status": "error", "message": str(e)}