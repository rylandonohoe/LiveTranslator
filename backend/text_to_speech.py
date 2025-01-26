from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def text_to_speech(voice_name, text, output_format="mp3_44100_128", model_id="eleven_multilingual_v2"):    
    voices = client.voices.get_all()
    
    for voice in voices.voices:
        if voice.name == voice_name:
            voice_id = voice.voice_id
    
    audio_data = client.text_to_speech.convert(
        voice_id=voice_id,
        output_format=output_format,
        text=text,
        model_id=model_id,
    )

    output_file = f"{voice_name}_audio.mp3"
    with open(output_file, "wb") as file:
        for chunk in audio_data:
            file.write(chunk)
        
    print(f"Audio saved successfully.")

if __name__ == "__main__":
    text_to_speech(
        voice_name="Rylan",
        text="The twilight sun cast its warm golden hues upon the vast rolling fields, saturating the landscape with an ethereal glow. Silently, the meandering brook continued its ceaseless journey, whispering secrets only the trees seemed privy to."
        )
