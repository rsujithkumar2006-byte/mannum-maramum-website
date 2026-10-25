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
    // Test the proposed translation for nav
    T.n_about.ta = 'பற்றி';
    T.n_work.ta = 'பணிகள்';
    T.n_partnership.ta = 'கூட்டாண்மை';

    const s = document.createElement('style');
    s.textContent = `
      .navbar {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        height: 96px !important;
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        gap: clamp(8px, 1.2vw, 16px) !important;
        box-sizing: border-box !important;
      }
      .brand {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex-shrink: 0 !important;
      }
      .brand img {
        width: 50px !important;
        height: 50px !important;
        min-width: 50px !important;
      }
      .navlinks {
        display: flex !important;
        align-items: center !important;
        gap: clamp(6px, 1vw, 16px) !important;
        font-size: clamp(0.76rem, 0.84vw, 0.90rem) !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        flex-shrink: 1 !important;
      }
      body.lang-ta .navlinks {
        gap: clamp(6px, 0.8vw, 12px) !important;
        font-size: clamp(0.72rem, 0.78vw, 0.82rem) !important;
      }
      .headerright {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        flex-shrink: 0 !important;
      }
      .joinbtn {
        padding: 9px 18px !important;
        font-size: 0.84rem !important;
      }
      .wrap {
        padding: 0 24px !important;
      }
    `;
    document.head.appendChild(s);
    setLang('ta');
  });
  await page.setViewport({ width: 1280, height: 900 });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.resolve(__dirname, 'test_ta_1280_clean.png') });
  await browser.close();
  console.log('Saved test_ta_1280_clean.png');
})();
