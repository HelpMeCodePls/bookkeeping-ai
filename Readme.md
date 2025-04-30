# 💼 Spendora – AI-Powered Bookkeeping Assistant  
*A full-stack project for the Microsoft AI Agent Hackathon*  
🌐 Live Site: [https://spendoraai.onrender.com](https://spendoraai.onrender.com)  
📦 Backup Site: [https://spendoraai.vercel.app/](https://spendoraai.vercel.app/)
---

## 📘 Project Overview

**Spendora** is an intelligent, collaborative expense management platform that helps users understand, track, and optimize their financial lives. Spendora combines a powerful AI agent, a clean interface, and a scalable backend to streamline bookkeeping.

Built for the **Microsoft AI Agent Hackathon**, this project demonstrates the potential of multi-agent AI systems in automating daily tasks, enabling financial transparency, and fostering smarter decision-making.

![login_img](https://github.com/user-attachments/assets/5682fe5e-9a9b-4c88-a3eb-d6391a9401ff)

---

## 🎯 Why Spendora?

Our AI agent empowers users to gain deeper insights into their spending patterns—whether in their personal lives or at work. With intelligent budgeting, automated record generation, and real-time collaboration, Spendora enables confident and informed financial management.

---
## 💡 Use Case Example:

Imagine you're planning a trip with friends. One of you sets up a ledger named "China Trip", adds others as collaborators, and everyone contributes their expenses in real-time.
With AI-assistance and a shared dashboard, Spendora helps keep everyone on the same page—literally.

---

## 🖥️ Core Features

### 🔐 Authentication
- Simulated login system: Users can choose from four pre-defined demo accounts to explore the app.
- Retrieve user details and search users by name.
![login](https://github.com/user-attachments/assets/390f5729-a61f-4b1b-85df-e303c726e899)

### 📁 Ledger Management
- Create multiple ledgers for different projects or personal budgets.
- Set and update total, monthly, and category-based budgets.
- Collaborate with others by adding **Editors** or **Viewers**.
- Real-time notification when ledgers are shared or updated.
![ledger](https://github.com/user-attachments/assets/e0617864-e61a-475a-b3e2-daa0602557d9)

### 🧾 Record Management
- Add and manage expenses with amount, date, merchant, category, and description.
- Support for **AI-generated** records via chatbot.
- Add **splits** to share expenses among collaborators.
- Filter by month, category, contributor, and split participants.
- Update or delete existing records.
![image](https://github.com/user-attachments/assets/26b2a115-d0be-4b30-a798-4af656b31678)

### 🗂️ Incomplete Record Handling
- Automatically detect and list incomplete records added by AI.
- Prompt users to manually review and complete missing data.
![image](https://github.com/user-attachments/assets/e33b7a62-ca3a-417c-845c-0abdb7846ce4)

### 📊 Visual Analysis
- Interactive dashboard with monthly/yearly/all-time data summaries.
- Real-time charts by category and date range.
- Integrated budget progress tracking.
![analysis](https://github.com/user-attachments/assets/0ad35ecb-4cd7-433e-9eab-31f47d0c3575)

### 💬 AI Chat Assistant
- Smart chatbot interface (floating and fullscreen):
  - Create records.
  - Modify budgets.
  - Summarize expenses.
  - Cross-page interaction enabled.
![ai](https://github.com/user-attachments/assets/c26e5d48-cb9e-4942-ad69-735a368d1b70)

### 🎤 Voice Input
- Record and upload voice messages.
- Speech-to-text powered by Azure Cognitive Services.
- Transcribed input is used to interact with the AI agent.
![voice](https://github.com/user-attachments/assets/ca484467-b2fc-49d1-863e-c65dc0d28984)

### 🔔 Notification System
- View all past and unread alerts
- Automatically receive alerts for new records or ledger activity.
- Mark notifications as read.
![image](https://github.com/user-attachments/assets/fb64f14d-fe08-4438-9d48-f70a0cd9bb3a)

### 🗃️ Category Management
- Built-in category presets with emojis.
- Users can define their own categories with custom names and icons.
![image](https://github.com/user-attachments/assets/1fd148bd-f858-4dc0-a09b-da92584eb5a4)

### 📊 Budget Configuration

- Configure monthly budgets to reflect changing needs over time.
- Set up default budgets that automatically apply to all months unless overridden.
- Customize category-level budgets for precision—e.g., allocate $200 to “Groceries” and $100 to “Entertainment”.
![image](https://github.com/user-attachments/assets/f2650901-133c-42da-89ac-4f7fed877967)

---

## 🧱 Tech Stack

### 💻 Frontend
- React 18 + Vite  
- Tailwind CSS  
- React Router  
- React Query  
- Framer Motion  
- Lucide React Icons  

### 🛠 Backend
- Python + Flask  
- MongoDB (via PyMongo)   
- Azure Speech-to-Text (voice input)  
- Semantic Kernel agents  

### 🤖 AI Integration
- Custom multi-agent architecture  
- LLM-powered AI assistant for user interaction, classification, and task delegation  

### 🚀 Deployment
- Full-stack deployed via **Render**  
- Public URL: [https://spendoraai.onrender.com](https://spendoraai.onrender.com)

---

## 🧪 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/HelpMeCodePls/bookkeeping-ai.git
cd spendora
```

### 2. Set Up the Frontend

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```
Rename the .env.example file to .env, so the front end connects to the local backend.

Also Rename the API_BASE variable under src\api\aiHandler.js to your local host port

### 3. Set Up the Backend

```bash
pip install -r requirements.txt
python app.py
# Runs at http://localhost:5000
```

Configure the .env file under backend folder and replace the credentials

> 💡 Make sure your MongoDB URI is configured in a `.env` file in the backend folder as `MONGO_URI`.  
> 💡 You will also need to include the following keys in your `.env` file in the backend folder to enable full backend functionality:
> 
> - `AZURE_OPENAI_API_KEY` – Azure OpenAI API key for Semantic Kernel agents  
> - `AZURE_OPENAI_CHAT_DEPLOYMENT_NAME` – Deployment name for your Azure chat model  
> - `AZURE_OPENAI_ENDPOINT` – Endpoint URL for your Azure OpenAI service  
> - `SPEECH_KEY` – Azure Speech-to-Text API key  
> - `SERVICE_REGION` – Azure region for the speech service

---

## 📂 Project Structure

```
├── frontend/                  # React application
│   ├── components/            # UI Components
│   ├── pages/                 # Views and routes
│   ├── services/              # API service functions
│   └── assets/                # Icons, logos, etc.
│
├── backend/                   # Flask backend
│   ├── app.py                 # Flask app with API routes
│   ├── functions.py           # Business logic and database services
│   ├── Agents/                # AI agents powered by Semantic Kernel
│   └── datatypes.py           # Enums and Pydantic models
│   └── .env                   # Environment configuration
│
├── .env                       # Environment configuration
├── requirements.txt           # Backend dependencies
└── README.md                  # Project documentation
```

---

## 🙌 Acknowledgments

This project was created by a team of 4 passionate developers for the **Microsoft AI Agent Hackathon**:

- **Antonio** – Frontend & Backend Integration, AI agent orchestration  
- **Olivia** – Full-stack Development, Database Design
- **Chenchen** – AI-human interaction flow, UX/UI design  
- **David** – Function Developer, Data Engineering

Big thanks to **Microsoft** for providing cutting-edge AI tools and infrastructure, and for the opportunity to explore the future of human-AI collaboration.

---

## 📢 Final Words

**Spendora** demonstrates how multi-agent AI and modern web technology can combine to transform daily financial workflows.  
Whether for students, families, or small teams, this platform simplifies bookkeeping, encourages budgeting, and empowers collaboration—one record at a time.
