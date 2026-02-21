/**
 * Runs in the page's MAIN world (not isolated).
 * Patches window.fetch to capture stats.nba.com API params
 * and dispatches them as CustomEvents for the content script.
 */
(function () {
  const origFetch = window.fetch;
  window.fetch = function (...args) {
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || '';
      if (url.includes('stats.nba.com/stats/leaguedashplayerstats')) {
        const parsed = new URL(url);
        const params = Object.fromEntries(parsed.searchParams.entries());
        window.dispatchEvent(new CustomEvent('per75-params-intercepted', {
          detail: params,
        }));
      }
    } catch (e) { /* ignore parse errors */ }
    return origFetch.apply(this, args);
  };
})();
