import requests

url = "http://localhost:8000/translate"
headers = {"Content-Type": "application/json"}

data = {
    "text": "Hello, how are you?",
    "to": "fr"
}

response = requests.post(url, json=data, headers=headers)
ans = response.json()
print(ans['translatedText'])


