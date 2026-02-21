/**
 * DOM manipulation — inject dropdown option, update table, show states.
 */

Per75.dom = {
  _observer: null,
  _injected: false,
  _onPer75Click: null,
  _perModeSelect: null,

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
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  },
};
