// End-to-end browser test using Microsoft Edge via playwright-core (Module 1-6 Viva Verification)
import { chromium } from 'playwright-core';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function verifyScrollContainment(browser, targetPath, pageName) {
  const viewports = [
    { width: 1916, height: 870 },
    { width: 1536, height: 730 },
    { width: 1366, height: 768 },
    { width: 1280, height: 600 }
  ];

  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:3000${targetPath}`);
    await p.waitForSelector('.parcels-scroll-area');

    // 1. Hover over left list and mouse wheel
    const leftList = p.locator('.parcels-scroll-area');
    await leftList.hover();
    for (let i = 0; i < 4; i++) {
      await p.mouse.wheel(0, 3000);
      await p.waitForTimeout(80);
    }

    const leftMetrics = await p.evaluate(() => {
      const list = document.querySelector('.parcels-scroll-area');
      const nav = document.querySelector('.top-bar-outer') || document.querySelector('.top-bar');
      const main = document.querySelector('.app-main-content');
      const scroller = document.scrollingElement || document.documentElement;
      return {
        listScrollTop: list ? list.scrollTop : 0,
        listScrollHeight: list ? list.scrollHeight : 0,
        listClientHeight: list ? list.clientHeight : 0,
        windowScrollY: window.scrollY,
        docScrollTop: scroller.scrollTop,
        navTop: nav ? nav.getBoundingClientRect().top : -1,
        mainBottom: main ? main.getBoundingClientRect().bottom : -1,
        windowHeight: window.innerHeight
      };
    });

    if (pageName === 'My parcels') {
      assert(leftMetrics.listScrollTop > 0, `[${vp.width}x${vp.height}] My parcels list scrollTop should be > 0, got ${leftMetrics.listScrollTop}`);
      const cards = await p.$$('.parcel-card');
      const lastCard = cards[cards.length - 1];
      const lastCardBox = await lastCard.boundingBox();
      const listBox = await leftList.boundingBox();
      assert(
        lastCardBox.y + lastCardBox.height <= listBox.y + listBox.height + 2,
        `[${vp.width}x${vp.height}] Last parcel card bottom (${lastCardBox.y + lastCardBox.height}) should be <= list bottom + 2 (${listBox.y + listBox.height + 2})`
      );
    } else if (leftMetrics.listScrollHeight > leftMetrics.listClientHeight) {
      assert(leftMetrics.listScrollTop > 0, `[${vp.width}x${vp.height}] Pickup spots list scrollTop should be > 0`);
    }

    assert.strictEqual(leftMetrics.windowScrollY, 0, `[${vp.width}x${vp.height}] window.scrollY must be 0 after wheeling left list on ${pageName}`);
    assert.strictEqual(leftMetrics.docScrollTop, 0, `[${vp.width}x${vp.height}] document.scrollingElement.scrollTop must be 0`);
    assert.strictEqual(Math.round(leftMetrics.navTop), 0, `[${vp.width}x${vp.height}] Navbar top must be 0`);
    assert(Math.abs(leftMetrics.mainBottom - leftMetrics.windowHeight) <= 1, `[${vp.width}x${vp.height}] Main area bottom (${leftMetrics.mainBottom}) must equal window.innerHeight (${leftMetrics.windowHeight})`);

    // 2. Hover over right pane and mouse wheel
    const rightPane = p.locator('.map-detail-pane');
    await rightPane.hover();
    for (let i = 0; i < 4; i++) {
      await p.mouse.wheel(0, 3000);
      await p.waitForTimeout(80);
    }

    const rightMetrics = await p.evaluate(() => {
      const pane = document.querySelector('.map-detail-pane');
      const nav = document.querySelector('.top-bar-outer') || document.querySelector('.top-bar');
      const main = document.querySelector('.app-main-content');
      const scroller = document.scrollingElement || document.documentElement;
      return {
        paneScrollTop: pane ? pane.scrollTop : 0,
        paneScrollHeight: pane ? pane.scrollHeight : 0,
        paneClientHeight: pane ? pane.clientHeight : 0,
        windowScrollY: window.scrollY,
        docScrollTop: scroller.scrollTop,
        navTop: nav ? nav.getBoundingClientRect().top : -1,
        mainBottom: main ? main.getBoundingClientRect().bottom : -1,
        windowHeight: window.innerHeight
      };
    });

    if (rightMetrics.paneScrollHeight > rightMetrics.paneClientHeight) {
      assert(rightMetrics.paneScrollTop > 0, `[${vp.width}x${vp.height}] Right pane scrollTop should be > 0 on ${pageName}`);
    }
    assert.strictEqual(rightMetrics.windowScrollY, 0, `[${vp.width}x${vp.height}] window.scrollY must be 0 after wheeling right pane on ${pageName}`);
    assert.strictEqual(rightMetrics.docScrollTop, 0, `[${vp.width}x${vp.height}] document.scrollingElement.scrollTop must be 0`);
    assert.strictEqual(Math.round(rightMetrics.navTop), 0, `[${vp.width}x${vp.height}] Navbar top must be 0`);
    assert(Math.abs(rightMetrics.mainBottom - rightMetrics.windowHeight) <= 1, `[${vp.width}x${vp.height}] Main area bottom (${rightMetrics.mainBottom}) must equal window.innerHeight (${rightMetrics.windowHeight})`);

    await ctx.close();
  }
}

async function runE2E() {
  console.log('--- Starting ParcelTrail End-to-End Browser Tests ---');

  // Reset database before tests
  console.log('[Setup] Resetting demo data on backend...');
  const resetRes = await fetch('http://localhost:5000/api/parcels/reset', { method: 'POST' });
  assert.strictEqual(resetRes.status, 200, 'Reset endpoint should return 200');

  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch (err) {
    console.error('Browser launch error:', err.message);
    console.log('NOTICE: Edge browser launch blocked by environment. Skipping browser suite.');
    return;
  }

  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();

  const consoleErrors = [];
  const failedRequests = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', (req) => {
    failedRequests.push(`${req.method()} ${req.url()}: ${req.failure() ? req.failure().errorText : 'failed'}`);
  });

  try {
    // 1. Home Page
    console.log('[Test 1] Testing Home page...');
    await page.goto('http://localhost:3000/');
    await page.waitForSelector('.hero-title');
    const heroTitle = await page.textContent('.hero-title');
    assert(heroTitle.includes('Know who touched your parcel'), 'Hero title text mismatch');
    const stepCards = await page.$$('.step-card');
    assert.strictEqual(stepCards.length, 3, 'Home should show 3 step cards');

    // Visual check: navbar height is 76px
    const navHeight = await page.evaluate(() => {
      const el = document.querySelector('.top-bar-outer') || document.querySelector('.top-bar');
      return el ? el.offsetHeight : 0;
    });
    assert.strictEqual(navHeight, 76, 'Navbar height should be 76px, got ' + navHeight);

    // Visual check: heading font family includes Fraunces
    const h1Font = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? window.getComputedStyle(h1).fontFamily : '';
    });
    assert(h1Font.toLowerCase().includes('fraunces'), 'Heading should use Fraunces font: ' + h1Font);

    // Visual check: step cards width and button background
    const cardBoxes = await Promise.all(stepCards.map((c) => c.boundingBox()));
    assert(cardBoxes.every((b) => b && b.width > 200), 'Each step card should be over 200px wide');
    const maxDiff = Math.max(...cardBoxes.map((b) => b.width)) - Math.min(...cardBoxes.map((b) => b.width));
    assert(maxDiff < 30, 'Step cards should have similar widths (diff < 30px, got ' + maxDiff + ')');

    const btnBg = await page.evaluate(() => {
      const btn = document.querySelector('.btn');
      return btn ? window.getComputedStyle(btn).backgroundColor : '';
    });
    assert(btnBg && btnBg !== 'rgba(0, 0, 0, 0)' && btnBg !== 'transparent', '.btn should have non-default background colour: ' + btnBg);

    // Visual check: no button has default browser grey background or outset border
    const badButtons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).filter((b) => {
        const cs = window.getComputedStyle(b);
        return cs.backgroundColor === 'rgb(239, 239, 239)' || cs.borderStyle === 'outset';
      }).length;
    });
    assert.strictEqual(badButtons, 0, 'No button should have default browser grey background or outset border');

    // Visual check: Brand title and subtitle bounding boxes do not overlap and have text-decoration none
    const brandTitleBox = await page.locator('.brand-name').boundingBox();
    const brandSubBox = await page.locator('.brand-sub').boundingBox();
    assert(brandTitleBox && brandSubBox, 'Brand title and subtitle must both be visible');
    assert(brandSubBox.y >= brandTitleBox.y + brandTitleBox.height - 2,
      `Subtitle should sit below title (sub top: ${brandSubBox.y} >= title bottom: ${brandTitleBox.y + brandTitleBox.height})`);
    const brandDecorations = await page.evaluate(() => {
      const name = window.getComputedStyle(document.querySelector('.brand-name')).textDecorationLine;
      const sub = window.getComputedStyle(document.querySelector('.brand-sub')).textDecorationLine;
      return { name, sub };
    });
    assert.strictEqual(brandDecorations.name, 'none', 'Brand title should have text-decoration none');
    assert.strictEqual(brandDecorations.sub, 'none', 'Brand subtitle should have text-decoration none');

    // Visual check: Hero badge is fully inside viewport and not clipped
    const badgeBox = await page.locator('.status-float-pill').boundingBox();
    assert(badgeBox, 'Status float pill badge must be visible');
    assert(badgeBox.y >= 0 && badgeBox.x >= 0, 'Badge must be fully inside viewport');
    const badgeInsideAncestors = await page.evaluate(() => {
      const el = document.querySelector('.status-float-pill');
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    });
    assert(badgeInsideAncestors, 'Badge must not be clipped by container boundaries');

    await page.screenshot({ path: path.join(screenshotsDir, '01-home.png') });
    console.log('PASS: Home page verified');

    // 2. My Parcels List & Filters
    console.log('[Test 2] Testing My Parcels list & filters...');
    await page.goto('http://localhost:3000/my-parcels');
    await page.waitForSelector('.parcel-card');
    const initialCards = await page.$$('.parcel-card');
    assert.strictEqual(initialCards.length, 12, 'Expected 12 initial parcels');

    // Search "phone"
    await page.fill('.quiet-search-input', 'phone');
    await page.waitForTimeout(300);
    const searchCards = await page.$$('.parcel-card');
    assert(searchCards.length >= 1, 'Search for phone should match parcels including Phone Cover');

    // Clear search and test filter
    await page.fill('.quiet-search-input', '');
    await page.selectOption('.quiet-select-input', 'picked');
    await page.waitForTimeout(300);
    const pickedCards = await page.$$('.parcel-card');
    assert(pickedCards.length >= 1, 'Should find picked up parcels');

    // Reset filter to all
    await page.selectOption('.quiet-select-input', 'all');
    await page.waitForTimeout(300);

    // Visual layout checks: map height, no overlap, mailbox caption/reset separation, button green
    await page.waitForSelector('iframe.map-frame');
    const myMapBox = await page.locator('iframe.map-frame').boundingBox();
    assert(myMapBox && myMapBox.height > 250, 'My parcels map iframe height should be > 250px');

    await page.waitForSelector('.journey-strip-card');
    const myStripBox = await page.locator('.journey-strip-card').boundingBox();
    assert(myStripBox && myMapBox && myStripBox.y >= myMapBox.y + myMapBox.height - 2,
      'JourneyStrip must sit below map iframe on My parcels (strip top: ' + myStripBox?.y + ' >= map bottom: ' + (myMapBox ? myMapBox.y + myMapBox.height : 0) + ')');

    await page.waitForSelector('.parcel-summary-card');
    const summaryCardBox = await page.locator('.parcel-summary-card').boundingBox();
    assert(summaryCardBox && myStripBox && summaryCardBox.y >= myStripBox.y + myStripBox.height - 2,
      'Parcel detail card must sit below JourneyStrip (card top: ' + summaryCardBox?.y + ' >= strip bottom: ' + (myStripBox ? myStripBox.y + myStripBox.height : 0) + ')');

    const captionEl = page.locator('.mailbox-status-widget .small');
    const resetBtnEl = page.locator('.mailbox-dock-card button, .btn-outline-green');
    if (await captionEl.count() > 0 && await resetBtnEl.count() > 0) {
      const capBox = await captionEl.first().boundingBox();
      const resBox = await resetBtnEl.first().boundingBox();
      assert(capBox && resBox && resBox.y >= capBox.y + capBox.height,
        'Reset button must not overlap mailbox caption (reset top: ' + resBox?.y + ' >= caption bottom: ' + (capBox ? capBox.y + capBox.height : 0) + ')');
    }

    const btnColor = await page.evaluate(() => {
      const b = document.querySelector('.btn-primary-action, .btn-primary, .btn-solid-green');
      return b ? window.getComputedStyle(b).backgroundColor : '';
    });
    assert(btnColor.includes('15, 107, 92') || btnColor.includes('0f6b5c') || btnColor.includes('27, 127, 75'), 'Button background should be brand teal (#0f6b5c), got ' + btnColor);

    // Multi-viewport real mouse wheel scroll containment check (1916x870, 1536x730, 1366x768, 1280x600)
    await verifyScrollContainment(browser, '/my-parcels', 'My parcels');

    await page.screenshot({ path: path.join(screenshotsDir, '02-my-parcels.png') });
    console.log('PASS: My Parcels list & filters verified');

    // 3. Phone Cover Story
    console.log('[Test 3] Testing Phone Cover story (drop -> lock -> photo -> flash -> shake -> pass -> collect)...');
    await page.click('text="Phone Cover"');
    await page.waitForTimeout(300);

    // Open options
    await page.click('text="More options"');
    await page.waitForSelector('.slide-panel-inner');

    // Courier drops parcel and verify journey dot updates
    await page.waitForSelector('.journey-strip-card');
    const dotBeforeDrop = await page.locator('.journey-dot').evaluate((el) => el.style.left);
    await page.click('text="Courier drops a parcel"');
    await page.waitForTimeout(500);
    const dotAfterDrop = await page.locator('.journey-dot').evaluate((el) => el.style.left);
    assert.notStrictEqual(dotAfterDrop, dotBeforeDrop, 'Journey dot position should update after parcel drop');

    // Lock mailbox
    await page.click('text="Lock the mailbox"');
    await page.waitForTimeout(400);

    // Take a photo
    await page.click('text="Take a photo"');
    await page.waitForSelector('.photo-preview-box');

    // Flash on / off
    await page.click('text="Flash on / off"');
    await page.waitForTimeout(300);

    // Shake mailbox (tamper)
    await page.click('text="Shake the mailbox"');
    await page.waitForTimeout(400);

    // Close options panel
    await page.click('button.close-text-btn:has-text("Close")');
    await page.waitForTimeout(300);

    // Open pickup pass
    await page.click('.parcel-summary-card button.btn-primary-action');
    await page.waitForSelector('input[placeholder="e.g. Meera"]');

    // Create pass for Meera
    await page.fill('input[placeholder="e.g. Meera"]', 'Meera');
    await page.click('button:has-text("Create code")');
    await page.waitForSelector('.code-value');

    const rawCodeText = (await page.textContent('.code-value')).trim();
    const generatedCode = rawCodeText.replace(/\s+/g, '');
    assert.strictEqual(generatedCode.length, 6, 'Generated code should be 6 digits: ' + rawCodeText);

    // Try wrong code
    await page.fill('.keypad-input', '000000');
    await page.click('button:has-text("Open the mailbox")');
    await page.waitForSelector('.panel-error-line');
    const wrongMsg = await page.textContent('.panel-error-line');
    assert(wrongMsg.includes('Wrong code') && wrongMsg.includes('2 tries left'), 'Wrong code message mismatch: ' + wrongMsg);

    // Enter correct code
    await page.fill('.keypad-input', generatedCode);
    await page.click('button:has-text("Open the mailbox")');
    await page.waitForSelector('.panel-success-line');
    const successMsg = await page.textContent('.panel-success-line');
    assert(successMsg.includes('Mailbox opened. Parcel picked up.'), 'Success message mismatch: ' + successMsg);

    await page.screenshot({ path: path.join(screenshotsDir, '03-phone-cover-story.png') });
    console.log('PASS: Phone Cover story verified');

    // 4. History List & Table Views
    console.log('[Test 4] Testing History panel list and table views...');
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(300);
    await page.click('text="See history"');
    await page.waitForSelector('.timeline-container');
    const timelineItems = await page.$$('.timeline-item');
    assert(timelineItems.length > 0, 'Timeline should display events');

    // Switch to table view
    await page.click('button:has-text("Table")');
    await page.waitForSelector('.table-responsive table');
    const tableRows = await page.$$('table tbody tr');
    assert(tableRows.length > 0, 'History table should display event rows');

    // Switch back to list
    await page.click('button:has-text("List")');
    await page.click('button:has-text("Close")');
    await page.screenshot({ path: path.join(screenshotsDir, '04-history-views.png') });
    console.log('PASS: History List and Table views verified');

    // 5. Report Problem Form Validation
    console.log('[Test 5] Testing Report problem form validation...');
    await page.click('text="More options"');
    await page.waitForSelector('.panel-textarea');

    // 5 characters - should fail validation
    await page.fill('.panel-textarea', 'Error');
    await page.click('button:has-text("Send report")');
    await page.waitForSelector('.panel-error-line');
    const errorText = await page.textContent('.panel-error-line');
    assert(errorText.includes('at least 10 characters'), 'Report error validation mismatch');

    // 15 characters - should succeed
    await page.fill('.panel-textarea', 'Damage to corner of the package');
    await page.click('button:has-text("Send report")');
    await page.waitForSelector('.panel-success-line');
    const reportSuccess = await page.textContent('.panel-success-line');
    assert(reportSuccess.includes('Report recorded'), 'Report success message mismatch');
    await page.click('button.close-text-btn:has-text("Close")');
    await page.screenshot({ path: path.join(screenshotsDir, '05-report-problem.png') });
    console.log('PASS: Report problem form validation verified');

    // 6. Add Parcel
    console.log('[Test 6] Testing Add parcel form...');
    await page.click('text="+ Add a parcel"');
    await page.waitForSelector('input[placeholder*="Item description"]');
    await page.fill('input[placeholder*="Item description"]', 'Wireless Keyboard');
    await page.fill('input[placeholder*="Sender"]', 'Keychron Official');
    await page.click('button:has-text("Save parcel")');
    await page.waitForTimeout(500);
    const hasKeyboard = await page.textContent('body');
    assert(hasKeyboard.includes('Wireless Keyboard'), 'New parcel should appear in list');
    await page.screenshot({ path: path.join(screenshotsDir, '06-add-parcel.png') });
    console.log('PASS: Add parcel verified');

    // 7. Delete Record
    console.log('[Test 7] Testing Delete record...');
    // Dialog auto-confirm
    page.once('dialog', async (dialog) => {
      await dialog.accept();
    });
    await page.click('text="Phone Cover"');
    await page.waitForTimeout(300);
    await page.click('text="More options"');
    await page.waitForSelector('text="Delete this record"');
    await page.click('text="Delete this record"');
    await page.waitForTimeout(500);
    const bodyAfterDelete = await page.textContent('.parcels-scroll-area');
    assert(!bodyAfterDelete.includes('Phone Cover'), 'Phone Cover should be removed after deletion');
    await page.screenshot({ path: path.join(screenshotsDir, '07-delete-record.png') });
    console.log('PASS: Delete record verified');

    // 8. Pickup Spots Page
    console.log('[Test 8] Testing Pickup Spots page & satellite toggle...');
    await page.goto('http://localhost:3000/pickup-points');
    await page.waitForSelector('.point-card');
    const spots = await page.$$('.point-card');
    assert.strictEqual(spots.length, 3, 'Expected 3 pickup spots');

    const initialIframeSrc = await page.getAttribute('iframe.map-frame', 'src');
    // Click second spot
    await spots[1].click();
    await page.waitForTimeout(300);
    const secondIframeSrc = await page.getAttribute('iframe.map-frame', 'src');
    assert.notStrictEqual(initialIframeSrc, secondIframeSrc, 'Iframe src should change on spot selection');

    // Toggle Satellite
    await page.click('button:has-text("Satellite")');
    await page.waitForTimeout(300);
    const satIframeSrc = await page.getAttribute('iframe.map-frame', 'src');
    assert(satIframeSrc.includes('&t=k'), 'Satellite iframe src should have &t=k');

    // Visual check: map iframe height is over 250px and JourneyStrip + redirect card sit below map
    const iframeBox = await page.locator('iframe.map-frame').boundingBox();
    assert(iframeBox && iframeBox.height > 250, 'Pickup spots map iframe height should be over 250px (got ' + (iframeBox ? iframeBox.height : 'null') + ')');

    await page.waitForSelector('.journey-strip-card');
    const pickupStripBox = await page.locator('.journey-strip-card').boundingBox();
    assert(pickupStripBox && iframeBox && pickupStripBox.y >= iframeBox.y + iframeBox.height - 2,
      'JourneyStrip must sit below map iframe on Pickup spots (strip top: ' + pickupStripBox?.y + ' >= map bottom: ' + (iframeBox ? iframeBox.y + iframeBox.height : 0) + ')');

    const redirectBox = await page.locator('.redirect-bottom-card').boundingBox();
    assert(redirectBox && pickupStripBox && redirectBox.y >= pickupStripBox.y + pickupStripBox.height - 2,
      'Redirect card must sit below JourneyStrip (card top: ' + redirectBox?.y + ' >= strip bottom: ' + (pickupStripBox ? pickupStripBox.y + pickupStripBox.height : 0) + ')');

    // Redirect parcel to spot
    await page.click('button:has-text("Send it to")');
    await page.waitForSelector('.panel-success-line');

    // Multi-viewport real mouse wheel scroll containment check (1916x870, 1536x730, 1366x768, 1280x600)
    await verifyScrollContainment(browser, '/pickup-points', 'Pickup spots');

    await page.screenshot({ path: path.join(screenshotsDir, '08-pickup-spots.png') });
    console.log('PASS: Pickup Spots page verified');

    // 9. Records Page
    console.log('[Test 9] Testing Records page (tabs, filters, CSV)...');
    await page.goto('http://localhost:3000/records');
    await page.waitForSelector('.overview-strip');
    const overviewCards = await page.$$('.overview-card');
    assert.strictEqual(overviewCards.length, 4, 'Records page should display 4 overview cards');

    // Check tabs
    await page.click('button.nav-link:has-text("Incidents")');
    await page.waitForSelector('.incidents-tab');

    await page.click('button.nav-link:has-text("Passes")');
    await page.waitForSelector('.passes-tab');

    await page.click('button.nav-link:has-text("Activity")');
    await page.waitForSelector('.activity-tab');

    await page.click('button.nav-link:has-text("Parcels")');
    await page.waitForSelector('.parcels-tab');
    await page.screenshot({ path: path.join(screenshotsDir, '09-records.png') });
    console.log('PASS: Records page verified');

    // 10. Track Page (Vanilla JS)
    console.log('[Test 10] Testing Track page (Vanilla JS & localStorage)...');
    await page.goto('http://localhost:3000/track.html');
    await page.waitForSelector('#tracking-input');

    // Bad format
    await page.fill('#tracking-input', '123');
    await page.click('#track-form button[type="submit"]');
    await page.waitForSelector('#track-alert:not(.d-none)');
    const badAlert = await page.textContent('#track-alert');
    assert(badAlert.includes('6 to 20 letters'), 'Bad format alert mismatch: ' + badAlert);

    // Valid number
    await page.fill('#tracking-input', 'TRK-54129-IN');
    await page.click('#track-form button[type="submit"]');
    await page.waitForSelector('#track-result-card:not(.d-none)');
    const resultItem = await page.textContent('#result-item');
    assert.strictEqual(resultItem.trim(), 'Notebook Set', 'Track lookup item mismatch');

    // Reload page to verify recent searches chip from localStorage
    await page.reload();
    await page.waitForSelector('#recent-chips button');
    const chipText = await page.textContent('#recent-chips button');
    assert.strictEqual(chipText.trim(), 'TRK-54129-IN', 'Recent search chip should persist after reload');

    await page.screenshot({ path: path.join(screenshotsDir, '10-track-page.png') });
    console.log('PASS: Track page verified');

    // 11. Help Page (jQuery)
    console.log('[Test 11] Testing Help page (jQuery 3-step practice & hotspots)...');
    await page.goto('http://localhost:3000/help.html');
    await page.waitForSelector('.practice-step-item');

    // Click step 2
    await page.click('li.practice-step-item[data-step="2"]');
    await page.waitForSelector('#practice-step-2:not([style*="display: none"])');

    // Click hotspot 1
    await page.click('.number-btn[data-part="door"]');
    await page.waitForTimeout(300);
    const hotTitle = await page.textContent('#info-display-box');
    assert(hotTitle.includes('Door and lock'), 'Hotspot 1 title mismatch: ' + hotTitle);

    // Click hotspot 3
    await page.click('.number-btn[data-part="sensor"]');
    await page.waitForTimeout(300);
    const hot3Title = await page.textContent('#info-display-box');
    assert(hot3Title.includes('Parcel sensor'), 'Hotspot 3 title mismatch: ' + hot3Title);

    // Check 3-step collection card
    await page.waitForSelector('.collect-steps-card');
    const stepsText = await page.textContent('.collect-steps-card');
    assert(stepsText.includes('How to collect your parcel in 3 steps'), '3-step card title missing');
    assert(stepsText.includes('Open My parcels'), 'Step 1 text missing');
    assert(stepsText.includes('Type who is collecting'), 'Step 2 text missing');
    assert(stepsText.includes('Type the code on the keypad'), 'Step 3 text missing');

    await page.screenshot({ path: path.join(screenshotsDir, '11-help-page.png') });
    console.log('PASS: Help page verified');

    // 12. Responsive Layout & Comprehensive Page Screenshot Verification
    console.log('[Test 12] Testing Responsive Layout & Multi-Viewport Screenshots (1366x768 & 390x844)...');
    const targetViewports = [
      { width: 1366, height: 768 },
      { width: 390, height: 844 }
    ];

    for (const vp of targetViewports) {
      await page.setViewportSize(vp);

      // Home
      await page.goto('http://localhost:3000/');
      await page.waitForSelector('.hero-title');
      let scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `Home page horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `home-${vp.width}x${vp.height}.png`) });

      // My parcels
      await page.goto('http://localhost:3000/my-parcels');
      await page.waitForSelector('.parcels-desktop-container');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `My parcels horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `my-parcels-${vp.width}x${vp.height}.png`) });

      // Pickup spots
      await page.goto('http://localhost:3000/pickup-points');
      await page.waitForSelector('.point-card');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `Pickup spots horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `pickup-spots-${vp.width}x${vp.height}.png`) });

      // Records with 4 tabs
      await page.goto('http://localhost:3000/records');
      await page.waitForSelector('.parcels-tab');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `Records horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `records-parcels-${vp.width}x${vp.height}.png`) });

      await page.click('button.nav-link:has-text("Incidents")');
      await page.waitForSelector('.incidents-tab');
      await page.screenshot({ path: path.join(screenshotsDir, `records-incidents-${vp.width}x${vp.height}.png`) });

      await page.click('button.nav-link:has-text("Passes")');
      await page.waitForSelector('.passes-tab');
      await page.screenshot({ path: path.join(screenshotsDir, `records-passes-${vp.width}x${vp.height}.png`) });

      await page.click('button.nav-link:has-text("Activity")');
      await page.waitForSelector('.activity-tab');
      await page.screenshot({ path: path.join(screenshotsDir, `records-activity-${vp.width}x${vp.height}.png`) });

      // Track
      await page.goto('http://localhost:3000/track.html');
      await page.waitForSelector('#track-form');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `Track page horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `track-${vp.width}x${vp.height}.png`) });

      // Help
      await page.goto('http://localhost:3000/help.html');
      await page.waitForSelector('.collect-steps-card');
      scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      assert(scrollWidth <= vp.width, `Help page horizontal scroll at ${vp.width}x${vp.height}: ${scrollWidth} > ${vp.width}`);
      await page.screenshot({ path: path.join(screenshotsDir, `help-${vp.width}x${vp.height}.png`) });
    }

    // Verify all images have alt text
    const imagesWithoutAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).filter((img) => !img.hasAttribute('alt')).length;
    });
    assert.strictEqual(imagesWithoutAlt, 0, 'All images must have alt attributes');

    console.log('PASS: Responsive Layout & Multi-Viewport Screenshots verified');

    console.log('\n========================================');
    console.log('  ALL BROWSER E2E TESTS PASSED (12/12)');
    console.log('========================================');
  } finally {
    await browser.close();
  }
}

runE2E().catch((err) => {
  console.error('E2E Test Failure:', err);
  process.exit(1);
});

export default runE2E;
