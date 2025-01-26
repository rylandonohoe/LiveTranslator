from google.cloud import speech
from playsound import playsound

def transcribe_streaming(stream_file: str) -> speech.RecognitionConfig:
    """
    Streams transcription of the given audio file using Google Cloud Speech-to-Text API.
    Args:
        stream_file (str): Path to the local audio file to be transcribed.
        Example: "resources/audio.raw"
    """
    client = speech.SpeechClient()

    with open(stream_file, "rb") as audio_file:
        audio_content = audio_file.read()

    # in practice, stream should be a generator yielding chunks of audio data
    stream = [audio_content]

    requests = (
        speech.StreamingRecognizeRequest(audio_content=chunk) for chunk in stream
    )

    config = speech.RecognitionConfig(
        #encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        encoding=speech.RecognitionConfig.AudioEncoding.FLAC,
        sample_rate_hertz=44100,
        language_code="en-US",
    )

    """config = speech.RecognitionConfig(
        language_code="en",
    )"""

    streaming_config = speech.StreamingRecognitionConfig(config=config)
    responses = client.streaming_recognize( # streaming_recognize returns a generator
        config=streaming_config,
        requests=requests,
    )

    for response in responses:
        # once the transcription has settled, the first result will contain the is_final
        # result. The other results will be for subsequent portions of the audio.
        for result in response.results:
            print(f"Finished: {result.is_final}")
            print(f"Stability: {result.stability}")
            alternatives = result.alternatives
            
            # the alternatives are ordered from most likely to least
            for alternative in alternatives:
                print(f"Confidence: {alternative.confidence}")
                print(f"Transcript: {alternative.transcript}")


transcribe_streaming("/Users/tkdavis/Coding/Hackathons/McHacks12/LiveTranslator/backend/pumpkin_FL.flac")
#playsound("/Users/tkdavis/Coding/Hackathons/McHacks12/LiveTranslator/backend/pumpkin_FL.flac")
