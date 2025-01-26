from openai import OpenAI
from env import OPENAI_API_KEY

client = OpenAI(
    api_key=OPENAI_API_KEY
)


def transcribe_audio(file_input, language="en"):
    """
    transcribe the audio file and return the text
    audio_language needs to be in ISO 639-1 format. ref: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    """

    audio_file = open(file_input, "rb")

    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        language=language,
    )

    return transcription.text

