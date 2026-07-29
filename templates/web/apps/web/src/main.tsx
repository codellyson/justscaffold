import "@/styles/global.css";
import { bootTheme, CONSUMER_THEMES } from "@codellyson/justui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/App";

// Boot with justui's consumer themes (brand-forward), not the dev/editor set.
bootTheme({ keyPrefix: "__BIN_NAME__", themes: CONSUMER_THEMES, defaultThemeId: "sunset" });

const root = document.getElementById("root");
if (!root) throw new Error("#root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
