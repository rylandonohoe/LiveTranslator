from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs
import os

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

def create_voice_clone(name, file_path, description=None, remove_background_noise=False):
    try:
        with open(file_path, "rb") as audio_file:
            response = client.voices.add(
                name=name,
                files=[audio_file],
                remove_background_noise=remove_background_noise,
                description=description,
            )

            voice_id = str(str(response).split()[0].split('=')[1].strip("'"))
            requires_verification = bool(str(response).split()[1].split('=')[1])

            print(f"Voice clone created successfully!")
            print(f"Voice ID: {voice_id}")
            print(f"Requires Verification: {requires_verification}")
    except Exception as e:
        print(f"An error occurred while creating the voice clone: {e}")
    
    return voice_id, requires_verification

# Example usage
if __name__ == "__main__":
    create_voice_clone(
        name="Rylan",
        file_path="assets/audio/Rylan_audio_sample.mp3",
        description="Canadian 21-year-old male student.",
        remove_background_noise=True
    )
