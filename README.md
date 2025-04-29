# 💼 Spendora – AI-Powered Bookkeeping Assistant  
*A full-stack project for the Microsoft AI Agent Hackathon*  
🌐 Live Site: [https://spendoraai.onrender.com](https://spendoraai.onrender.com)

---

## 📘 Project Overview

**Spendora** is an intelligent, collaborative expense management platform that helps users understand, track, and optimize their financial lives. Designed with both individuals and teams in mind, Spendora combines a powerful AI agent, a clean interface, and a scalable backend to streamline bookkeeping.

Built for the **Microsoft AI Agent Hackathon**, this project demonstrates the potential of multi-agent AI systems in automating daily tasks, enabling financial transparency, and fostering smarter decision-making.

---

## 🎯 Why Spendora?

Our AI agent empowers users to gain deeper insights into their spending patterns—whether in their personal lives or at work. With intelligent budgeting, automated record generation, and real-time collaboration, Spendora enables confident and informed financial management.

---

## 🖥️ Core Features

### 🔐 Authentication & User Profiles
- Login using email (token-based simulation).
- View and manage user profiles.
- Retrieve user details and search users by name.

### 📁 Ledger Management
- Create multiple ledgers for different projects or personal budgets.
- Set and update total, monthly, and category-based budgets.
- Collaborate with others by adding **Editors** or **Viewers**.
- Real-time notification when ledgers are shared or updated.

### 🧾 Record Management
- Add and manage expenses with amount, date, merchant, category, and description.
- Support for **AI-generated** records via chatbot or OCR.
- Add **splits** to share expenses among collaborators.
- Filter by month, category, contributor, and split participants.
- Update or delete existing records.

### 🗂️ Incomplete Record Handling
- Automatically detect and list incomplete records added by AI.
- Prompt users to manually review and complete missing data.

### 📊 Visual Analysis
- Interactive dashboard with monthly/yearly/all-time data summaries.
- Real-time charts by category and date range.
- Integrated budget progress tracking.

### 💬 AI Chat Assistant
- Smart chatbot interface (floating and fullscreen):
  - Create records.
  - Modify budgets.
  - Summarize expenses.
  - Cross-page interaction enabled.

### 🧾 OCR (Receipt Scanner)
- Upload images of receipts.
- Extract total amount, date, and merchant using EasyOCR.
- Parsed information is passed to the AI agent for automatic record creation.

### 🎤 Voice Input
- Record and upload voice messages.
- Speech-to-text powered by Azure Cognitive Services.
- Transcribed input is used to interact with the AI agent.

### 🔔 Notification System
- View all past and unread alerts.
- Automatically receive alerts for new records or ledger activity.
- Mark notifications as read.

### 🗃️ Category Management
- Built-in category presets with emojis.
- Users can define their own categories with custom names and icons.

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
- EasyOCR (receipt parsing)  
- Azure Speech-to-Text (voice input)  
- Semantic Kernel agents  

### 🤖 AI Integration
- Custom multi-agent architecture  
- LLM-powered AI assistant for user interaction, classification, and task delegation  
- OCR-to-agent workflow and conversational memory via Semantic Kernel  

### 🚀 Deployment
- Full-stack deployed via **Render**  
- Public URL: [https://spendoraai.onrender.com](https://spendoraai.onrender.com)

---

## 🧪 How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/spendora.git
cd spendora
