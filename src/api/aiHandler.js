// src/api/aiHandler.js
const API_BASE = "https://spendoraai.onrender.com"; // 替换成真实 URL！

export async function sendMessageToAI(message, userId = "olivia001") {
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
    return data.response || "[无响应]";
  } catch (error) {
    return `[请求失败]：${error.message}`;
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

    // 检查响应内容类型
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