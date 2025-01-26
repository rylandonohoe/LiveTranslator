from dotenv import load_dotenv
from openai import OpenAI
import os

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def transcribe_audio(file_input, language="en"):
    """
    Transcribe the audio file and return the text audio_language needs to be in ISO 639-1 format.
    Ref: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    """
    audio_file = open(file_input, "rb")

    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language=language,
    )

    return transcription.text
