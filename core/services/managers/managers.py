from services.state_machine.device_state_machine import DeviceStateMachine
from services.websocket.websocket_service import WebSocketManager

state_machine = DeviceStateMachine()
connection_manager = WebSocketManager(state_machine)