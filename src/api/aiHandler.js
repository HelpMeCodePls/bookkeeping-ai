// src/api/aiHandler.js
const API_BASE = "https://spendoraai.onrender.com/"; // 替换成真实 URL！

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

export async function sendImageToOCR(base64Image) {
  console.log("Sending image to OCR API...");

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 返回假的识别结果
  return "Mock Receipt:\n- Latte $5.00\n- Sandwich $7.50\n- Total $12.50";
}