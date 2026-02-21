/**
 * Per-75 possession stat calculations.
 */

Per75.calculator = {
  /**
   * Returns true if a column should be scaled by possessions.
   */
  isScalable(columnName) {
    const { NON_SCALABLE_COLUMNS, NON_SCALABLE_PATTERNS } = Per75.constants;

    if (NON_SCALABLE_COLUMNS.has(columnName)) return false;

    for (const pattern of NON_SCALABLE_PATTERNS) {
      if (pattern.test(columnName)) return false;
    }

    return true;
  },

  /**
   * Build a PLAYER_ID → POSS map from an advanced result set.
   * @param {object} advancedResultSet - A resultSet with headers and rowSet
   * @returns {Map<number, number>}
   */
  buildPossMap(advancedResultSet) {
    const headers = advancedResultSet.headers;
    const rows = advancedResultSet.rowSet;
    const playerIdIdx = headers.indexOf('PLAYER_ID');
    const possIdx = headers.indexOf('POSS');
    const map = new Map();

    if (playerIdIdx === -1 || possIdx === -1) return map;

    for (const row of rows) {
      map.set(row[playerIdIdx], row[possIdx]);
    }
    return map;
  },

  /**
   * Calculate per-75 values for a totals result set.
   * @param {object} totalsResultSet - resultSet with headers and rowSet
   * @param {Map<number, number>} possMap - PLAYER_ID → POSS mapping
   * @returns {object} New resultSet with per-75 computed values
   */
  calculatePer75(totalsResultSet, possMap) {
    const headers = totalsResultSet.headers;
    const rows = totalsResultSet.rowSet;
    const playerIdIdx = headers.indexOf('PLAYER_ID');
    const factor = Per75.constants.PER75_FACTOR;
    const precision = Per75.constants.DECIMAL_PRECISION;

    const scalableFlags = headers.map(h => this.isScalable(h));

    const newRows = [];

    for (const row of rows) {
      const playerId = row[playerIdIdx];
      const poss = possMap.get(playerId);

      // Skip players missing from advanced data
      if (poss === undefined || poss === null) continue;

      const newRow = row.slice();

      for (let i = 0; i < headers.length; i++) {
        if (!scalableFlags[i]) continue;

        const value = row[i];
        if (value === null || value === undefined) {
          newRow[i] = null;
          continue;
        }

        if (poss === 0) {
          newRow[i] = 0;
          continue;
        }

        newRow[i] = parseFloat(((value / poss) * factor).toFixed(precision));
      }

      newRows.push(newRow);
    }

    return {
      headers: headers.slice(),
      rowSet: newRows,
    };
  },
};
