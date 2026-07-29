const justui = require("@codellyson/justui/tailwind-preset");

// The justui preset maps the semantic tokens (--bg, --accent, …) to Tailwind
// classes like `bg-bg` and `text-accent`. The dist glob is load-bearing:
// without it Tailwind purges ThemeToggle/Button's classes and they ship
// unstyled. The second path covers pnpm's hoisted node_modules layout.
module.exports = {
  presets: [justui],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@codellyson/justui/dist/**/*.js",
    "../../node_modules/@codellyson/justui/dist/**/*.js",
  ],
};
