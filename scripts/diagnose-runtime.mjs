import { JSDOM } from '../../animal-island-ui-main/node_modules/jsdom/lib/api.js';
import { readdir } from 'node:fs/promises';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://10.0.0.119:25774/',
  pretendToBeVisual: true,
});
for (const key of ['window', 'document', 'navigator', 'location', 'localStorage', 'HTMLElement', 'SVGElement', 'Element', 'Node', 'MutationObserver', 'getComputedStyle']) {
  Object.defineProperty(globalThis, key, {
    configurable: true,
    value: key === 'getComputedStyle' ? dom.window.getComputedStyle.bind(dom.window) : dom.window[key],
  });
}
dom.window.SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 100, height: 100 });
globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 16);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.fetch = async (url) => ({
  ok: true,
  json: async () => url === '/api/nodes' ? { status: 'success', data: [] } : { status: 'success', data: {} },
});
globalThis.WebSocket = class {
  close() {}
  send() {}
};

const assets = new URL('../dist/assets/', import.meta.url);
const entryName = (await readdir(assets)).find((name) => /^index-.*\.js$/.test(name));
if (!entryName) throw new Error('Built JavaScript entry not found');
const entry = new URL(entryName, assets);
await import(entry.href);
await new Promise((resolve) => setTimeout(resolve, 100));
console.log(document.body.innerHTML.slice(0, 500));
