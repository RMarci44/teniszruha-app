import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl(port) {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${port}/json/list`, resp => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      const pageTarget = res.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) return pageTarget.webSocketDebuggerUrl;
    } catch {
      await wait(200);
    }
  }
  throw new Error('Chrome did not start in time');
}

async function runE2E() {
  console.log('========================================================');
  console.log('🚀 RUNNING COMPREHENSIVE BROWSER RUNTIME E2E TESTS');
  console.log('========================================================\n');

  const port = 9222;
  const tmpDir = 'C:\\Users\\Marci\\.gemini\\antigravity\\scratch\\teniszruha-app\\.chrome-temp-e2e';
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=412,915',
    'http://localhost:5173/'
  ]);

  const exceptions = [];

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);

    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const { resolve, reject } = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else {
        if (msg.method === 'Runtime.exceptionThrown') {
          console.error('❌ [RUNTIME EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
          exceptions.push(msg.params.exceptionDetails);
        }
      }
    };

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(code) {
      const r = await send('Runtime.evaluate', {
        expression: code,
        returnByValue: true,
        awaitPromise: true,
      });
      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
      }
      return r.result.value;
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await wait(2500);

    function assert(cond, msg) {
      if (!cond) {
        console.error(`❌ [FAIL] ${msg}`);
        process.exit(1);
      } else {
        console.log(`✅ [PASS] ${msg}`);
      }
    }

    // Step 1: Initial Page Load
    console.log('--- Step 1: Initial Page Load ---');
    await evaluate('localStorage.clear()');
    await evaluate('location.reload()');
    await wait(2000);

    const title = await evaluate('document.title');
    assert(title.includes('Teniszruha.hu'), `Page title correct: "${title}"`);
    const productCount = await evaluate('document.querySelectorAll(".group.relative.bg-white, .group.relative.dark\\\\:bg-slate-900\\\\/90").length');
    assert(productCount > 0, `Catalog loaded products: ${productCount} cards found`);

    // Step 2: Empty Cart Opening & Closing
    console.log('\n--- Step 2: Empty Cart Opening & Closing ---');
    await evaluate(`(() => {
      const cartBtn = document.querySelector('button[aria-label="Kosár"]');
      cartBtn.click();
    })()`);
    await wait(600);

    const emptyCartState = await evaluate(`(() => {
      const drawer = document.querySelector('.fixed.inset-0.z-50');
      if (!drawer) return null;
      return {
        text: drawer.innerText,
        hasEmptyMessage: drawer.innerText.includes('A kosarad jelenleg üres'),
        hasFreeShipping: drawer.innerText.includes('ingyenes szállításhoz')
      };
    })()`);
    assert(emptyCartState !== null, 'Cart drawer opened on click');
    assert(emptyCartState.hasEmptyMessage, 'Empty cart displays "A kosarad jelenleg üres"');
    assert(emptyCartState.hasFreeShipping, 'Free shipping progress bar visible');

    // Close Cart
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);
    const cartClosed = await evaluate(`!document.querySelector('.fixed.inset-0.z-50')`);
    assert(cartClosed, 'Cart drawer closed successfully');

    // Step 3: Add to Cart from Product Card & Cart Operations
    console.log('\n--- Step 3: Product Card Quick-Add & Cart Operations ---');
    const firstProductName = await evaluate(`(() => {
      const card = document.querySelector('.group.relative.bg-white, .group.relative.dark\\\\:bg-slate-900\\\\/90');
      const h3 = card ? card.querySelector('h3') : null;
      return h3 ? h3.innerText.trim() : '';
    })()`);
    console.log(`Adding product "${firstProductName}" to cart...`);

    await evaluate(`(() => {
      const card = document.querySelector('.group.relative.bg-white, .group.relative.dark\\\\:bg-slate-900\\\\/90');
      // Click the quick add button inside the card
      const addBtn = card.querySelector('button[aria-label="Kosárba"], button.bg-amber-400');
      if (addBtn) addBtn.click();
    })()`);
    await wait(600);

    const cartWithItem = await evaluate(`(() => {
      const drawer = document.querySelector('.fixed.inset-0.z-50');
      if (!drawer) return null;
      return {
        itemCountText: drawer.querySelector('p')?.innerText || '',
        text: drawer.innerText,
        hasCheckoutBtn: drawer.innerText.includes('Megrendelés a Pénztárban'),
      };
    })()`);
    assert(cartWithItem !== null, 'Cart drawer opened automatically after adding item');
    assert(cartWithItem.hasCheckoutBtn, 'Checkout button is visible in cart');

    // Test Quantity Increment (+)
    console.log('Testing quantity increment (+)...');
    await evaluate(`(() => {
      const plusBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Növelés"]');
      if (plusBtn) plusBtn.click();
    })()`);
    await wait(400);

    const qtyAfterPlus = await evaluate(`(() => {
      const qtySpan = document.querySelector('.fixed.inset-0.z-50 span.w-6');
      return qtySpan ? qtySpan.innerText.trim() : '';
    })()`);
    assert(qtyAfterPlus === '2', `Quantity successfully increased to ${qtyAfterPlus}`);

    // Test Quantity Decrement (-)
    console.log('Testing quantity decrement (-)...');
    await evaluate(`(() => {
      const minusBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Csökkentés"]');
      if (minusBtn) minusBtn.click();
    })()`);
    await wait(400);

    const qtyAfterMinus = await evaluate(`(() => {
      const qtySpan = document.querySelector('.fixed.inset-0.z-50 span.w-6');
      return qtySpan ? qtySpan.innerText.trim() : '';
    })()`);
    assert(qtyAfterMinus === '1', `Quantity successfully decreased back to ${qtyAfterMinus}`);

    // Test Remove Item
    console.log('Testing item removal (Trash)...');
    await evaluate(`(() => {
      const trashBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Törlés"]');
      if (trashBtn) trashBtn.click();
    })()`);
    await wait(400);

    const isCartEmptyNow = await evaluate(`(() => {
      const drawer = document.querySelector('.fixed.inset-0.z-50');
      return drawer ? drawer.innerText.includes('A kosarad jelenleg üres') : false;
    })()`);
    assert(isCartEmptyNow, 'Item removed and cart is empty again');

    // Close Cart
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);

    // Step 4: Product Detail Modal (Photos, Sizes, Add to Cart)
    console.log('\n--- Step 4: Product Detail Modal ---');
    await evaluate(`(() => {
      const card = document.querySelector('.group.relative.bg-white, .group.relative.dark\\\\:bg-slate-900\\\\/90');
      card.click();
    })()`);
    await wait(600);

    const detailModalOpen = await evaluate(`(() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return null;
      const h2 = modal.querySelector('h2');
      return {
        open: true,
        title: h2 ? h2.innerText : '',
        hasImages: modal.querySelectorAll('img').length > 0,
        hasAddToCart: modal.innerText.includes('Kosárba teszem'),
      };
    })()`);
    assert(detailModalOpen !== null && detailModalOpen.open, `ProductDetailModal opened for: "${detailModalOpen?.title}"`);
    assert(detailModalOpen.hasAddToCart, 'ProductDetailModal has "Kosárba teszem" CTA');

    // Add to cart from ProductDetailModal
    console.log('Adding to cart from ProductDetailModal...');
    await evaluate(`(() => {
      const addBtn = document.querySelector('.fixed.inset-0.z-50 button.bg-amber-400');
      if (addBtn) addBtn.click();
    })()`);
    await wait(600);

    // Close detail modal if still open
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);

    // Step 5: Categories Modal
    console.log('\n--- Step 5: Categories Modal ---');
    await evaluate(`(() => {
      // Find categories button on bottom nav
      const catBtn = Array.from(document.querySelectorAll('nav[role="navigation"] button')).find(b => b.innerText.includes('Kategóriák'));
      if (catBtn) catBtn.click();
    })()`);
    await wait(600);

    const catModalState = await evaluate(`(() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return null;
      return {
        hasCategoriesTitle: modal.innerText.includes('Kategóriák'),
        hasNadal: modal.innerText.includes('Rafa Nadal'),
        hasRackets: modal.innerText.includes('Teniszütők'),
      };
    })()`);
    assert(catModalState !== null, 'CategoriesModal opened cleanly without hook error');
    assert(catModalState.hasNadal && catModalState.hasRackets, 'CategoriesModal contains Nadal and Teniszütők');

    // Pick Nadal category
    await evaluate(`(() => {
      const nadalBtn = Array.from(document.querySelectorAll('.fixed.inset-0.z-50 button')).find(b => b.innerText.includes('Rafa Nadal'));
      if (nadalBtn) nadalBtn.click();
    })()`);
    await wait(600);

    const nadalFiltered = await evaluate(`(() => {
      const activePill = document.querySelector('button[data-category-slug="nadal"].bg-amber-400');
      return activePill ? activePill.innerText : '';
    })()`);
    assert(nadalFiltered.toLowerCase().includes('nadal'), `Category filter applied: "${nadalFiltered}"`);

    // Reset category filter back to all
    await evaluate(`(() => {
      const allBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Összes' || b.innerText.trim() === 'Összes termék');
      if (allBtn) allBtn.click();
    })()`);
    await wait(500);

    // Step 6: Wishlist Modal
    console.log('\n--- Step 6: Wishlist Functionality ---');
    // Click heart on first product card
    await evaluate(`(() => {
      const heartBtn = document.querySelector('.group.relative.bg-white button[aria-label="Kedvenc"], .group.relative.dark\\\\:bg-slate-900\\\\/90 button');
      if (heartBtn) heartBtn.click();
    })()`);
    await wait(400);

    // Open Wishlist Modal via BottomNav
    await evaluate(`(() => {
      const wishBtn = Array.from(document.querySelectorAll('nav[role="navigation"] button')).find(b => b.innerText.includes('Kedvencek'));
      if (wishBtn) wishBtn.click();
    })()`);
    await wait(600);

    const wishlistState = await evaluate(`(() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return null;
      return {
        text: modal.innerText,
        hasWishlistTitle: modal.innerText.includes('Kedvencek'),
      };
    })()`);
    assert(wishlistState !== null, 'WishlistModal opened cleanly');

    // Close WishlistModal
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);

    // Step 7: Account Modal
    console.log('\n--- Step 7: Account Modal ---');
    await evaluate(`(() => {
      const accBtn = Array.from(document.querySelectorAll('nav[role="navigation"] button')).find(b => b.innerText.includes('Fiók'));
      if (accBtn) accBtn.click();
    })()`);
    await wait(600);

    const accountState = await evaluate(`(() => {
      const modal = document.querySelector('.fixed.inset-0.z-50');
      if (!modal) return null;
      return {
        hasLogin: modal.innerText.includes('Bejelentkezés') || modal.innerText.includes('Belépés'),
        hasRegister: modal.innerText.includes('Regisztráció'),
      };
    })()`);
    assert(accountState !== null && accountState.hasLogin, 'AccountModal opened and rendered tabs');

    // Close AccountModal
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(500);

    // Step 8: Search Functionality
    console.log('\n--- Step 8: Live Search ---');
    await evaluate(`(() => {
      const searchInputs = document.querySelectorAll('input[placeholder*="Keresés"]');
      const input = searchInputs[searchInputs.length - 1];
      if (input) {
        input.value = 'Pure Aero';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await wait(600);

    const searchResults = await evaluate(`(() => {
      const cards = document.querySelectorAll('.group.relative.bg-white h3, .group.relative.dark\\\\:bg-slate-900\\\\/90 h3');
      return Array.from(cards).map(c => c.innerText);
    })()`);
    assert(searchResults.some(t => t.toLowerCase().includes('pure aero')), `Search for "Pure Aero" returned matching items (${searchResults.length} found)`);

    // Clear search
    await evaluate(`(() => {
      const searchInputs = document.querySelectorAll('input[placeholder*="Keresés"]');
      const input = searchInputs[searchInputs.length - 1];
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await wait(500);

    // Step 9: Theme Mode Toggle & Legibility
    console.log('\n--- Step 9: Theme Mode Toggle & Legibility ---');
    const initialThemeDark = await evaluate('document.documentElement.classList.contains("dark")');
    console.log(`Initial theme: ${initialThemeDark ? 'Dark' : 'Light'}`);

    // Toggle theme via Header theme button
    await evaluate(`(() => {
      const themeBtn = document.querySelector('button[aria-label="Téma váltás"]');
      if (themeBtn) themeBtn.click();
    })()`);
    await wait(400);

    const toggledThemeDark = await evaluate('document.documentElement.classList.contains("dark")');
    console.log(`After 1st toggle: ${toggledThemeDark ? 'Dark' : 'Light'}`);
    assert(toggledThemeDark !== initialThemeDark, 'Theme successfully toggled between Dark and Light');

    // Check light mode styles
    const bodyBg = await evaluate('window.getComputedStyle(document.body).backgroundColor');
    console.log('Body background in current mode:', bodyBg);
    assert(bodyBg !== '', 'Body background properly computed');

    // Toggle theme again to return to Dark
    await evaluate(`(() => {
      const themeBtn = document.querySelector('button[aria-label="Téma váltás"]');
      if (themeBtn) themeBtn.click();
    })()`);
    await wait(400);

    // Step 10: Brand Filter Pills & Sorting Dropdown
    console.log('\n--- Step 10: Brand Filter Pills & Sorting Dropdown ---');
    await evaluate(`(() => {
      const babolatPill = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Babolat') && !b.innerText.includes('Pure Aero'));
      if (babolatPill) babolatPill.click();
    })()`);
    await wait(500);

    const babolatCardCount = await evaluate(`document.querySelectorAll('.group.relative.bg-white h3, .group.relative.dark\\\\:bg-slate-900\\\\/90 h3').length`);
    assert(babolatCardCount > 0, `Babolat brand filter returned ${babolatCardCount} products`);

    // Reset brand filter to "Mindent"
    await evaluate(`(() => {
      const allBrandBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Mindent');
      if (allBrandBtn) allBrandBtn.click();
    })()`);
    await wait(400);

    // Test Price Sorting (Ascending)
    await evaluate(`(() => {
      const sortSelect = document.querySelector('select[aria-label="Rendezés"]');
      if (sortSelect) {
        sortSelect.value = 'price-asc';
        sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await wait(500);

    const isPriceAscSorted = await evaluate(`(() => {
      const cardPrices = Array.from(document.querySelectorAll('.group.relative.bg-white, .group.relative.dark\\\\:bg-slate-900\\\\/90'))
        .map(card => {
          const priceEl = card.querySelector('.text-sm.sm\\\\:text-base.font-black, .text-sm.font-black');
          if (!priceEl) return 0;
          return parseInt(priceEl.innerText.replace(/[^0-9]/g, ''), 10);
        })
        .filter(n => n > 0);
      if (cardPrices.length < 2) return true;
      for (let i = 0; i < cardPrices.length - 1; i++) {
        if (cardPrices[i] > cardPrices[i + 1]) return false;
      }
      return true;
    })()`);
    assert(isPriceAscSorted, 'Sorting dropdown successfully sorted products by price ascending');

    // Reset sort back to featured
    await evaluate(`(() => {
      const sortSelect = document.querySelector('select[aria-label="Rendezés"]');
      if (sortSelect) {
        sortSelect.value = 'featured';
        sortSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()`);
    await wait(400);

    // Step 11: Rapid Cart Drawer Re-opening (No Black Screen)
    console.log('\n--- Step 11: Rapid Cart Drawer Re-opening & Visibility Verification ---');
    for (let cycle = 1; cycle <= 3; cycle++) {
      // Open cart
      await evaluate(`(() => {
        const cartBtn = document.querySelector('button[aria-label="Kosár"]');
        if (cartBtn) cartBtn.click();
      })()`);
      await wait(300);

      const cartVisible = await evaluate(`(() => {
        const drawer = document.querySelector('.fixed.inset-0.z-50');
        if (!drawer) return false;
        const innerSheet = drawer.querySelector('.w-full.sm\\\\:max-w-md');
        if (!innerSheet) return false;
        const style = window.getComputedStyle(innerSheet);
        return style.display !== 'none' && style.visibility !== 'hidden';
      })()`);
      assert(cartVisible, `Cart cycle ${cycle}: Drawer element rendered and visibly positioned (no black screen)`);

      // Close cart
      await evaluate(`(() => {
        const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
        if (closeBtn) closeBtn.click();
      })()`);
      await wait(300);
    }

    // Step 12: Modal Mutual Exclusion (Never Stacked Overlays)
    console.log('\n--- Step 12: Modal Mutual Exclusion Verification ---');
    // Open categories
    await evaluate(`(() => {
      const catBtn = Array.from(document.querySelectorAll('nav[role="navigation"] button')).find(b => b.innerText.includes('Kategóriák'));
      if (catBtn) catBtn.click();
    })()`);
    await wait(400);

    // Open wishlist without closing categories
    await evaluate(`(() => {
      const wishBtn = Array.from(document.querySelectorAll('nav[role="navigation"] button')).find(b => b.innerText.includes('Kedvencek'));
      if (wishBtn) wishBtn.click();
    })()`);
    await wait(400);

    const modalCount = await evaluate(`document.querySelectorAll('.fixed.inset-0.z-50').length`);
    assert(modalCount === 1, `Exactly 1 modal rendered on screen (found ${modalCount}, mutual exclusion verified)`);

    // Close modal
    await evaluate(`(() => {
      const closeBtn = document.querySelector('.fixed.inset-0.z-50 button[aria-label="Bezárás"]');
      if (closeBtn) closeBtn.click();
    })()`);
    await wait(300);

    // Step 13: Verify Zero Runtime Exceptions
    console.log('\n--- Step 13: Runtime Error Inspection ---');
    assert(exceptions.length === 0, `Zero runtime exceptions occurred during full E2E flow (found ${exceptions.length})`);

    console.log('\n========================================================');
    console.log('🎉 ALL COMPREHENSIVE E2E BROWSER TESTS PASSED 100%!');
    console.log('========================================================');

    ws.close();
  } finally {
    chrome.kill();
  }
}

runE2E().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
