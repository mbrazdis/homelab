import uvicorn
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from contextlib import asynccontextmanager
from database import connect_db, disconnect_db
from services.mqtt.mqtt_service import start_mqtt, state_machine, configure_mqtt
from services.websocket.websocket_service import WebSocketManager
from api.routes import router
import traceback
import logging
from services.state_machine.device_state_machine import DeviceStateMachine
from integration.shelly.duorgbw.control import turn_off
logger = logging.getLogger(__name__)

state_machine = DeviceStateMachine()
websocket_manager = WebSocketManager(state_machine)

configure_mqtt(state_machine, websocket_manager)

app = FastAPI()

async def start_background_tasks(app):
    app.state.device_task = asyncio.create_task(state_machine.process_new_devices())
    app.state.websocket_task = asyncio.create_task(websocket_manager.broadcast_status())
    for task in [app.state.device_task, app.state.websocket_task]:
        task.add_done_callback(lambda t: print(
            f"Task {t} finished with exception:  {t.exception()}") if t.exception() else None)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionează ciclul de viață al aplicației."""
    await connect_db()
    await state_machine.initialize_cache()
    
    await start_background_tasks(app)
    start_mqtt()
    
    yield
    
    if hasattr(app.state, 'device_task'):
        app.state.device_task.cancel()
    if hasattr(app.state, 'websocket_task'):
        app.state.websocket_task.cancel()
    state_machine.clear_new_devices()
    
    await disconnect_db()

app = FastAPI(lifespan=lifespan)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint pentru conexiunile WebSocket."""
    await websocket_manager.connect(websocket)
    try:
        while True:
            message = await websocket.receive_json()
            await websocket_manager.process_message(websocket, message)
    except WebSocketDisconnect:
        await websocket_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        traceback.print_exc()
        await websocket_manager.disconnect(websocket)

app.include_router(router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(
                "main:app", 
                host="0.0.0.0", 
                port=8000, 
                reload=True,
                )