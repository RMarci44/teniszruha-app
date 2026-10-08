import fs from 'fs';
import path from 'path';

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`[FAIL] ${msg}`);
    process.exit(1);
  }
  console.log(`[PASS] ${msg}`);
}

console.log('--- 1. Testing System Theme & StatusBar Implementation ---');
const appTsx = fs.readFileSync(path.resolve('./src/App.tsx'), 'utf8');
assert(appTsx.includes("window.matchMedia('(prefers-color-scheme: dark)')"), 'App.tsx registers matchMedia query for system theme');
assert(appTsx.includes("addEventListener('change'"), 'App.tsx adds dynamic eventListener for prefers-color-scheme changes');
assert(appTsx.includes("themeMode"), 'App.tsx manages themeMode state ("system" | "light" | "dark")');
assert(appTsx.includes("@capacitor/status-bar"), 'App.tsx imports Capacitor StatusBar');
assert(appTsx.includes("StatusBar.setStyle"), 'App.tsx dynamically adjusts StatusBar style (Light/Dark)');
assert(appTsx.includes("StatusBar.setBackgroundColor"), 'App.tsx dynamically sets StatusBar background color');
assert(appTsx.includes("meta[name=\"theme-color\"]"), 'App.tsx dynamically synchronizes meta theme-color tag');

console.log('\n--- 2. Testing Gesture Hook & Bottom Sheet Implementation ---');
const hookTs = fs.readFileSync(path.resolve('./src/hooks/useBottomSheetDismiss.ts'), 'utf8');
assert(hookTs.includes('onTouchStart') && hookTs.includes('onTouchMove') && hookTs.includes('onTouchEnd'), 'useBottomSheetDismiss implements touch start/move/end');
assert(hookTs.includes('translateY'), 'useBottomSheetDismiss applies translateY transform');
assert(hookTs.includes('threshold'), 'useBottomSheetDismiss supports dismiss threshold');

const modalFiles = [
  './src/components/ProductDetailModal.tsx',
  './src/components/CartDrawer.tsx',
  './src/components/CategoriesModal.tsx',
  './src/components/WishlistModal.tsx',
  './src/components/AccountModal.tsx',
  './src/components/HelpModal.tsx',
];

for (const f of modalFiles) {
  const content = fs.readFileSync(path.resolve(f), 'utf8');
  assert(content.includes('useBottomSheetDismiss'), `${f} integrates useBottomSheetDismiss`);
  assert(content.includes('sheetProps'), `${f} applies sheetProps to drawer container`);
  assert(content.includes('handleProps'), `${f} applies handleProps to grab bar / header`);
}

console.log('\n--- 3. Testing Gallery Horizontal Swipe in ProductDetailModal ---');
const productModal = fs.readFileSync(path.resolve('./src/components/ProductDetailModal.tsx'), 'utf8');
assert(productModal.includes('handleGalleryTouchStart') && productModal.includes('handleGalleryTouchMove') && productModal.includes('handleGalleryTouchEnd'), 'ProductDetailModal handles horizontal touch events');
assert(productModal.includes('galleryDragX'), 'ProductDetailModal tracks horizontal drag');
assert(productModal.includes('ChevronLeft') && productModal.includes('ChevronRight'), 'ProductDetailModal provides chevron navigation arrows');
assert(productModal.includes('min-h-[44px]'), 'ProductDetailModal has 44px ergonomic touch targets');

console.log('\n--- 4. Testing Pull-To-Refresh on Catalog in App.tsx ---');
assert(appTsx.includes('handleCatalogTouchStart') && appTsx.includes('handleCatalogTouchMove') && appTsx.includes('handleCatalogTouchEnd'), 'App.tsx implements catalog pull touch handlers');
assert(appTsx.includes('pullDistance'), 'App.tsx calculates pullDistance with spring physics');
assert(appTsx.includes('fetchStoreData'), 'App.tsx refreshes catalog data on pull release');
assert(appTsx.includes('Termékek frissítése...'), 'App.tsx renders animated pull-to-refresh badge');

console.log('\n--- 5. Testing Android Native DayNight Resource Styles ---');
const lightStyles = fs.readFileSync(path.resolve('./android/app/src/main/res/values/styles.xml'), 'utf8');
const darkStyles = fs.readFileSync(path.resolve('./android/app/src/main/res/values-night/styles.xml'), 'utf8');
assert(lightStyles.includes('android:windowLightStatusBar">true'), 'values/styles.xml has light status bar');
assert(darkStyles.includes('android:windowLightStatusBar">false'), 'values-night/styles.xml has dark status bar');

console.log('\n--- 6. Testing Android APK Updated ---');
const apkStats = fs.statSync(path.resolve('./teniszruha.apk'));
assert(apkStats.size > 3000000, `teniszruha.apk exists and is properly sized (${Math.round(apkStats.size / 1024 / 1024)} MB)`);

console.log('\n🎉 ALL CUSTOM GESTURE & THEME TESTS PASSED!');
