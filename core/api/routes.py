from fastapi import APIRouter, HTTPException
from database import db
from integration.shelly.device_manager import add_device_to_db
from typing import Dict, Any

router = APIRouter()

@router.get("/devices")
async def get_devices():
    return await db.device.find_many()

@router.post("/devices")
async def add_device(name: str, type: str):
    return await db.device.create(data={"name": name, "type": type})

@router.post("/devices/add")
async def add_device(device_data: Dict[str, Any]):
    """
    Endpoint pentru adăugarea unui dispozitiv în baza de date.
    :param device_data: Datele dispozitivului trimise de frontend.
    """
    try:
        await add_device_to_db(device_data)
        return {"message": "Device added successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add device: {e}")
