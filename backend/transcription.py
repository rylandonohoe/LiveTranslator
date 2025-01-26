#from dotenv import load_dotenv
from openai import OpenAI
import os
from env import OPENAI_API_KEY
from math import exp
from statistics import fmean

#load_dotenv()
#OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

CONFIDENCE_THRESHOLD = .4

def transcribe_audio(file_input, language="en"):
    """
    Transcribe the audio file and return the text audio_language needs to be in ISO 639-1 format.
    Ref: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
    """
    audio_file = open(file_input, "rb")

    transcription = client.audio.transcriptions.create(
        model="whisper-1",
        file=audio_file,
        response_format='verbose_json',
        #language=language,
    )
    confidence = 0
    segment_conf_list = []
    for element in transcription.segments:
        segment_conf_list.append(exp(element.avg_logprob))
    if segment_conf_list:
        confidence = fmean(segment_conf_list)
    print(confidence)
    if confidence < CONFIDENCE_THRESHOLD:
        return ""
    return transcription.text
