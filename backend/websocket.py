import websockets
import asyncio
from pydub import AudioSegment
import threading
from process_audio import file_queue_processor, process_audio_into_file_queue

SAMPLE_RATE = 44100  # Ensure this matches the client-side AudioContext

SECONDS_PER_FILE = 15
SAMPLES_PER_FILE = SAMPLE_RATE * SECONDS_PER_FILE

NUM_CHANNELS = 1     # Mono audio
SAMPLE_WIDTH = 2     # 16-bit PCM


async def audio_handler(websocket):
    print("Client connected")
    chunks = []
    threading.Thread(target=file_queue_processor, daemon=True,
                     args=websocket).start()

    while True:
        try:
            message = await websocket.recv()
            audio_segment = AudioSegment(
                data=message,
                sample_width=4,
                frame_rate = SAMPLE_RATE,
                channels=1
            )
            processing_thread = threading.Thread(
                target=process_audio_into_file_queue, args=(audio_segment, chunks))
            processing_thread.start()
            processing_thread.join()

        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            break
    
    print("Client disconnected")


async def main():
    # Start the server
    async with websockets.serve(audio_handler, "localhost", 5000) as websocket:
        await asyncio.Future()

# start event loop
asyncio.run(main())
