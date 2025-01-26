import websockets
import asyncio
import numpy as np
import base64
import scipy.io.wavfile as wav
import os
import json
import wave
from pydub import AudioSegment

SAMPLE_RATE = 44100  # Ensure this matches the client-side AudioContext
SECONDS_PER_FILE = 15
SAMPLES_PER_FILE = SAMPLE_RATE * SECONDS_PER_FILE


NUM_CHANNELS = 1     # Mono audio
SAMPLE_WIDTH = 2     # 16-bit PCM


async def audio_handler(websocket):
    print("Client connected")
    audio_buffer = np.array([], dtype=np.int16)
      # To keep track of the number of files saved
    file_count = 0
    while True:
        try:
            message = await websocket.recv()
            audio_segment = AudioSegment(
                data=message,
                sample_width=4,
                frame_rate = SAMPLE_RATE,
                channels=1
            )
            audio_segment.export(f"output_audio{file_count}.wav", format="wav")
            print("made audio")
            file_count += 1
            if file_count > 40:
                concatenate_audio(file_count)
                break

        except websockets.exceptions.ConnectionClosed:
            print("Connection closed")
            break
      

    print("Client disconnected")

def concatenate_audio(file_count):
    clips = []
    for index in range(file_count):
        clip = AudioSegment.from_file(f"output_audio{index}.wav")
        os.remove(f"output_audio{index}.wav")
        clips.append(clip)
    final_clip = clips[0]
    for i in range(1, len(clips)):
        final_clip = final_clip + clips[i]
    final_clip.export("final_clip.wav", format = "wav")


async def main():
    # Start the server
    async with websockets.serve(audio_handler, "localhost", 5000) as websocket:
        await asyncio.Future()

asyncio.run(main())
