const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const FILE_URL = 'file:///' + HTML_FILE.replace(/\\/g, '/');

async function debug() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(FILE_URL, { waitUntil: 'networkidle0' });

  // Test across viewports
  for (const vp of [1440, 1280, 1024, 768, 480, 360]) {
    await page.setViewport({ width: vp, height: 900 });
    await new Promise(r => setTimeout(r, 400));

    const result = await page.evaluate((vpWidth) => {
      // Inject style to strip ALL overflow hidden/clip
      const testStyle = document.createElement('style');
      testStyle.id = 'overflow-remover';
      testStyle.textContent = `
        html, body, header, .hero, .wrap, .navbar, .hero-inner, main, section, div {
          overflow-x: visible !important;
        }
      `;
      document.head.appendChild(testStyle);

      const doc = document.documentElement;
      const body = document.body;

      const scrollW = doc.scrollWidth;
      const clientW = doc.clientWidth;
      const bodyScrollW = body.scrollWidth;

      const overflowingEls = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'LINK', 'BR'].includes(el.tagName)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.right > vpWidth + 1 || rect.left < -1 || el.scrollWidth > vpWidth + 1) {
          overflowingEls.push({
            tag: el.tagName,
            id: el.id,
            className: typeof el.className === 'string' ? el.className.slice(0, 60) : '',
            rectLeft: Math.round(rect.left),
            rectRight: Math.round(rect.right),
            rectWidth: Math.round(rect.width),
            scrollWidth: el.scrollWidth,
            parentTag: el.parentElement ? el.parentElement.tagName : '',
            parentClass: el.parentElement && typeof el.parentElement.className === 'string' ? el.parentElement.className.slice(0, 40) : ''
          });
        }
      }

      testStyle.remove();

      return {
        vpWidth,
        scrollW,
        clientW,
        bodyScrollW,
        overflowCount: overflowingEls.length,
        items: overflowingEls.slice(0, 25)
      };
    }, vp);

    console.log(`\n=== VP ${vp}px ===`);
    console.log(`scrollW: ${result.scrollW}, clientW: ${result.clientW}, bodyScrollW: ${result.bodyScrollW}, overflowCount: ${result.overflowCount}`);
    if (result.items.length > 0) {
      console.log('Top overflowing elements:');
      for (const it of result.items) {
        console.log(`  <${it.tag} class="${it.className}" id="${it.id}"> left:${it.rectLeft} right:${it.rectRight} width:${it.rectWidth} scrollW:${it.scrollWidth} [parent: <${it.parentTag} class="${it.parentClass}">]`);
      }
    }
  }

  await browser.close();
}

debug();
