import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { GoogleOAuthProvider } from '@react-oauth/google'
import App from "./App";
import "./index.css";

if (import.meta.env.VITE_MOCK === "true") {
  const { worker } = await import("./mocks/browser");
  // await worker.start()
  await worker.start({ onUnhandledRequest: "bypass" });
}

// const GOOGLE_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <GoogleOAuthProvider clientId={GOOGLE_ID}> */}
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
    {/* </GoogleOAuthProvider> */}
  </React.StrictMode>
);
