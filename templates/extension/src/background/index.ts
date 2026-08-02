import { activeTabId, onRequest, sendToTab } from "@/lib/messages";

// An MV3 service worker is torn down after a short idle and restarted on the
// next event, so module scope is not storage: anything assigned up here is
// gone by the following message. chrome.storage is the only state that lives
// across restarts.
const KEY = "highlight";

async function readHighlight(): Promise<boolean> {
  const stored = await chrome.storage.sync.get(KEY);
  return stored[KEY] === true;
}

chrome.runtime.onInstalled.addListener(async () => {
  const stored = await chrome.storage.sync.get(KEY);
  if (stored[KEY] === undefined) await chrome.storage.sync.set({ [KEY]: false });
});

// Every navigation gets a brand-new content script with no memory of the last
// one, so a preference the user set earlier has to be pushed back in by hand.
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status !== "complete") return;
  if (!(await readHighlight())) return;
  try {
    await sendToTab(tabId, { kind: "highlight", on: true });
  } catch {
    // chrome:// pages, the Web Store, and PDF viewers have no content script.
    // Not being able to reach one is the normal case, not a failure.
  }
});

onRequest(async (request) => {
  switch (request.kind) {
    case "highlight": {
      await chrome.storage.sync.set({ [KEY]: request.on });
      try {
        await sendToTab(await activeTabId(), request);
      } catch {
        // Same as above: the active tab may not accept content scripts.
      }
      return { on: request.on };
    }
    case "get-stats":
      return sendToTab(await activeTabId(), request);
  }
});
