const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTML_FILE = path.resolve(__dirname, '..', 'Mannum Maramum - Reference Recreation.html');
const FILE_URL = 'file:///' + HTML_FILE.replace(/\\/g, '/');

async function testFull() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(FILE_URL, { waitUntil: 'networkidle0' });

  // Apply complete fix
  await page.evaluate(() => {
    const fixStyle = document.createElement('style');
    fixStyle.id = 'complete-root-cause-fix';
    fixStyle.textContent = `
      html, body {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
        overflow-x: visible !important;
      }

      *, *::before, *::after {
        box-sizing: border-box !important;
      }

      .wrap {
        width: 100% !important;
        max-width: 1300px !important;
        margin: 0 auto !important;
        padding: 0 clamp(16px, 2.5vw, 28px) !important;
        box-sizing: border-box !important;
      }

      header {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        z-index: 30 !important;
        box-sizing: border-box !important;
      }

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
        gap: clamp(8px, 1vw, 12px) !important;
        flex-shrink: 0 !important;
        text-decoration: none !important;
        min-width: 0 !important;
      }

      .brand img, .brand-logo-img {
        width: 52px !important;
        height: 52px !important;
        min-width: 52px !important;
        min-height: 52px !important;
        border-radius: 50% !important;
        flex-shrink: 0 !important;
      }

      .brand .word {
        color: #ffffff !important;
        font-weight: 800 !important;
        line-height: 1.05 !important;
        font-size: 1.02rem !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
      }

      .navlinks {
        display: flex !important;
        align-items: center !important;
        gap: clamp(6px, 1vw, 18px) !important;
        font-size: clamp(0.76rem, 0.84vw, 0.90rem) !important;
        font-weight: 600 !important;
        white-space: nowrap !important;
        flex-shrink: 1 !important;
        min-width: 0 !important;
      }

      body.lang-ta .navlinks {
        gap: clamp(5px, 0.75vw, 12px) !important;
        font-size: clamp(0.70rem, 0.76vw, 0.80rem) !important;
      }

      .headerright {
        display: flex !important;
        align-items: center !important;
        gap: clamp(6px, 0.8vw, 12px) !important;
        flex-shrink: 0 !important;
        min-width: 0 !important;
      }

      .langtoggle {
        display: flex !important;
        gap: 3px !important;
        background: rgba(255, 255, 255, 0.12) !important;
        border-radius: 999px !important;
        padding: 3px !important;
        font-size: 0.78rem !important;
        flex-shrink: 0 !important;
      }

      .langtoggle button {
        border: none !important;
        background: transparent !important;
        color: rgba(255, 255, 255, 0.75) !important;
        padding: 4px 8px !important;
        border-radius: 999px !important;
        cursor: pointer !important;
        font-weight: 700 !important;
      }

      .langtoggle button.on {
        background: var(--lime) !important;
        color: var(--forest-950) !important;
      }

      .joinbtn {
        background: var(--lime) !important;
        color: var(--forest-950) !important;
        font-weight: 800 !important;
        padding: 9px clamp(12px, 1.2vw, 20px) !important;
        border-radius: 999px !important;
        font-size: 0.84rem !important;
        white-space: nowrap !important;
        flex-shrink: 0 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .burger {
        display: none !important;
        background: rgba(255, 255, 255, 0.12) !important;
        border: 1px solid rgba(255, 255, 255, 0.22) !important;
        color: #ffffff !important;
        width: 42px !important;
        height: 42px !important;
        border-radius: 12px !important;
        font-size: 1.2rem !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        flex-shrink: 0 !important;
      }

      /* Switch to hamburger at 1080px (covers 1024px before navbar crowds) */
      @media (max-width: 1080px) {
        .navlinks { display: none !important; }
        .burger { display: flex !important; }
      }

      @media (max-width: 640px) {
        .joinbtn { display: none !important; }
      }

      @media (max-width: 480px) {
        .navbar { height: 72px !important; }
        .brand img, .brand-logo-img {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
        }
        .brand .word { font-size: 0.85rem !important; }
        .burger { width: 38px !important; height: 38px !important; font-size: 1.1rem !important; }
      }

      /* Mobile Navigation Overlay / Drawer */
      .mobilenav {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(10, 31, 21, 0.98);
        backdrop-filter: blur(14px);
        z-index: 100;
        padding: 24px 20px;
        flex-direction: column;
        justify-content: space-between;
        overflow-y: auto;
      }
      .mobilenav.open {
        display: flex !important;
      }
      .mobilenav-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      }
      .mobilenav-title {
        color: #ffffff;
        font-size: 1.1rem;
        font-weight: 800;
        letter-spacing: 0.05em;
      }
      .mobilenav-close {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        font-size: 1.4rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mobilenav-links {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 20px 0;
      }
      .mobilenav-links a {
        color: #ffffff;
        font-size: 1.05rem;
        font-weight: 700;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        transition: color 0.2s;
      }
      .mobilenav-links a:hover, .mobilenav-links a.active {
        color: var(--lime);
      }
      .mobilenav-actions {
        padding-top: 14px;
      }
      .mob-joinbtn {
        width: 100% !important;
        text-align: center !important;
        padding: 14px !important;
        font-size: 0.95rem !important;
      }

      /* Hero Section */
      .hero {
        position: relative !important;
        min-height: 100vh !important;
        width: 100% !important;
        max-width: 100% !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        background-color: var(--forest-950) !important;
        box-sizing: border-box !important;
      }

      .hero img.bg, .hero svg.bg {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center !important;
        pointer-events: none !important;
      }

      .hero-inner {
        position: relative !important;
        z-index: 2 !important;
        display: grid !important;
        grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) !important;
        gap: clamp(20px, 3.5vw, 44px) !important;
        align-items: center !important;
        padding: clamp(120px, 14vh, 160px) clamp(16px, 2.5vw, 28px) clamp(60px, 8vh, 100px) !important;
        max-width: 1300px !important;
        margin: 0 auto !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }

      .hero-inner > * {
        min-width: 0 !important;
        max-width: 100% !important;
      }

      h1.hero-h {
        font-size: clamp(2.1rem, 4.8vw, 4.8rem) !important;
        line-height: 0.98 !important;
        font-weight: 800 !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        max-width: 100% !important;
      }

      .hero p.desc {
        max-width: 500px !important;
        width: 100% !important;
        box-sizing: border-box !important;
        font-size: clamp(0.92rem, 1.1vw, 1.05rem) !important;
      }

      .herobtns {
        display: flex !important;
        align-items: center !important;
        gap: 16px !important;
        flex-wrap: wrap !important;
        max-width: 100% !important;
      }

      .impactcard {
        background: rgba(14, 42, 30, 0.55) !important;
        border: 1px solid rgba(183, 226, 58, 0.35) !important;
        border-radius: 22px !important;
        padding: 8px 24px !important;
        backdrop-filter: blur(6px) !important;
        width: 100% !important;
        max-width: 520px !important;
        box-sizing: border-box !important;
      }

      @media (max-width: 1024px) {
        .hero-inner {
          grid-template-columns: 1fr !important;
          gap: 36px !important;
          padding-top: 110px !important;
          padding-bottom: 60px !important;
        }
        .impactcard {
          max-width: 540px !important;
          margin: 0 auto !important;
        }
      }

      @media (max-width: 768px) {
        .hero-inner {
          gap: 30px !important;
          padding-top: 100px !important;
          padding-bottom: 50px !important;
        }
        .impactcard {
          max-width: 100% !important;
          padding: 8px 18px !important;
        }
      }

      @media (max-width: 480px) {
        .hero-inner {
          padding: 88px 14px 40px !important;
          gap: 24px !important;
        }
        h1.hero-h {
          font-size: clamp(1.8rem, 8.5vw, 2.3rem) !important;
        }
        .impactcard {
          padding: 6px 14px !important;
          border-radius: 16px !important;
        }
        .impactrow {
          padding: 12px 0 !important;
          gap: 12px !important;
        }
        .impactrow .num {
          font-size: 1.15rem !important;
        }
      }

      @media (max-width: 360px) {
        .hero-inner {
          padding: 80px 10px 30px !important;
        }
        h1.hero-h {
          font-size: 1.7rem !important;
        }
        .btn-cream {
          padding: 12px 18px !important;
          font-size: 0.85rem !important;
        }
      }

      /* Gen-Z Section */
      @media (max-width: 540px) {
        .genzgrid {
          grid-template-columns: 1fr !important;
        }
        .genz {
          padding: 50px 16px !important;
        }
      }

      .genztile {
        min-width: 0 !important;
        box-sizing: border-box !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }

      /* Partnership Section */
      @media (max-width: 640px) {
        .mmi-partnership-section {
          padding: 50px 14px !important;
        }
        .mmi-part-card {
          padding: 20px 14px !important;
          border-radius: 16px !important;
        }
        .mmi-part-wrap {
          max-width: 100% !important;
        }
        .mmi-field-group {
          min-width: 0 !important;
          max-width: 100% !important;
        }
        .mmi-input, .mmi-select, .mmi-textarea {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          min-width: 0 !important;
        }
        .mmi-contrib-box {
          padding: 12px !important;
          box-sizing: border-box !important;
          max-width: 100% !important;
        }
        .mmi-contrib-summary-table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .mmi-contrib-summary-table td {
          padding: 8px 8px !important;
          font-size: 0.78rem !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .mmi-contrib-tbl-lbl {
          width: 48% !important;
        }
      }
    `;
    document.head.appendChild(fixStyle);
  });

  const viewports = [1440, 1280, 1024, 768, 480, 360];

  for (const lang of ['en', 'ta']) {
    console.log(`\n=================== TESTING & CAPTURING: ${lang.toUpperCase()} ===================`);
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
      await new Promise(r => setTimeout(r, 200));

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
              cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 3).join('.') : '',
              left: Math.round(r.left * 10) / 10,
              right: Math.round(r.right * 10) / 10,
              width: Math.round(r.width * 10) / 10,
              scrollW: el.scrollWidth
            });
          }
        }

        const nav = document.querySelector('.navbar');
        const heroInner = document.querySelector('.hero-inner');
        const impactCard = document.querySelector('.impactcard');
        const brand = document.querySelector('.brand');

        return {
          vpWidth,
          scrollW,
          clientW,
          hasOverflow: scrollW > clientW,
          overCount: over.length,
          overItems: over.slice(0, 5),
          navRight: nav ? Math.round(nav.getBoundingClientRect().right) : null,
          brandLeft: brand ? Math.round(brand.getBoundingClientRect().left) : null,
          heroInnerWidth: heroInner ? Math.round(heroInner.getBoundingClientRect().width) : null,
          impactCardRight: impactCard ? Math.round(impactCard.getBoundingClientRect().right) : null,
        };
      }, vp);

      console.log(`[${lang.toUpperCase()}] ${vp}px: scrollW=${report.scrollW}, clientW=${report.clientW}, overflow=${report.hasOverflow}`);
      console.log(`  BrandLeft=${report.brandLeft}, NavRight=${report.navRight}, HeroInnerW=${report.heroInnerWidth}, ImpactCardR=${report.impactCardRight}`);
      if (report.hasOverflow || report.overCount > 0) {
        console.log(`  FAILED! Overflows:`, report.overItems);
      }

      // Save screenshot
      const shotPath = path.resolve(__dirname, `screenshot_${lang}_${vp}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });
      console.log(`  Saved screenshot: ${shotPath}`);
    }
  }

  await browser.close();
}

testFull();
