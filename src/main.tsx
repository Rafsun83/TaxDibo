import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";

const storedTheme = window.localStorage.getItem("taxdibo-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
document.documentElement.classList.toggle(
  "dark",
  storedTheme ? storedTheme === "dark" : prefersDark,
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
