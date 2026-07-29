import "@/styles/global.css";
import { bootTheme } from "@codellyson/justui/boot";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";

// Apply the persisted theme + mode before first paint so there's no flash.
// The keyPrefix namespaces this app's theme choice in localStorage.
bootTheme({ keyPrefix: "__BIN_NAME__" });

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
