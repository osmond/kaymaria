self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
// Pass-through fetch (kept simple/safe for dev)
self.addEventListener("fetch", () => {});
