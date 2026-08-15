"use client";
import { useEffect, useState, useRef } from 'react';

export default function InterviewRoom() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("Connecting to AI...");
  const mediaRecorderRef = useRef(null);

  // Uses localhost for Codespaces testing, or the live URL in production
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL 
    ? process.env.NEXT_PUBLIC_BACKEND_URL.replace("https://", "wss://")
    : "wss://ai-interview-backend-ah19.onrender.com";

  useEffect(() => {
    // Establish WebSocket connection
    const ws = new WebSocket(`${backendUrl}/ws/interview`);
    
    ws.onopen = () => setStatus("Connected! Hold the button below to speak.");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus("AI is speaking...");
      
      // Use the browser's built-in Text-to-Speech to read the response aloud
      const utterance = new SpeechSynthesisUtterance(data.text);
      utterance.onend = () => setStatus("Connected! Hold the button below to speak.");
      window.speechSynthesis.speak(utterance);
    };

    setSocket(ws);
    return () => ws.close();
  }, [backendUrl]);

  const startAnswering = async () => {
    try {
      setStatus("Recording... Speak now!");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      let audioChunks = [];
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        setStatus("Processing your answer...");
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Send the audio blob to the FastAPI backend over WebSocket
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(audioBlob);
        }
      };
      
      mediaRecorderRef.current.start();
    } catch (err) {
      setStatus("Error: Microphone access denied.");
    }
  };

  const stopAnswering = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-24">
      <h1 className="text-4xl font-bold mb-8">AI Interview Coach</h1>
      
      <div className="mb-8 text-xl font-semibold text-blue-400 h-8">
        {status}
      </div>
      
      <button 
        onMouseDown={startAnswering} 
        onMouseUp={stopAnswering}
        onMouseLeave={stopAnswering}
        className="px-10 py-6 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 active:scale-95 rounded-full text-2xl font-bold shadow-lg transition-all select-none"
      >
        Hold to Speak
      </button>
      
      <p className="mt-6 text-gray-400 max-w-md text-center">
        Press and hold the button while answering. Release when you are finished to submit your response.
      </p>
    </main>
  );
}