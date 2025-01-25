import os
import time
import requests
from elevenlabs import ElevenLabs
from dotenv import load_dotenv

load_dotenv()

class DubbingAPI:
    def __init__(self):
        self.client = ElevenLabs(api_key=os.getenv("API_KEY"))
        self.api_key = os.getenv("API_KEY")

    def dub_audio_or_video(
        self,
        target_lang,
        file_path=None,
        name=None,
        source_url=None,
        source_lang="auto",
        num_speakers=0,
        watermark=False,
        start_time=None,
        end_time=None,
        highest_resolution=False,
        drop_background_audio=False,
        use_profanity_filter=False,
    ):
        try:
            if file_path:
                with open(file_path, "rb") as file:
                    response = self.client.dubbing.dub_a_video_or_an_audio_file(
                        target_lang=target_lang,
                        file=file,
                        name=name,
                        source_url=source_url,
                        source_lang=source_lang,
                        num_speakers=num_speakers,
                        watermark=watermark,
                        start_time=start_time,
                        end_time=end_time,
                        highest_resolution=highest_resolution,
                        drop_background_audio=drop_background_audio,
                        use_profanity_filter=use_profanity_filter,
                    )
                    return response
            else:
                print("No file provided for dubbing.")
                return None

        except Exception as e:
            print(f"Error: {e}")
            return None

    def get_dubbing_status(self, dubbing_id):
        try:
            url = f"https://api.elevenlabs.io/v1/dubbing/{dubbing_id}"
            headers = {"xi-api-key": self.api_key}

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            return response.json()  
        except requests.exceptions.RequestException as e:
            print(f"Error checking dubbing status: {e}")
            return None

    def get_dubbed_audio(self, dubbing_id, language_code):
        try:
            url = f"https://api.elevenlabs.io/v1/dubbing/{dubbing_id}/audio/{language_code}"
            headers = {"xi-api-key": self.api_key}

            response = requests.get(url, headers=headers)
            response.raise_for_status()

            return response.content  
        except requests.exceptions.RequestException as e:
            print(f"Error retrieving dubbed audio: {e}")
            return None


def main():
    dubbing_api = DubbingAPI()

    file_path = "./videoplayback.mp4" 
    target_lang = "es"  # spanish

    # Submit the dubbing request
    response = dubbing_api.dub_audio_or_video(
        target_lang=target_lang,
        file_path=file_path,
        name="Sample Dubbing Project",
        watermark=True,
        highest_resolution=False
    )

    if response:
        dubbing_id = response.dubbing_id
        expected_duration_sec = response.expected_duration_sec
        print(f"Dubbing ID: {dubbing_id}")
        print(f"Expected Duration (s): {expected_duration_sec}")

        # Check dubbing status before retrieving audio
        while True:
            status = dubbing_api.get_dubbing_status(dubbing_id)
            print(status)
            if status and status.get("status") == "dubbed":
                print("Dubbing complete, retrieving dubbed audio...")

                # Retrieve the dubbed audio
                dubbed_audio = dubbing_api.get_dubbed_audio(dubbing_id, target_lang)
                if dubbed_audio:
                    output_path = f"./dubbed_audio_spanish.mp3"
                    with open(output_path, "wb") as audio_file:
                        audio_file.write(dubbed_audio)
                    print(f"Dubbed audio saved to {output_path}")
                else:
                    print("Failed to retrieve dubbed audio.")
                break  
            else:
                print("Dubbing not completed yet, retrying in 5 seconds...")
                time.sleep(5)  

    else:
        print("Dubbing Request Failed.")


if __name__ == "__main__":
    main()
