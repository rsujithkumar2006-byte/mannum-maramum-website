const puppeteer = require('../mannum-maramum-website/node_modules/puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: 'desktop_1440', w: 1440, h: 900 },
  { name: 'desktop_1280', w: 1280, h: 800 },
  { name: 'tablet_1024',  w: 1024, h: 768 },
  { name: 'tablet_768',   w: 768,  h: 1024 },
  { name: 'mobile_480',   w: 480,  h: 800 },
  { name: 'mobile_375',   w: 375,  h: 667 }
];

const testCSS = `
  .hero-inner {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    max-width: 620px !important;
    margin-left: clamp(20px, 5vw, 84px) !important;
    margin-right: auto !important;
    padding-top: clamp(105px, 13vh, 140px) !important;
    padding-bottom: 50px !important;
    box-sizing: border-box !important;
  }
  .impactcard {
    position: relative !important;
    left: 0 !important;
    margin-top: 28px !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 10px 24px !important;
    background: rgba(14, 42, 30, 0.65) !important;
    border: 1px solid rgba(183, 226, 58, 0.4) !important;
    border-radius: 20px !important;
    padding: 14px 24px !important;
    backdrop-filter: blur(8px) !important;
    max-width: 530px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  .impactcard .impactrow {
    border-bottom: none !important;
    padding: 6px 0 !important;
    display: flex !important;
    align-items: center !important;
    gap: 14px !important;
  }
  .impactcard .impactrow .num {
    font-size: 1.25rem !important;
    font-weight: 800 !important;
    line-height: 1 !important;
    color: #fff !important;
  }
  .impactcard .impactrow .lbl {
    font-size: 0.82rem !important;
    color: rgba(247, 242, 231, 0.8) !important;
    margin-top: 3px !important;
  }

  @media (max-width: 1024px) {
    .hero-inner {
      max-width: 680px !important;
      margin: 0 auto !important;
      padding-top: 110px !important;
      padding-bottom: 60px !important;
      align-items: flex-start !important;
    }
    .impactcard {
      max-width: 540px !important;
      margin-top: 24px !important;
    }
  }

  @media (max-width: 768px) {
    .hero-inner {
      padding: 100px 20px 50px !important;
      max-width: 100% !important;
    }
    .impactcard {
      max-width: 100% !important;
      padding: 12px 18px !important;
      gap: 10px 16px !important;
    }
    .impactcard .impactrow .num {
      font-size: 1.15rem !important;
    }
    .impactcard .impactrow .lbl {
      font-size: 0.78rem !important;
    }
  }

  @media (max-width: 480px) {
    .hero-inner {
      padding: 88px 14px 40px !important;
    }
    .impactcard {
      grid-template-columns: 1fr 1fr !important;
      gap: 10px 12px !important;
      padding: 10px 14px !important;
      border-radius: 16px !important;
    }
    .impactcard .impactrow {
      gap: 10px !important;
    }
    .impactcard .impactrow .num {
      font-size: 1.05rem !important;
    }
    .impactcard .impactrow .lbl {
      font-size: 0.72rem !important;
    }
  }

  @media (max-width: 360px) {
    .impactcard {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }
  }
`;

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    await page.setViewport({ width: vp.w, height: vp.h });
    await page.goto('http://localhost:5000', { waitUntil: 'networkidle0' });
    await page.addStyleTag({ content: testCSS });
    await page.evaluate(() => {
      const el = document.getElementById('heroVolunteerCount');
      if (el) el.textContent = '6L+';
    });
    await new Promise(r => setTimeout(r, 400));

    const check = await page.evaluate(() => {
      return {
        hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
        volText: document.getElementById('heroVolunteerCount')?.textContent
      };
    });

    const file = `scratch_resp_${vp.name}.png`;
    await page.screenshot({ path: file });
    console.log(`${vp.name}: overflow=${check.hasOverflow}, volText=${check.volText}, saved=${file}`);
  }

  // Also test Tamil at 1440px
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => {
    if (typeof window.setLang === 'function') window.setLang('ta');
    const el = document.getElementById('heroVolunteerCount');
    if (el) el.textContent = '6L+';
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scratch_resp_ta_1440.png' });
  console.log('Saved scratch_resp_ta_1440.png');

  await browser.close();
}

run().catch(console.error);
