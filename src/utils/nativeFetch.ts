// Get native fetch from a fresh iframe context to bypass any overrides
// Keep iframe alive as its context is needed for fetch to work
let fetchIframe: HTMLIFrameElement | null = null;
let nativeFetch: typeof fetch | null = null;

export function getNativeFetch(): typeof fetch {
  if (!nativeFetch) {
    fetchIframe = document.createElement('iframe');
    fetchIframe.style.display = 'none';
    document.body.appendChild(fetchIframe);
    nativeFetch = fetchIframe.contentWindow!.fetch.bind(fetchIframe.contentWindow);
  }
  return nativeFetch;
}
