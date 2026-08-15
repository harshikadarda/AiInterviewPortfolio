import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from google import genai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# PUT YOUR REAL KEYS HERE:
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
genai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@app.get("/")
def read_root():
    return {"status": "Backend is live!"}

@app.websocket("/ws/interview")
async def interview_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            print("\n--- NEW RECORDING ---")
            print("1. Waiting for audio from browser...")
            audio_bytes = await websocket.receive_bytes()
            print(f"2. Received audio file! Size: {len(audio_bytes)} bytes")
            
            with open("temp_audio.webm", "wb") as f:
                f.write(audio_bytes)
            
            print("3. Sending audio to Groq Whisper...")
            with open("temp_audio.webm", "rb") as audio_file:
                transcription = groq_client.audio.transcriptions.create(
                    file=("temp_audio.webm", audio_file.read()),
                    model="whisper-large-v3", 
                    response_format="text"
                )
            print(f"4. Groq Transcription Success: '{transcription}'")
            
            print("5. Sending text to Gemini...")
            prompt = f"User said: '{transcription}'. Respond as a strict tech interviewer asking a follow up question in 2 short sentences."
            response = genai_client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )
            print("6. Received response from Gemini!")
            
            await websocket.send_json({"text": response.text})
            print("7. Successfully sent text back to browser to speak out loud.")
            
    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        # This will catch the exact error and print it clearly!
        print(f"\n❌ CRASHED AT THIS ERROR: {str(e)}")