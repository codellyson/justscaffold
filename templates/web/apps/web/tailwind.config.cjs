const justui = require("@codellyson/justui/tailwind-preset");

module.exports = {
  presets: [justui],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@codellyson/justui/dist/**/*.js",
    "../../node_modules/@codellyson/justui/dist/**/*.js",
  ],
};
