import asyncio
import base64
from dotenv import load_dotenv
import json
import os
import websockets

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

voice_id = "NNcatZob7g5UoSGj0rqf"
model_id = "eleven_multilingual_v2"

async def listen(api_websocket, frontend_websocket):
    while True:
        try:
            message = await api_websocket.recv()
            data = json.loads(message)
            if data.get("audio"):
                audio_chunk = base64.b64decode(data["audio"])
                await frontend_websocket.send(audio_chunk)
            elif data.get("isFinal"):
                break
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            break

async def text_to_speech_ws_streaming(voice_id, model_id):
    elevenlabs_uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id={model_id}"
    frontend_uri = "ws://localhost:5001"

    async with websockets.connect(elevenlabs_uri) as api_websocket, websockets.connect(frontend_uri) as frontend_websocket:
        await api_websocket.send(json.dumps({
            "text": " ",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0, "use_speaker_boost": True},
            "generation_config": {
                "chunk_length_schedule": [60, 60, 60, 60]
            },
            "xi_api_key": ELEVENLABS_API_KEY,
        }))

        text = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless journey, whispering secrets only the trees seemed privy to."
        await api_websocket.send(json.dumps({"text": text}))
        await api_websocket.send(json.dumps({"text": ""}))

        await listen(api_websocket, frontend_websocket)

asyncio.run(text_to_speech_ws_streaming(voice_id, model_id))
