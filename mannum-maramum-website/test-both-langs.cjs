const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const FILE_URL = 'file:///' + HTML_FILE.replace(/\\/g, '/');

async function testBothLanguages() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(FILE_URL, { waitUntil: 'networkidle0' });

  for (const lang of ['en', 'ta']) {
    console.log(`\n=================== TESTING LANG: ${lang} ===================`);
    if (lang === 'ta') {
      // Click Tamil toggle button
      await page.evaluate(() => {
        const btns = document.querySelectorAll('.langtoggle button');
        for (const b of btns) {
          if (b.textContent.includes('தமிழ்')) {
            b.click();
            break;
          }
        }
      });
      await new Promise(r => setTimeout(r, 400));
    }

    for (const vp of [1440, 1280, 1024, 768, 480, 360]) {
      await page.setViewport({ width: vp, height: 900 });
      await new Promise(r => setTimeout(r, 300));

      const info = await page.evaluate((vpWidth) => {
        const doc = document.documentElement;
        const body = document.body;
        const nav = document.querySelector('.navbar');
        const hero = document.querySelector('.hero');
        const heroInner = document.querySelector('.hero-inner');
        const impactCard = document.querySelector('.impactcard');
        const brand = document.querySelector('.brand');
        const heroH = document.querySelector('h1.hero-h');

        const getRect = (el) => {
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
        };

        // Check if any element in the entire DOM extends beyond vpWidth or left < 0
        const allEls = document.querySelectorAll('*');
        const overflowing = [];
        for (const el of allEls) {
          if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'LINK', 'BR'].includes(el.tagName)) continue;
          const r = el.getBoundingClientRect();
          if (r.right > vpWidth + 1 || r.left < -1) {
            overflowing.push({
              tag: el.tagName,
              className: typeof el.className === 'string' ? el.className.slice(0, 50) : '',
              left: Math.round(r.left),
              right: Math.round(r.right),
              width: Math.round(r.width)
            });
          }
        }

        return {
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          nav: getRect(nav),
          brand: getRect(brand),
          heroInner: getRect(heroInner),
          heroH: getRect(heroH),
          impactCard: getRect(impactCard),
          overflowCount: overflowing.length,
          topOverflow: overflowing.slice(0, 5)
        };
      }, vp);

      console.log(`[${lang.toUpperCase()}] VP ${vp}px: scrollW=${info.scrollWidth}, clientW=${info.clientWidth}`);
      console.log(`  Nav: ${JSON.stringify(info.nav)}`);
      console.log(`  Brand: ${JSON.stringify(info.brand)}`);
      console.log(`  HeroInner: ${JSON.stringify(info.heroInner)}`);
      console.log(`  HeroH: ${JSON.stringify(info.heroH)}`);
      console.log(`  ImpactCard: ${JSON.stringify(info.impactCard)}`);
      if (info.overflowCount > 0) {
        console.log(`  OVERFLOW COUNT: ${info.overflowCount}:`, info.topOverflow);
      }
    }
  }

  await browser.close();
}

testBothLanguages();
