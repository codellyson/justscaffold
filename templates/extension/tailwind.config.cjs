const justui = require("@codellyson/justui/tailwind-preset");

// The content script is deliberately absent from `content`: it shares a cascade
// with the page it runs in, so it styles itself inline instead.
module.exports = {
  presets: [justui],
  content: [
    "./popup.html",
    "./src/popup/**/*.{ts,tsx}",
    "./node_modules/@codellyson/justui/dist/**/*.js",
  ],
};
