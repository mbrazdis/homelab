import paho.mqtt.client as mqtt
from config.settings import MQTT_BROKER, MQTT_PORT
import json
from threading import Lock
import asyncio
import traceback
from services.state_machine.device_state_machine import DeviceStateMachine

client = mqtt.Client()
new_devices_cache = {}
cache_lock = Lock()

state_machine = None
connection_manager = None

def configure_mqtt(state_machine_instance, connection_manager_instance):
    global state_machine, connection_manager
    state_machine = state_machine_instance
    connection_manager = connection_manager_instance

event_loop = None

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"Connected to MQTT Broker at {MQTT_BROKER}:{MQTT_PORT} with result code {rc}")
        client.subscribe("shellies/#")  
    else:
        print(f"Failed to connect to MQTT Broker with result code {rc}")

def on_message(client, userdata, msg):
    try:
        payload = msg.payload.decode()
        print(f"MQTT message received on topic {msg.topic}: {payload}")

        state_machine.handle_message(msg.topic, payload)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

def on_disconnect(client, userdata, rc):
    if rc != 0:
        print(f"Unexpected disconnection from MQTT broker with result code {rc}")
        try:
            client.reconnect()
        except Exception as e:
            print(f"Failed to reconnect to MQTT broker: {e}")

def start_mqtt():
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

def safe_publish(topic: str, payload: str):
    try:
        print(f"Publishing to MQTT topic: {topic}, payload: {payload}")
        result = client.publish(topic, payload)
        print(f"Publish result: {result.rc}")
        return result
    except Exception as e:
        print(f"Error in safe_publish: {e}")
        return None

