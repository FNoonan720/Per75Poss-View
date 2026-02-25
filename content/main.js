/**
 * Main orchestrator for the Per 75 Possessions extension.
 */

Per75.main = {
  // State
  isPer75Active: false,
  originalTableHtml: null,
  cachedTotals: null,
  cachedAdvanced: null,
  cachedPer75Data: null,
  _navObserver: null,
  _lastUrl: null,
  _debounceTimer: null,

  init() {
    this._lastUrl = window.location.href;
    this._lastPathname = window.location.pathname;

    // Initialize the API interceptor
    Per75.interceptor.init();

    // Initialize DOM injector with our click handler
    Per75.dom.init(() => this._onPer75Selected());

    // Listen for deactivation (user picks a normal PerMode)
    window.addEventListener('per75-deactivated', () => this._onDeactivated());

    // Watch for SPA navigation
    this._watchNavigation();
  },

  /**
   * Watch for URL changes in the React SPA.
   */
  _watchNavigation() {
    this._navObserver = new MutationObserver(() => {
      // Only treat it as navigation when the *pathname* changes.
      // Query-param changes (sort order, filters) must not reset Per 75 state.
      if (window.location.pathname !== this._lastPathname) {
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
          this._lastUrl = window.location.href;
          this._lastPathname = window.location.pathname;
          this._onNavigate();
        }, 300);
      }
    });

    this._navObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  /**
   * Handle SPA navigation to a new page.
   */
  _onNavigate() {
    if (!window.location.pathname.includes('/stats/players/')) {
      return;
    }

    this.isPer75Active = false;
    this.originalTableHtml = null;
    this.cachedTotals = null;
    this.cachedAdvanced = null;
    this.cachedPer75Data = null;
    Per75.dom.stopWatchingTable();
    Per75.interceptor.currentParams = null;
    Per75.dom.reset();
  },

  /**
   * Called when user selects "Per 75 Poss" from the dropdown.
   */
  async _onPer75Selected() {
    if (this.isPer75Active) return;

    this.originalTableHtml = Per75.dom.saveOriginalTable();

    Per75.dom.setLoading(true);
    Per75.dom.clearError();

    try {
      const params = Per75.interceptor.getParams();

      const currentMeasure = params.MeasureType || 'Base';

      const totalsParams = { ...params, PerMode: 'Totals' };
      const advancedParams = { ...params, PerMode: 'Totals', MeasureType: 'Advanced' };

      let totalsPromise = this._fetchStats(totalsParams);

      let advancedPromise;
      if (currentMeasure === 'Advanced') {
        advancedPromise = totalsPromise;
      } else {
        advancedPromise = this._fetchStats(advancedParams);
      }

      const [totalsData, advancedData] = await Promise.all([totalsPromise, advancedPromise]);

      if (!totalsData || !advancedData) {
        throw new Error('Failed to fetch stats data');
      }

      const totalsResultSet = this._extractResultSet(totalsData);
      const advancedResultSet = this._extractResultSet(advancedData);

      if (!totalsResultSet || !advancedResultSet) {
        throw new Error('Unexpected API response format');
      }

      const possMap = Per75.calculator.buildPossMap(advancedResultSet);
      const per75Data = Per75.calculator.calculatePer75(totalsResultSet, possMap);

      Per75.dom.updateTable(per75Data);
      Per75.dom.resortTable();
      Per75.dom.startWatchingTable(per75Data);

      this.isPer75Active = true;
      this.cachedTotals = totalsData;
      this.cachedAdvanced = advancedData;
      this.cachedPer75Data = per75Data;

    } catch (err) {
      console.error('[Per75]', err);
      Per75.dom.showError('Failed to load Per 75 stats. Please try again.');
      if (this.originalTableHtml) {
        Per75.dom.restoreOriginalTable(this.originalTableHtml);
      }
    } finally {
      Per75.dom.setLoading(false);
    }
  },

  /**
   * Called when user selects a standard PerMode option.
   */
  _onDeactivated() {
    if (!this.isPer75Active) return;

    this.isPer75Active = false;
    this.cachedPer75Data = null;
    Per75.dom.stopWatchingTable();

    if (this.originalTableHtml) {
      Per75.dom.restoreOriginalTable(this.originalTableHtml);
      this.originalTableHtml = null;
    }
  },

  /**
   * Fetch stats from the background service worker.
   */
  _fetchStats(params) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stats request timed out'));
      }, 120000);

      chrome.runtime.sendMessage(
        {
          type: 'FETCH_STATS',
          url: Per75.constants.API_BASE_URL,
          params,
        },
        (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          if (response && response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response?.error || 'Unknown fetch error'));
          }
        }
      );
    });
  },

  /**
   * Extract the first result set from an NBA stats API response.
   */
  _extractResultSet(data) {
    if (!data || !data.resultSets || !data.resultSets.length) return null;
    return data.resultSets[0];
  },
};

// Boot up
Per75.main.init();
