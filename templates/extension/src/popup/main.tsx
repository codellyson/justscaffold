import "@/styles/global.css";
import { bootTheme, CONSUMER_THEMES } from "@codellyson/justui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Popup } from "@/popup/Popup";

bootTheme({ keyPrefix: "__BIN_NAME__", themes: CONSUMER_THEMES, defaultThemeId: "ocean" });

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
);
