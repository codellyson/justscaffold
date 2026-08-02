import { onRequest, type Stats } from "@/lib/messages";

const STYLE_ID = "__BIN_NAME__-style";
const MARK = "data-__BIN_NAME__-mark";

function collect(): Stats {
  return {
    url: location.href,
    title: document.title,
    links: document.querySelectorAll("a[href]").length,
    images: document.querySelectorAll("img").length,
  };
}

// This file shares one cascade with the page's own CSS, which is why there is
// no Tailwind here and no global selectors: a single attribute and one <style>
// element are the whole footprint. Anything broader restyles the site.
function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `[${MARK}] { outline: 2px solid #6366f1 !important; outline-offset: 2px !important; }`;
  document.documentElement.append(style);
}

function setHighlight(on: boolean): void {
  ensureStyle();
  for (const el of document.querySelectorAll("a[href]")) {
    if (on) el.setAttribute(MARK, "");
    else el.removeAttribute(MARK);
  }
}

onRequest(async (request) => {
  switch (request.kind) {
    case "get-stats":
      return collect();
    case "highlight":
      setHighlight(request.on);
      return { on: request.on };
  }
});
