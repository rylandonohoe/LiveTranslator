import websockets
import asyncio
import numpy as np
import speech_recognition as sr
import io

SAMPLE_RATE = 44100  # Ensure this matches the client-side AudioContext

async def audio_handler(websocket):
    print("Client connected")
    audio_buffer = np.array([], dtype=np.float32)
    recognizer = sr.Recognizer()

    async for message in websocket:
        # Convert the received WebSocket message into a numpy array (assuming it's a byte buffer)
        print("received")
        audio_frame = np.frombuffer(message, dtype=np.float32)
        audio_buffer = np.append(audio_buffer, audio_frame)

        if len(audio_buffer) > SAMPLE_RATE:  # Process 1 second of audio
            # Convert audio buffer to byte format suitable for speech recognition
            audio_data = audio_buffer[:SAMPLE_RATE].tobytes()
            audio_buffer = audio_buffer[SAMPLE_RATE:]

            # Use the in-memory audio data with speech_recognition
            audio_file = io.BytesIO(audio_data)
            # with sr.AudioFile(audio_file) as source:
            #     audio = recognizer.record(source)
            #     try:
            #         transcription = recognizer.recognize_google(audio)
            #         print("Transcription:", transcription)
            #         await websocket.send(transcription)  # Send the transcription back to the client
            #     except sr.UnknownValueError:
            #         print("Could not understand audio")
            #     except sr.RequestError as e:
            #         print(f"API error: {e}")

    print("Client disconnected")

async def main():
    # Start the server
    start_server = await websockets.serve(audio_handler, "localhost", 5000)
    print("Server started at ws://localhost:5000")
    
    # Run the server until manually interrupted
    await start_server.wait_closed()

# Start the event loop
asyncio.run(main())
