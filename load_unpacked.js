const { chromium } = require('playwright');
const path = require('path');

const browser = await chromium.launchPersistentContext('', {
  headless: false,
  args: [
    `--disable-extensions-except=${path.resolve('./your-extension')}`,
    `--load-extension=${path.resolve('./your-extension')}`
  ]
});
