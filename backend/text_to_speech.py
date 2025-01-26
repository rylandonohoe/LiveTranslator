import base64
#from dotenv import load_dotenv
import json
import os
import websockets

from env import ELEVENLABS_API_KEY

#load_dotenv()
#ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

async def listen_and_forward(frontend_websocket, api_websocket):
    """Listen to ElevenLabs API and forward audio chunks to the frontend."""
    while True:
        try:
            # receive data from the ElevenLabs WebSocket
            message = await api_websocket.recv()
            data = json.loads(message)

            if data.get("audio"):
                # decode audio chunk and send to frontend
                audio_chunk = base64.b64decode(data["audio"])
                await frontend_websocket.send(audio_chunk)
                #print("[INFO] Sent audio chunk to frontend.")
            elif data.get("isFinal"):
                #print("[INFO] Final audio chunk received. Processing complete.")
                break
        except websockets.exceptions.ConnectionClosed:
            print("[WARNING] Connection to ElevenLabs API WebSocket closed.")
            break
        except Exception as e:
            print(f"[ERROR] Error during listen_and_forward: {e}")
            break

async def handle_tts_request(frontend_websocket, text, voice_id, model_id="eleven_multilingual_v2"):
    """Process text-to-speech for the given text and voice ID."""
    elevenlabs_uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream-input?model_id={model_id}"

    #print(f"[INFO] Connecting to ElevenLabs API WebSocket: {elevenlabs_uri}")
    try:
        async with websockets.connect(elevenlabs_uri) as api_websocket:
            #print("[INFO] Connected to ElevenLabs API WebSocket.")

            # send initial configuration to ElevenLabs API
            await api_websocket.send(json.dumps({
                "text": " ", # initialize API connection
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0, "use_speaker_boost": True},
                "generation_config": {
                    "chunk_length_schedule": [60, 60, 60, 60]
                },
                "xi_api_key": ELEVENLABS_API_KEY,
            }))
            #print("[INFO] Sent initialization message to ElevenLabs API.")

            # send the actual text for TTS processing
            #print(f"[INFO] Sending text for TTS processing: {text}")
            await api_websocket.send(json.dumps({"text": text}))
            await api_websocket.send(json.dumps({"text": ""})) # signal end of input text

            # forward audio chunks incrementally to the frontend
            await listen_and_forward(frontend_websocket, api_websocket)
    except Exception as e:
        print(f"[ERROR] Error processing TTS request: {e}")
