/**
 * DOM manipulation — inject dropdown option, update table, show states.
 */

Per75.dom = {
  _observer: null,
  _injected: false,
  _onPer75Click: null,
  _perModeSelect: null,
  _cachedPer75Data: null,
  _tableObserver: null,
  _reapplyTimer: null,
  _reapplyMaxTimer: null,

  init(onPer75Click) {
    this._onPer75Click = onPer75Click;
    this._observeDropdown();
  },

  /**
   * Watch for the dropdown to appear/re-render and inject our option.
   */
  _observeDropdown() {
    this._tryInject();

    this._observer = new MutationObserver(() => {
      const existing = document.querySelector('[data-extension-option="per75"]');
      if (!existing) {
        this._injected = false;
        this._perModeSelect = null;
        this._tryInject();
      }
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  },

  _tryInject() {
    if (this._injected) return;

    const dropdown = this._findPerModeDropdown();
    if (!dropdown) return;

    this._perModeSelect = dropdown;
    this._injectOption(dropdown);
    this._injected = true;
  },

  /**
   * Locate the Per Mode dropdown.
   */
  _findPerModeDropdown() {
    const selects = document.querySelectorAll('select.DropDown_select__4pIg9, select');
    for (const select of selects) {
      const optTexts = Array.from(select.options).map(o => o.textContent.trim());
      if (optTexts.includes('Per Game') && optTexts.includes('Totals')) {
        return select;
      }
    }
    return null;
  },

  /**
   * Add "Per 75 Poss" option to the select dropdown.
   */
  _injectOption(selectEl) {
    if (selectEl.querySelector('[data-extension-option="per75"]')) {
      this._injected = true;
      return;
    }

    const option = document.createElement('option');
    option.value = 'per75';
    option.textContent = 'Per 75 Poss';
    option.setAttribute('data-extension-option', 'per75');

    // Insert right after "Per 100 Poss" if found, otherwise append at end
    const per100Option = Array.from(selectEl.options).find(
      o => o.textContent.trim().startsWith('Per 100 Poss')
    );
    if (per100Option && per100Option.nextSibling) {
      selectEl.insertBefore(option, per100Option.nextSibling);
    } else {
      selectEl.appendChild(option);
    }

    selectEl.addEventListener('change', (e) => {
      if (e.target.value === 'per75') {
        e.stopImmediatePropagation();
        if (this._onPer75Click) this._onPer75Click();
      } else {
        window.dispatchEvent(new CustomEvent('per75-deactivated'));
      }
    }, true);
  },

  /**
   * Get the stats table (Crom table, not date picker).
   */
  _findStatsTable() {
    return document.querySelector('table.Crom_table__p1iZz');
  },

  /**
   * Get the column headers from the stats table.
   */
  _getTableHeaders() {
    const table = this._findStatsTable();
    if (!table) return [];

    const thead = table.querySelector('thead');
    if (!thead) return [];

    const headerRows = thead.querySelectorAll('tr');
    const lastRow = headerRows[headerRows.length - 1];
    if (!lastRow) return [];

    return Array.from(lastRow.querySelectorAll('th, td')).map(
      cell => cell.textContent.trim()
    );
  },

  /**
   * Update the stats table with per-75 computed data.
   * @param {object} per75Data - { headers: [...API col names], rowSet: [[...], ...] }
   */
  updateTable(per75Data) {
    const table = this._findStatsTable();
    if (!table) return;

    const { headers: apiHeaders, rowSet } = per75Data;
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const displayHeaders = this._getTableHeaders();
    const tableRows = tbody.querySelectorAll('tr');

    // Map displayed header labels (uppercase) → API column names
    const DISPLAY_TO_API = {
      'PLAYER': 'PLAYER_NAME',
      'TEAM': 'TEAM_ABBREVIATION',
      'GP': 'GP', 'AGE': 'AGE', 'W': 'W', 'L': 'L',
      'MIN': 'MIN', 'PTS': 'PTS', 'FGM': 'FGM', 'FGA': 'FGA',
      'FG%': 'FG_PCT', '3PM': 'FG3M', '3PA': 'FG3A', '3P%': 'FG3_PCT',
      'FTM': 'FTM', 'FTA': 'FTA', 'FT%': 'FT_PCT',
      'OREB': 'OREB', 'DREB': 'DREB', 'REB': 'REB',
      'AST': 'AST', 'TOV': 'TOV', 'STL': 'STL', 'BLK': 'BLK',
      'PF': 'PF', 'FP': 'NBA_FANTASY_PTS', 'DD2': 'DD2', 'TD3': 'TD3',
      '+/-': 'PLUS_MINUS',
      // Advanced
      'OFFRTG': 'OFF_RATING', 'DEFRTG': 'DEF_RATING', 'NETRTG': 'NET_RATING',
      'AST%': 'AST_PCT', 'AST/TO': 'AST_TO', 'AST RATIO': 'AST_RATIO',
      'OREB%': 'OREB_PCT', 'DREB%': 'DREB_PCT', 'REB%': 'REB_PCT',
      'TO RATIO': 'TM_TOV_PCT', 'EFG%': 'EFG_PCT', 'TS%': 'TS_PCT',
      'USG%': 'USG_PCT', 'PACE': 'PACE', 'PIE': 'PIE', 'POSS': 'POSS',
      'W%': 'W_PCT',
      // Rank columns
      'GP RANK': 'GP_RANK', 'W RANK': 'W_RANK', 'L RANK': 'L_RANK',
      'MIN RANK': 'MIN_RANK', 'PTS RANK': 'PTS_RANK',
      'FGM RANK': 'FGM_RANK', 'FGA RANK': 'FGA_RANK', 'FG% RANK': 'FG_PCT_RANK',
      '3PM RANK': 'FG3M_RANK', '3PA RANK': 'FG3A_RANK', '3P% RANK': 'FG3_PCT_RANK',
      'FTM RANK': 'FTM_RANK', 'FTA RANK': 'FTA_RANK', 'FT% RANK': 'FT_PCT_RANK',
      'OREB RANK': 'OREB_RANK', 'DREB RANK': 'DREB_RANK', 'REB RANK': 'REB_RANK',
      'AST RANK': 'AST_RANK', 'TOV RANK': 'TOV_RANK', 'STL RANK': 'STL_RANK',
      'BLK RANK': 'BLK_RANK', 'PF RANK': 'PF_RANK',
      'FP RANK': 'NBA_FANTASY_PTS_RANK',
      'DD2 RANK': 'DD2_RANK', 'TD3 RANK': 'TD3_RANK',
      '+/- RANK': 'PLUS_MINUS_RANK',
    };

    // Build column mapping (normalize display header to uppercase)
    const colMap = [];
    for (let di = 0; di < displayHeaders.length; di++) {
      const displayName = displayHeaders[di];
      const upperName = displayName.toUpperCase();
      const apiName = DISPLAY_TO_API[upperName] || DISPLAY_TO_API[displayName] ||
        upperName.replace(/%/g, '_PCT').replace(/\s+/g, '_').replace('+/-', 'PLUS_MINUS');
      const apiIdx = apiHeaders.indexOf(apiName);
      colMap.push({ displayIdx: di, apiIdx, apiName });
    }

    // Build player lookup: name → row data
    const playerNameIdx = apiHeaders.indexOf('PLAYER_NAME');
    const dataByName = new Map();
    for (const row of rowSet) {
      if (playerNameIdx !== -1) {
        dataByName.set(row[playerNameIdx], row);
      }
    }

    // Update each visible table row — only scalable (per-75 adjusted) columns
    for (const tr of tableRows) {
      const cells = tr.querySelectorAll('td');
      if (cells.length < 3) continue;

      const primaryCell = tr.querySelector('.Crom_primary__EajZu') ||
                          tr.querySelector('a[href*="/stats/player/"]');
      const playerName = primaryCell?.textContent?.trim();
      if (!playerName) continue;

      const dataRow = dataByName.get(playerName);
      if (!dataRow) continue;

      for (const { displayIdx, apiIdx, apiName } of colMap) {
        if (apiIdx === -1) continue;
        if (displayIdx >= cells.length) continue;
        if (!Per75.calculator.isScalable(apiName)) continue;

        const value = dataRow[apiIdx];
        if (value === null || value === undefined) {
          cells[displayIdx].textContent = '\u2014';
        } else if (typeof value === 'number') {
          cells[displayIdx].textContent = value.toFixed(Per75.constants.DECIMAL_PRECISION);
        } else {
          cells[displayIdx].textContent = String(value);
        }
      }
    }
  },

  /**
   * Watch document.body for React re-renders (sorts, page changes) and
   * re-apply per-75 values each time the table is rewritten.
   *
   * Watching the body is the only reliable approach when React can replace
   * any ancestor of the table during a sort (including table.parentElement
   * and its ancestors). To avoid ads causing the debounce timer to never
   * fire, we use a max-wait debounce: fire after 50ms of quiet OR after
   * 500ms regardless, whichever comes first.
   */
  startWatchingTable(per75Data) {
    this.stopWatchingTable();
    this._cachedPer75Data = per75Data;

    this._tableObserver = new MutationObserver(() => {
      clearTimeout(this._reapplyTimer);
      this._reapplyTimer = setTimeout(() => {
        clearTimeout(this._reapplyMaxTimer);
        this._reapplyMaxTimer = null;
        this._reapplyPer75();
      }, 50);

      if (!this._reapplyMaxTimer) {
        this._reapplyMaxTimer = setTimeout(() => {
          this._reapplyMaxTimer = null;
          clearTimeout(this._reapplyTimer);
          this._reapplyTimer = null;
          this._reapplyPer75();
        }, 500);
      }
    });

    this._tableObserver.observe(document.body, { childList: true, subtree: true });
  },

  _reapplyPer75() {
    if (!this._cachedPer75Data || !this._tableObserver) return;
    // Disconnect before writing so our own DOM changes don't re-trigger.
    this._tableObserver.disconnect();
    this.updateTable(this._cachedPer75Data);
    this.resortTable();
    // Reconnect to document.body (reference never becomes stale).
    this._tableObserver.observe(document.body, { childList: true, subtree: true });
  },

  /**
   * Re-sort the visible rows by the active column's Per 75 values so the
   * display order reflects Per 75, not Per Game.
   *
   * Relies on aria-sort="ascending"|"descending" on the active header cell,
   * which is standard for accessible HTML tables (and used by NBA.com).
   */
  resortTable() {
    const table = this._findStatsTable();
    if (!table) return;

    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    // Detect which column is sorted and in which direction.
    // NBA.com uses sorted="A" (descending/highest-first) and sorted="D" (ascending/lowest-first).
    // Standard aria-sort is also checked as a fallback.
    const headerCells = Array.from(
      table.querySelectorAll('thead tr:last-child th, thead tr:last-child td')
    );
    let sortColIdx = -1;
    let sortDir = 'desc';

    for (let i = 0; i < headerCells.length; i++) {
      const sorted = headerCells[i].getAttribute('sorted');
      const ariaSort = headerCells[i].getAttribute('aria-sort');
      if (sorted === 'A') { sortColIdx = i; sortDir = 'desc'; break; }
      if (sorted === 'D') { sortColIdx = i; sortDir = 'asc'; break; }
      if (ariaSort === 'descending') { sortColIdx = i; sortDir = 'desc'; break; }
      if (ariaSort === 'ascending') { sortColIdx = i; sortDir = 'asc'; break; }
    }

    if (sortColIdx === -1) return; // No sort indicator found — leave as-is.

    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length < 2) return;

    // Verify the sort column is numeric (skip player name, team, etc.).
    const probeText = rows[0].querySelectorAll('td')[sortColIdx]?.textContent?.trim() ?? '';
    if (probeText === '' || isNaN(parseFloat(probeText))) return;

    const MISSING = sortDir === 'desc' ? -Infinity : Infinity;

    rows.sort((a, b) => {
      const aText = a.querySelectorAll('td')[sortColIdx]?.textContent?.trim() ?? '';
      const bText = b.querySelectorAll('td')[sortColIdx]?.textContent?.trim() ?? '';
      const aVal = (aText === '' || aText === '\u2014') ? MISSING : (parseFloat(aText) ?? MISSING);
      const bVal = (bText === '' || bText === '\u2014') ? MISSING : (parseFloat(bText) ?? MISSING);
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // Re-insert rows in sorted order via a DocumentFragment (single reflow).
    const frag = document.createDocumentFragment();
    rows.forEach(r => frag.appendChild(r));
    tbody.appendChild(frag);

    // Update the rank column (cells[0]) if it holds sequential integers.
    if (/^\d+$/.test(rows[0].querySelectorAll('td')[0]?.textContent?.trim() ?? '')) {
      rows.forEach((row, i) => {
        const cell = row.querySelectorAll('td')[0];
        if (cell) cell.textContent = String(i + 1);
      });
    }
  },

  stopWatchingTable() {
    clearTimeout(this._reapplyTimer);
    clearTimeout(this._reapplyMaxTimer);
    this._reapplyTimer = null;
    this._reapplyMaxTimer = null;
    if (this._tableObserver) {
      this._tableObserver.disconnect();
      this._tableObserver = null;
    }
    this._cachedPer75Data = null;
  },

  saveOriginalTable() {
    const table = this._findStatsTable();
    if (!table) return null;
    const tbody = table.querySelector('tbody');
    return tbody ? tbody.innerHTML : null;
  },

  restoreOriginalTable(savedHtml) {
    if (!savedHtml) return;
    const table = this._findStatsTable();
    if (!table) return;
    const tbody = table.querySelector('tbody');
    if (tbody) tbody.innerHTML = savedHtml;
  },

  setLoading(isLoading) {
    const table = this._findStatsTable();
    if (!table) return;
    table.classList.toggle('per75-loading', isLoading);
  },

  showError(message) {
    this.clearError();
    const table = this._findStatsTable();
    if (!table) return;

    const notice = document.createElement('div');
    notice.className = 'per75-error';
    notice.textContent = message;
    table.parentElement.insertBefore(notice, table);
    setTimeout(() => notice.remove(), 5000);
  },

  clearError() {
    document.querySelectorAll('.per75-error').forEach(el => el.remove());
  },

  reset() {
    this._injected = false;
    this._perModeSelect = null;
  },

  destroy() {
    this.stopWatchingTable();
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  },

};
