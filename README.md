# Expense Assistant - Frontend Mock Version
 
This project is the **Frontend Mock Version** of Expense Assistant.  
It uses **Mock Service Worker (MSW)** and **Local Mock Data** for development and UI testing.  
No real backend or database is required for this version.
 
---
 
## 🛠 How to Set Up

### 1. Clone the repository

```
bash 
git clone https://github.com/your-repo/expense-assistant.git
cd expense-assistant
```

### 2. Install dependencies
 
```
npm install
```

### 3. Start local development server

```
npm run dev
```

### 4. Then open http://localhost:5173 in your browser.


## 📦 Tech Stack

Vite + React 18

React Router

React Query

Tailwind CSS

Framer Motion (animations)

Lucide React (icons)

Mock Service Worker (MSW) (mock API)

Nanoid (ID generation)

## 📄 Notes for Mock Setup
Mock data is stored in /src/mocks/mockData.js.

Mock API handlers are located under /src/mocks/handlers/.

Mock Service Worker is initialized automatically when running locally (no extra setup needed).

No backend server is involved in this version.

## 🛡 If Encountering Issues
Make sure you are running in a local environment (localhost:5173).

If page is blank or errors appear:

Try refreshing the page

Stop and re-run npm run dev

Mock worker (browser.js) only activates in development mode.

## ⚡ Common Commands

Command	Purpose
npm run dev	Start local development
npm run build	Build for production (no need for mock version)
npm run preview	Preview production build
