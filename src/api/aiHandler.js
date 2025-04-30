// src/api/aiHandler.js
const API_BASE = "https://spendoraai.onrender.com";

export async function sendMessageToAI(message, userId) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: message,
        user_id: userId
      })
    });

    const data = await res.json();
    return data.response || "[no response]";
  } catch (error) {
    return `[failed request]：${error.message}`;
  }
}

// src/api/aiHandler.js
export const sendImageToOCR = async (base64Image) => {
  try {
    const response = await fetch(`${API_BASE}/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        image: `data:image/jpeg;base64,${base64Image}`
      }),
    });

    // check if the response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'OCR request failed');
    }
    
    return data.response || data;
  } catch (error) {
    console.error('OCR Error Details:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error('OCR service is currently unavailable. Please try again later.');
  }
};

/** Send audio blob to voice recognition API */
export async function sendAudioToVoice(blob) {
  // blob -> base64，avoid multipart
  const base64Audio = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // base64
    reader.readAsDataURL(blob);
  });

  try {
    const res = await fetch(`${API_BASE}/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio: base64Audio, mime: blob.type }), // webm/ogg
    });

    const { text } = await res.json();          // {text:"..."}
    return text || "[Invalid response]";
  } catch (err) {
    console.error("Voice API error", err);
    return "[Failed request]"; 
  }
}