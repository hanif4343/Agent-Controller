const CACHE_NAME = "orchestrator-shell-v5";
const SHELL_FILES = ["./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// app shell (HTML/CSS/JS) cache-first, বাকি সব (GitHub API কল) সবসময় network থেকে —
// কারণ task/run ডেটা সবসময় সর্বশেষ হওয়া দরকার, cache থেকে না।
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isShellFile = SHELL_FILES.some((f) => url.pathname.endsWith(f.replace("./", "")));

  if (isShellFile) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
  // অন্য সব রিকোয়েস্ট (api.github.com ইত্যাদি) স্বাভাবিকভাবে network-এ যাবে, service worker ছোঁবে না
});
