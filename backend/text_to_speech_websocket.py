import asyncio
import base64
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import json
import os
import websockets

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

voice_id = "NNcatZob7g5UoSGj0rqf"
model_id = "eleven_multilingual_v2"

async def write_to_local(audio_stream):
    with open(f'./test.mp3', "wb") as f:
        async for chunk in audio_stream:
            if chunk:
                f.write(chunk)

async def listen(websocket):
    while True:
        try:
            message = await websocket.recv()
            data = json.loads(message)
            if data.get("audio"):
                yield base64.b64decode(data["audio"])
            elif data.get('isFinal'):
                break
        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            break

async def text_to_speech_ws_streaming(voice_id, model_id):
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id={model_id}"
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps({
            "text": " ",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0, "use_speaker_boost": True},
            "generation_config": {
                "chunk_length_schedule": [60, 60, 60, 60]
            },
            "xi_api_key": ELEVENLABS_API_KEY,
        }))
        text = "The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless journey, whispering secrets only the trees seemed privy to."
        await websocket.send(json.dumps({"text": text}))
        await websocket.send(json.dumps({"text": ""}))

        listen_task = asyncio.create_task(write_to_local(listen(websocket)))
        await listen_task

asyncio.run(text_to_speech_ws_streaming(voice_id, model_id))
