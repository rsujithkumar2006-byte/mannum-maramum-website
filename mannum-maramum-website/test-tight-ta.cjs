const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('file:///' + path.resolve('..', 'Mannum Maramum - Reference Recreation.html').replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const s = document.createElement('style');
    s.textContent = `
      body.lang-ta .navlinks {
        gap: clamp(4px, 0.65vw, 10px) !important;
        font-size: clamp(0.70rem, 0.74vw, 0.80rem) !important;
      }
      body.lang-ta .joinbtn {
        padding: 8px 14px !important;
        font-size: 0.82rem !important;
      }
      body.lang-ta .wrap {
        padding: 0 18px !important;
      }
    `;
    document.head.appendChild(s);
    document.querySelectorAll('.langtoggle button')[1].click();
  });
  await page.setViewport({ width: 1280, height: 900 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.resolve(__dirname, 'test_ta_1280_tight.png') });
  await browser.close();
  console.log('Saved test_ta_1280_tight.png');
})();
