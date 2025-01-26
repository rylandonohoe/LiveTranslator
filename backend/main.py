from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Create an instance of the FastAPI app
app = FastAPI()

origins = [
    "http://localhost:3000",  # Update this with the URL of your frontend
    "http://127.0.0.1:3000",  # Or any other origins you want to allow
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of allowed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers (including Content-Type)
)


class UpdateLangRequest(BaseModel):
    lang: str


CURRENT_LANG = "fr"


@app.post("/set-lang")
async def set_lang(request: UpdateLangRequest):
    global CURRENT_LANG
    CURRENT_LANG = request.lang
    return 1


@app.get("/get-lang")
async def get_language():
    return {"current_lang": CURRENT_LANG}


# If you want to run the app directly in the script
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
