import json
import os
import logging
import time
from prisma import Prisma
from typing import Dict, Any

DEVICES_FILE = "devices.json"
db = Prisma() 

async def load_devices(device_type=None, manufacturer=None):
    """
    Load devices from the database filtered by type and manufacturer.
    :param device_type: The type of device to filter (e.g., 'bulb', 'plug').
    :param manufacturer: The manufacturer to filter by.
    :return: A list of devices matching the criteria.
    """
    await db.connect()
    filters = {}
    if device_type:
        filters["type"] = device_type
    if manufacturer:
        filters["manufacturer"] = manufacturer

    devices = await db.entity.find_many(where=filters)
    await db.disconnect()
    return devices


async def update_device_status(device_id, status_details):
    """
    Update the status of a specific device in the database.
    :param device_id: The ID of the device to update.
    :param status_details: A dictionary containing the new status details.
    """
    await db.connect()
    device = await db.entity.find_unique(where={"id": device_id})
    if not device:
        await db.disconnect()
        raise ValueError(f"Device with ID {device_id} not found.")


    current_status = json.loads(device.status or "{}")
    current_status.update(status_details)

    await db.entity.update(
        where={"id": device_id},
        data={"status": json.dumps(current_status)}
    )
    await db.disconnect()


async def add_device_to_db(device_data: Dict[str, Any]):
    """
    Adaugă un dispozitiv nou în baza de date.
    :param device_data: Datele dispozitivului (id, model, etc.)
    """
    await db.connect()
    try:
        await db.entity.create(
            data={
                "id": device_data["id"],
                "name": device_data["id"],  
                "type": "light" if device_data["model"] == "SHCB-1" else "outlet",  
                "manufacturer": device_data["manufacturer"],
                "model": device_data["model"],
                "status": json.dumps({"ison": False}), 
                "config": json.dumps({}), 
            }
        )
    finally:
        await db.disconnect()