import requests

url = "http://localhost:8000/translate"
headers = {"Content-Type": "application/json"}

def translate(text, to):
    data = {
        "text": text,
        "to": to
    }
    response = requests.post(url, json=data, headers=headers)
    ans = response.json()
    print(ans['translatedText'])
    return ans['translatedText']
