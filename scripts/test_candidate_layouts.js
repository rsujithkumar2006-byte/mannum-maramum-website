const puppeteer = require('../mannum-maramum-website/node_modules/puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const fs = require('fs');
const path = require('path');

const options = [
  {
    name: 'opt1_stacked_2x2',
    css: `
      .hero-inner {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        max-width: 580px !important;
        margin-left: clamp(28px, 5.5vw, 90px) !important;
        margin-right: auto !important;
        padding-top: clamp(110px, 13vh, 140px) !important;
        padding-bottom: 50px !important;
      }
      .impactcard {
        left: 0 !important;
        margin-top: 28px !important;
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 8px 24px !important;
        padding: 12px 24px !important;
        max-width: 520px !important;
        width: 100% !important;
      }
      .impactcard .impactrow {
        border-bottom: none !important;
        padding: 6px 0 !important;
      }
    `
  },
  {
    name: 'opt2_stacked_4row',
    css: `
      .hero-inner {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        max-width: 540px !important;
        margin-left: clamp(28px, 5.5vw, 90px) !important;
        margin-right: auto !important;
        padding-top: clamp(100px, 12vh, 130px) !important;
        padding-bottom: 40px !important;
      }
      .impactcard {
        left: 0 !important;
        margin-top: 24px !important;
        max-width: 440px !important;
        width: 100% !important;
        padding: 6px 20px !important;
      }
      .impactcard .impactrow {
        padding: 10px 0 !important;
      }
    `
  },
  {
    name: 'opt3_stacked_horizontal_bar',
    css: `
      .hero-inner {
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        max-width: 620px !important;
        margin-left: clamp(28px, 5.5vw, 90px) !important;
        margin-right: auto !important;
        padding-top: clamp(110px, 13vh, 140px) !important;
        padding-bottom: 50px !important;
      }
      .impactcard {
        left: 0 !important;
        margin-top: 28px !important;
        display: grid !important;
        grid-template-columns: repeat(4, 1fr) !important;
        gap: 12px !important;
        padding: 12px 18px !important;
        max-width: 620px !important;
        width: 100% !important;
      }
      .impactcard .impactrow {
        border-bottom: none !important;
        padding: 4px 0 !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 4px !important;
      }
      .impactcard .impactrow .num {
        font-size: 1.15rem !important;
      }
      .impactcard .impactrow .lbl {
        font-size: 0.72rem !important;
      }
    `
  },
  {
    name: 'opt4_grid_left_center',
    css: `
      .hero-inner {
        display: grid !important;
        grid-template-columns: minmax(0, 480px) minmax(0, 320px) !important;
        gap: 28px !important;
        align-items: center !important;
        max-width: 900px !important;
        margin-left: clamp(24px, 4vw, 70px) !important;
        margin-right: auto !important;
        padding-top: clamp(120px, 14vh, 160px) !important;
        padding-bottom: 60px !important;
      }
      .impactcard {
        left: 0 !important;
        max-width: 320px !important;
        width: 100% !important;
        padding: 6px 18px !important;
      }
      .impactcard .impactrow {
        padding: 12px 0 !important;
      }
    `
  }
];

async function testAll() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const opt of options) {
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: opt.css });
    await page.evaluate(() => {
      const el = document.getElementById('heroVolunteerCount');
      if (el) el.textContent = '6L+';
    });
    await new Promise(r => setTimeout(r, 400));
    const filename = `scratch_${opt.name}.png`;
    await page.screenshot({ path: filename });
    console.log(`Saved ${filename}`);
  }

  await browser.close();
}

testAll().catch(console.error);
