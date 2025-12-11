from typing import Dict, Any, List
import logging
from integration.base_model import BaseDevice
import paho.mqtt.client as mqtt
from services.mqtt import mqtt_service
from integration.shelly.device_manager import load_devices, update_device_status
import json


logger = logging.getLogger(__name__)

class ShellyColorBulb(BaseDevice):
    """Implementation for Shelly Color Bulb devices"""
    
    manufacturer = "shelly"
    device_type = "duorgbw"
    
    def __init__(self, device_id: str, shelly_id: str = None, name: str = None, **kwargs):
        self._device_id = device_id
        self._shelly_id = shelly_id or device_id
        self._name = name or device_id
        self._status = {
            "ison": False,
            "mode": "color",
            "brightness": 100,
            "temp": 4750,
            "red": 255,
            "green": 255,
            "blue": 255,
            "gain": 100,
            "power": 0,
            "energy": 0,
            "online": False
        }
        self._status.update(kwargs)
        

    @property
    def device_id(self) -> str:
        return self._device_id
        
    @property
    def device_type(self) -> str:
        return self.__class__.device_type
        
    @property
    def manufacturer(self) -> str:
        return self.__class__.manufacturer
        

    def get_status(self) -> Dict[str, Any]:
        return self._status.copy()
        
    def update_status(self, status_data: Dict[str, Any]) -> bool:
        self._status.update(status_data)
        return True


async def turn_on(device_id: str) -> bool:
    """Turn on a device"""

    topic = f"shellies/{device_id}/color/0/command"
    payload = "on"
        

    result = await mqtt_service.safe_publish(topic, payload)
        
    return result.rc == mqtt.MQTT_ERR_SUCCESS

async def turn_off(device_id: str) -> bool:

    topic = f"shellies/{device_id}/color/0/command"
    payload = "off"

    mqtt_service.safe_publish(topic, payload)
        
async def turn_on_multiple(device_ids: List[str]) -> Dict[str, bool]:
    
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/command"
        payload = "on"
        mqtt_service.safe_publish(topic, payload)
        
    
async def turn_off_multiple(device_ids: List[str]) -> Dict[str, bool]:
    
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/command"
        payload = "off"
        mqtt_service.safe_publish(topic, payload)

async def set_color_mode(device_ids: List[str]) -> Dict[str, bool]:
    """Set the same color for multiple devices through the command queue"""
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/set"
        payload = json.dumps({
                "mode": "color",
                "red": "255",
                "green" : "0",
                "blue" : "0",
                "gain" : "100"                
            })
        mqtt_service.safe_publish(topic, payload)

async def set_color(device_ids: List[str], red, green, blue) -> Dict[str, bool]:
    """Set the same color for multiple devices through the command queue"""
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/set"
        payload = json.dumps({
                "mode": "color",
                "red": red,
                "green" : green,
                "blue" : blue,
                "gain" : "100"                
            })
        mqtt_service.safe_publish(topic, payload)

async def set_white_mode(device_ids: List[str]) -> Dict[str, bool]:
    """Set the same color for multiple devices through the command queue"""
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/set"
        payload = json.dumps({
                "mode": "white",
                "red": "255",
                "green" : "0",
                "blue" : "0",
                "gain" : "100"                
            })
        mqtt_service.safe_publish(topic, payload)
async def set_white_brightness(device_ids: List[str], brightness: int) -> Dict[str, bool]:
    """Set the same brightness for multiple devices through the command queue"""
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/set"
        payload = json.dumps({
                "mode": "white",
                "brightness": brightness,
                "gain" : "100"                
            })
        mqtt_service.safe_publish(topic, payload)

async def set_white_temperature(device_ids: List[str], temp: int) -> Dict[str, bool]:
    """Set the same color temperature for multiple devices"""
    for device_id in device_ids :
        topic = f"shellies/{device_id}/color/0/set"
        payload = json.dumps({
                "mode": "white",
                "temp": temp,
                "gain" : "100"                
            })
        mqtt_service.safe_publish(topic, payload)
