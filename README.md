# 🎙️ AI Interview Coach (Real-Time Voice-to-Voice)

An end-to-end, full-stack web application that simulates a technical interview environment. Users can speak their answers directly into their microphone, and the AI will transcribe the audio, analyze the response context, and reply with realistic, spoken follow-up questions in real-time.

**[AI INTERVIEW](https://ai-interview-portfolio.vercel.app/)**  
*(Note: Because the backend is hosted on Render's free tier, the first request may take ~40 seconds to wake up the server. Subsequent requests will be fast!)*

---

## 🏗️ System Architecture

This project is built using a decoupled microservices architecture, featuring a React client and a containerized Python backend communicating over WebSockets for low-latency voice streaming.

### Frontend (Client)
* **Framework:** Next.js (App Router) / React
* **Styling:** Tailwind CSS
* **Audio Capture:** HTML5 Web Audio API / MediaRecorder
* **Voice Output:** Web Speech Synthesis API
* **Deployment:** Hosted on **Vercel**

### Backend (API)
* **Framework:** FastAPI (Python)
* **Server:** Uvicorn 
* **Real-time Protocol:** Asynchronous WebSockets
* **Deployment:** Hosted on **Render**

### AI Pipeline
* **Speech-to-Text:** **Groq API (Whisper-large-v3)** - Used for ultra-fast audio transcription.
* **Brain / Logic:** **Google Gemini (gemini-3.5-flash)** - Used to analyze the user's transcript and dynamically generate strict, technical follow-up questions.

---

## 🚀 How to Run Locally

If you want to clone this repository and run it on your own machine, follow these steps:

### 1. Backend Setup
1. Navigate to the backend directory:
   `cd backend`
2. Install the required Python packages:
   `pip install -r requirements.txt`
3. Create a `.env` file in the `backend` folder and add your API keys:

GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
   ```text
   GROQ_API_KEY=your_groq_key_here
   GEMINI_API_KEY=your_gemini_key_here

   Start the FastAPI server:
uvicorn main:app --reload

2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
cd frontend

Install Node modules:
npm install

Update the WebSocket URL in app/page.js to point to your local server (usually ws://localhost:8000/ws/interview).

Start the Next.js development server:
npm run dev

Open http://localhost:3000 in your browser.
