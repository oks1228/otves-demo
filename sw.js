/*
 * Демо закрыто 15.10.2026. Этот файл заменяет прежний обработчик «работы без интернета» демо:
 * удаляет его кэш и снимает себя, чтобы у тех, кто ставил демо иконкой, открывалась новая страница, а не старая копия.
 * Данные демо (localStorage) не трогает — их можно скачать со страницы.
 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) await caches.delete(k);
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({ type: "window" })) c.navigate(c.url);
  })());
});
