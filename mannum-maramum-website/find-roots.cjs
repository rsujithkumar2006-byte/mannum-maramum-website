const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const FILE_URL = 'file:///' + HTML_FILE.replace(/\\/g, '/');

async function findEveryRootCause() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(FILE_URL, { waitUntil: 'networkidle0' });

  // Remove any overflow-x: clip/hidden from stylesheet so we find REAL root causes
  await page.evaluate(() => {
    const style = document.createElement('style');
    style.id = 'root-cause-detector';
    style.textContent = `
      html, body {
        overflow-x: visible !important;
      }
    `;
    document.head.appendChild(style);
  });

  const viewports = [1440, 1280, 1024, 768, 480, 360];

  for (const lang of ['en', 'ta']) {
    console.log(`\n======================================================`);
    console.log(`CHECKING ALL ROOT CAUSES FOR: ${lang.toUpperCase()}`);
    console.log(`======================================================`);

    if (lang === 'ta') {
      await page.evaluate(() => {
        const btns = document.querySelectorAll('.langtoggle button');
        for (const b of btns) {
          if (b.textContent.includes('தமிழ்')) b.click();
        }
      });
      await new Promise(r => setTimeout(r, 400));
    }

    for (const vp of viewports) {
      await page.setViewport({ width: vp, height: 900 });
      await new Promise(r => setTimeout(r, 300));

      const report = await page.evaluate((vpWidth) => {
        const doc = document.documentElement;
        const scrollW = doc.scrollWidth;
        const clientW = doc.clientWidth;

        const over = [];
        const els = document.querySelectorAll('body *');
        for (const el of els) {
          if (['SCRIPT', 'STYLE', 'HEAD', 'META', 'TITLE', 'LINK', 'BR'].includes(el.tagName)) continue;
          const r = el.getBoundingClientRect();
          if (r.right > vpWidth + 0.5 || r.left < -0.5 || el.scrollWidth > vpWidth + 0.5) {
            over.push({
              tag: el.tagName,
              id: el.id,
              cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '',
              left: Math.round(r.left * 10) / 10,
              right: Math.round(r.right * 10) / 10,
              width: Math.round(r.width * 10) / 10,
              scrollW: el.scrollWidth,
              text: el.textContent ? el.textContent.trim().slice(0, 30) : ''
            });
          }
        }

        return {
          vpWidth,
          scrollW,
          hasOverflow: scrollW > clientW,
          overCount: over.length,
          overItems: over
        };
      }, vp);

      console.log(`\n--- ${lang.toUpperCase()} at ${vp}px: scrollW=${report.scrollW} (overflow: ${report.hasOverflow}) ---`);
      if (report.overCount > 0) {
        console.log(`Found ${report.overCount} overflowing elements:`);
        // Group by classes/tags to avoid clutter
        const seen = new Set();
        for (const item of report.overItems) {
          const key = `${item.tag}.${item.cls}`;
          if (!seen.has(key)) {
            seen.add(key);
            console.log(`  <${item.tag} class="${item.cls}" id="${item.id}"> left:${item.left} right:${item.right} w:${item.width} scrollW:${item.scrollW} text:"${item.text}"`);
          }
        }
      } else {
        console.log(`  No overflowing elements at ${vp}px!`);
      }
    }
  }

  await browser.close();
}

findEveryRootCause();
