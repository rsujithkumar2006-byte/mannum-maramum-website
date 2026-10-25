const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE = path.resolve(__dirname, '..', 'Mannum Maramum — Reference Recreation.html');
const FILE_URL = 'file:///' + HTML_FILE.replace(/\\/g, '/');

const VIEWPORTS = [
  { width: 1440, height: 900, name: '1440px' },
  { width: 1280, height: 800, name: '1280px' },
  { width: 1024, height: 768, name: '1024px' },
  { width: 768, height: 1024, name: '768px' },
  { width: 480, height: 800, name: '480px' },
  { width: 360, height: 740, name: '360px' },
];

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Loading:', FILE_URL);
  await page.goto(FILE_URL, { waitUntil: 'networkidle0' });

  for (const vp of VIEWPORTS) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise(r => setTimeout(r, 500));

    const analysis = await page.evaluate((vpWidth) => {
      const docEl = document.documentElement;
      const body = document.body;
      const scrollWidth = docEl.scrollWidth;
      const clientWidth = docEl.clientWidth;
      const bodyScrollWidth = body.scrollWidth;

      // Find overflowing elements
      const overflowing = [];
      const allEls = document.querySelectorAll('*');
      for (const el of allEls) {
        const rect = el.getBoundingClientRect();
        if (rect.right > vpWidth + 1 || rect.left < -1) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 50) : '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth
          });
        }
      }

      // Check header / navbar / hero
      const nav = document.querySelector('.navbar');
      const hero = document.querySelector('.hero');
      const heroInner = document.querySelector('.hero-inner');
      const impactCard = document.querySelector('.impactcard');
      const brand = document.querySelector('.brand');

      return {
        vpWidth,
        scrollWidth,
        clientWidth,
        bodyScrollWidth,
        hasHorizontalScroll: scrollWidth > clientWidth,
        overflowingCount: overflowing.length,
        topOverflowing: overflowing.slice(0, 10),
        navRect: nav ? nav.getBoundingClientRect() : null,
        brandRect: brand ? brand.getBoundingClientRect() : null,
        heroInnerRect: heroInner ? heroInner.getBoundingClientRect() : null,
        impactCardRect: impactCard ? impactCard.getBoundingClientRect() : null,
      };
    }, vp.width);

    console.log(`\n=== Viewport ${vp.name} ===`);
    console.log(`scrollWidth: ${analysis.scrollWidth}, clientWidth: ${analysis.clientWidth}, hasOverflow: ${analysis.hasHorizontalScroll}`);
    console.log(`Navbar rect:`, analysis.navRect ? `L:${analysis.navRect.left}, R:${analysis.navRect.right}, W:${analysis.navRect.width}` : 'none');
    console.log(`Brand rect:`, analysis.brandRect ? `L:${analysis.brandRect.left}, R:${analysis.brandRect.right}` : 'none');
    console.log(`HeroInner rect:`, analysis.heroInnerRect ? `L:${analysis.heroInnerRect.left}, R:${analysis.heroInnerRect.right}, W:${analysis.heroInnerRect.width}` : 'none');
    console.log(`ImpactCard rect:`, analysis.impactCardRect ? `L:${analysis.impactCardRect.left}, R:${analysis.impactCardRect.right}` : 'none');
    if (analysis.overflowingCount > 0) {
      console.log(`Found ${analysis.overflowingCount} overflowing elements:`);
      for (const item of analysis.topOverflowing) {
        console.log(`  <${item.tag} id="${item.id}" class="${item.className}"> L:${item.left} R:${item.right} W:${item.width}`);
      }
    }

    const outImg = path.resolve(__dirname, `screenshot_${vp.width}.png`);
    await page.screenshot({ path: outImg, fullPage: false });
    console.log(`Saved screenshot: ${outImg}`);
  }

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
