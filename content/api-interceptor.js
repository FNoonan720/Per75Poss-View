/**
 * Captures API parameters from the page's fetch calls.
 * The actual fetch interception runs in page-intercept.js (MAIN world).
 * This content script listens for the CustomEvents it dispatches.
 */

Per75.interceptor = {
  currentParams: null,

  init() {
    window.addEventListener('per75-params-intercepted', (e) => {
      this.currentParams = e.detail;
    });
  },

  /**
   * Get the current params, falling back to parsing the page URL + dropdowns.
   */
  getParams() {
    if (this.currentParams) return { ...this.currentParams };
    return this._parseParamsFromPage();
  },

  /**
   * Parse parameters from the page URL and dropdown selections.
   */
  _parseParamsFromPage() {
    const path = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    const measureTypeMap = {
      'traditional': 'Base',
      'advanced': 'Advanced',
      'misc': 'Misc',
      'scoring': 'Scoring',
      'usage': 'Usage',
      'four-factors': 'Four Factors',
      'opponent': 'Opponent',
      'defense': 'Defense',
    };

    const segments = path.split('/').filter(Boolean);
    const pageType = segments[segments.length - 1] || 'traditional';
    const measureType = measureTypeMap[pageType] || 'Base';

    // Try to read current dropdown values from the page
    const season = this._getDropdownValue(0) || this._getCurrentSeason();
    const seasonType = this._getDropdownValue(1) || 'Regular Season';

    const defaults = {
      LeagueID: '00',
      MeasureType: measureType,
      PerMode: 'Totals',
      Season: urlParams.get('Season') || season,
      SeasonType: urlParams.get('SeasonType') || seasonType,
      PORound: urlParams.get('PORound') || '0',
      Month: urlParams.get('Month') || '0',
      OpponentTeamID: urlParams.get('OpponentTeamID') || '0',
      Period: urlParams.get('Period') || '0',
      LastNGames: urlParams.get('LastNGames') || '0',
      DateFrom: urlParams.get('DateFrom') || '',
      DateTo: urlParams.get('DateTo') || '',
      Conference: urlParams.get('Conference') || '',
      Division: urlParams.get('Division') || '',
      GameScope: urlParams.get('GameScope') || '',
      GameSegment: urlParams.get('GameSegment') || '',
      Location: urlParams.get('Location') || '',
      Outcome: urlParams.get('Outcome') || '',
      PlayerExperience: urlParams.get('PlayerExperience') || '',
      PlayerPosition: urlParams.get('PlayerPosition') || '',
      SeasonSegment: urlParams.get('SeasonSegment') || '',
      ShotClockRange: urlParams.get('ShotClockRange') || '',
      StarterBench: urlParams.get('StarterBench') || '',
      TeamID: urlParams.get('TeamID') || '0',
      TwoWay: urlParams.get('TwoWay') || '0',
      VsConference: urlParams.get('VsConference') || '',
      VsDivision: urlParams.get('VsDivision') || '',
    };

    return defaults;
  },

  /**
   * Read selected value from one of the DropDown_select elements.
   */
  _getDropdownValue(index) {
    const selects = document.querySelectorAll('.DropDown_select__4pIg9');
    if (selects[index]) {
      return selects[index].value;
    }
    return null;
  },

  _getCurrentSeason() {
    const now = new Date();
    const year = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-${String(year + 1).slice(-2)}`;
  },
};
