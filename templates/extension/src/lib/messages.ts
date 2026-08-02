/**
 * Popup, background, and content script are three separate bundles with no
 * shared runtime — a message shape that drifts between them fails silently in
 * whichever context you are not currently looking at. Declaring the union and
 * both send helpers in one module turns that drift into a compile error.
 */
export type Request = { kind: "get-stats" } | { kind: "highlight"; on: boolean };

export interface Stats {
  url: string;
  title: string;
  links: number;
  images: number;
}

export type ResponseFor<R extends Request> = R extends { kind: "get-stats" }
  ? Stats
  : R extends { kind: "highlight" }
    ? { on: boolean }
    : never;

/** Popup or background -> the content script running in one page. */
export async function sendToTab<R extends Request>(
  tabId: number,
  request: R,
): Promise<ResponseFor<R>> {
  return (await chrome.tabs.sendMessage(tabId, request)) as ResponseFor<R>;
}

/** Popup -> the background service worker. Never reaches content scripts. */
export async function sendToBackground<R extends Request>(
  request: R,
): Promise<ResponseFor<R>> {
  return (await chrome.runtime.sendMessage(request)) as ResponseFor<R>;
}

export function onRequest(
  handler: (request: Request, sender: chrome.runtime.MessageSender) => Promise<unknown>,
): void {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    void handler(message as Request, sender).then(sendResponse);
    // Returning true is what keeps the reply channel open for an async handler.
    // Drop it and Chrome closes the port as soon as this listener returns, so
    // sendResponse becomes a no-op and the caller's promise never settles.
    return true;
  });
}

export async function activeTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) throw new Error("no active tab");
  return tab.id;
}
