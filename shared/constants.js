/**
 * Shared constants for the Per 75 Possessions extension.
 */
const Per75 = window.Per75 || {};

Per75.constants = {
  API_BASE_URL: 'https://stats.nba.com/stats/leaguedashplayerstats',

  DECIMAL_PRECISION: 1,

  PER75_FACTOR: 75,

  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes

  /**
   * Columns that should NEVER be scaled (metadata, percentages, rates, rankings).
   * Anything matching these names or patterns is left as-is.
   */
  NON_SCALABLE_COLUMNS: new Set([
    'PLAYER_ID',
    'PLAYER_NAME',
    'NICKNAME',
    'TEAM_ID',
    'TEAM_ABBREVIATION',
    'AGE',
    'GP',
    'W',
    'L',
    'W_PCT',
    'MIN',
    'POSS',
    'PACE',
    'PIE',
    'USG_PCT',
    'AST_PCT',
    'TS_PCT',
    'AST_RATIO',
    'AST_TO',
    'OREB_PCT',
    'DREB_PCT',
    'REB_PCT',
    'TM_TOV_PCT',
    'EFG_PCT',
    'E_PACE',
    'PACE_PER40',
    'DEF_RATING',
    'OFF_RATING',
    'NET_RATING',
    'DEF_RATING_RANK',
    'OFF_RATING_RANK',
    'NET_RATING_RANK',
    'DD2',
    'TD3',
  ]),

  /**
   * Regex patterns that mark a column as non-scalable.
   */
  NON_SCALABLE_PATTERNS: [
    /_PCT$/,
    /_RATING$/,
    /_RANK$/,
    /_RATIO$/,
  ],

  /**
   * Required headers for stats.nba.com API requests.
   */
  API_HEADERS: {
    'Referer': 'https://www.nba.com/',
    'Accept': 'application/json',
    'x-nba-stats-origin': 'stats',
    'x-nba-stats-token': 'true',
  },
};

// Make available in both content script and module contexts
if (typeof window !== 'undefined') {
  window.Per75 = Per75;
}
