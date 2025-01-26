import asyncio
from text_to_speech import handle_tts_request
from models.translate_request_model import TranslateRequestModel
import os
from pydub import AudioSegment
import queue
import time
from transcription import transcribe_audio
from translator import translate

file_q = queue.Queue()
grp = 0
RMS_THRESHOLD = 300
CHUNK_THRESHOLD = 60

def process_audio_into_file_queue(wav_segment: AudioSegment, audioChunks: list):
    global grp
    if len(audioChunks) < 2:
        audioChunks.append(wav_segment)
        return

    if len(audioChunks) > CHUNK_THRESHOLD:
        #print("threshold reached")

        # combine each item in the audio chunk and export into a .wav file
        combined_sounds = audioChunks[0]
        for item in audioChunks[1:]:
            combined_sounds = combined_sounds + item
        file_path = f"audio-{grp}.wav"
        combined_sounds.export(file_path, format="wav")

        # add the file to process in the queue thread
        request = TranslateRequestModel(file_path)
        file_q.put(request)
        audioChunks.clear()
        grp += 1
    else:
        #print("The audio is not silent, process it")

        audioChunks.append(wav_segment)

def file_queue_processor(websocket):
    """
    Threaded process that keeps waiting for data to be pushed into the file queue it will
    process each item sequentially and transform it before sending back to the client.
    """
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    loop.run_until_complete(_worker(websocket))
    loop.close()


async def _worker(websocket):
    """
    Threaded worker to process the audio file queue transcribe
    it through the Whisper Model and send it back to client.
    """
    while True:
        try:
            if not file_q.empty():
                # each item in the queue is an instance of FileTranslateRequestModel
                translate_request = file_q.get()
                #print("found file: " + translate_request.path)

                start_time = time.time()
                transcription = transcribe_audio(file_input=translate_request.path,
                                                 language=translate_request.from_lang)
                print(f"[O] {transcription}")
                end_time = time.time()
                transcription_time = end_time - start_time

                # delete the file after processing to save space
                os.remove(translate_request.path)

                if transcription:
                    # if language_from and language_to is the same, its just a transcription
                    if translate_request.from_lang == translate_request.to_lang:
                        await handle_tts_request(websocket, transcription, "NNcatZob7g5UoSGj0rqf")

                    start_time = time.time()
                    translation = translate(transcription, translate_request.to_lang)
                    print(f"[T] {translation}")
                    end_time = time.time()
                    translation_time = end_time - start_time

                    await handle_tts_request(websocket, translation, "NNcatZob7g5UoSGj0rqf")

                file_q.task_done()

        except Exception as e:
            print("ERROR BRO - _worker()")
            file_q.task_done()
            print(e)
            # break
