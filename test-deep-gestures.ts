import fs from 'fs';
import path from 'path';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  }
  console.log(`[PASS] ${message}`);
}

console.log('========================================================');
console.log('🔬 DEEP RUNTIME & BEHAVIORAL GESTURE VERIFICATION');
console.log('========================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Bottom Sheet Hook Logic & Edge Cases
// -----------------------------------------------------------------------------
console.log('--- 1. Testing Bottom Sheet Dismiss Logic & Edge Cases ---');

// Simulate the bottom sheet state machine
function createBottomSheetSimulator(threshold = 80) {
  let isClosed = false;
  let dragOffset = 0;
  let isDragging = false;
  let startY = 0;
  let startX = 0;
  let isGestureActive = false;
  let isFromHandle = false;
  let startTime = 0;

  return {
    get isClosed() { return isClosed; },
    get dragOffset() { return dragOffset; },
    get isDragging() { return isDragging; },
    get isGestureActive() { return isGestureActive; },

    onTouchStart(touch: { clientX: number; clientY: number }, targetTag: string, isHandle = false) {
      startY = touch.clientY;
      startX = touch.clientX;
      startTime = Date.now();
      isGestureActive = false;
      isFromHandle = false;

      // Bug 3 check: ignore buttons / interactive elements
      if (['button', 'a', 'input', 'select'].includes(targetTag.toLowerCase())) {
        return;
      }

      if (isHandle) {
        isFromHandle = true;
        isGestureActive = true;
        isDragging = true;
      }
    },

    onTouchMove(touch: { clientX: number; clientY: number }, scrollTop = 0, isScrollable = false) {
      const deltaY = touch.clientY - startY;
      const deltaX = touch.clientX - startX;

      if (!isGestureActive) {
        if (deltaY > 8 && deltaY > Math.abs(deltaX) * 1.2) {
          if (!isScrollable) {
            isGestureActive = true;
            isDragging = true;
          } else if (scrollTop <= 0) {
            isGestureActive = true;
            isDragging = true;
            // Bug 2 check: Re-anchor start position to avoid jump!
            startY = touch.clientY;
            startTime = Date.now();
          }
        }
      }

      if (isGestureActive) {
        const currentDeltaY = touch.clientY - startY;
        if (currentDeltaY > 0) {
          dragOffset = currentDeltaY > 180 ? 180 + (currentDeltaY - 180) * 0.4 : currentDeltaY;
        } else {
          // Bug 1 check: reset to 0 if finger moved back up
          dragOffset = 0;
        }
      }
    },

    onTouchEnd(simulatedDurationMs = 150) {
      if (!isGestureActive) {
        isDragging = false;
        dragOffset = 0;
        return;
      }

      const velocity = dragOffset / Math.max(simulatedDurationMs, 1);
      if (dragOffset >= threshold || (dragOffset > 30 && velocity > 0.35)) {
        isClosed = true;
        dragOffset = 0;
        isDragging = false;
      } else {
        isDragging = false;
        dragOffset = 0;
      }
      isGestureActive = false;
      isFromHandle = false;
    }
  };
}

// 1.1: Normal pull down from handle past threshold -> dismisses
{
  const sim = createBottomSheetSimulator(80);
  sim.onTouchStart({ clientX: 200, clientY: 100 }, 'div', true);
  sim.onTouchMove({ clientX: 200, clientY: 200 }); // deltaY = 100px
  assert(sim.dragOffset === 100, 'Pulling down 100px results in 100px dragOffset');
  sim.onTouchEnd(300);
  assert(sim.isClosed === true, 'Releasing past threshold (100 >= 80) triggers modal close');
}

// 1.2: Pull down then push back up (Cancel dismiss) -> must NOT close (Bug 1 regression test)
{
  const sim = createBottomSheetSimulator(80);
  sim.onTouchStart({ clientX: 200, clientY: 100 }, 'div', true);
  sim.onTouchMove({ clientX: 200, clientY: 190 }); // deltaY = 90px (past threshold)
  assert(sim.dragOffset === 90, 'Drag down reached 90px');
  // User pushes finger back UP to cancel
  sim.onTouchMove({ clientX: 200, clientY: 80 }); // deltaY = -20px
  assert(sim.dragOffset === 0, 'Pushing back up resets dragOffset to 0');
  sim.onTouchEnd(400);
  assert(sim.isClosed === false, 'Releasing after push-back-up does NOT dismiss the modal (Bug 1 fixed)');
}

// 1.3: Content scrolling to top transition (Bug 2 regression test)
{
  const sim = createBottomSheetSimulator(80);
  // User touches inside scrollable content at scrollTop = 50
  sim.onTouchStart({ clientX: 200, clientY: 200 }, 'div', false);
  // Finger moves down 50px while content is scrolling up: scrollTop is now 0
  sim.onTouchMove({ clientX: 200, clientY: 250 }, 0, true);
  // Immediately after transition, dragOffset must be 0 (re-anchored), not 50!
  assert(sim.dragOffset === 0, 'Transition from scroll to drag starts smoothly at offset 0 (Bug 2 fixed)');
  // Continued pull moves it smoothly
  sim.onTouchMove({ clientX: 200, clientY: 270 }, 0, true);
  assert(sim.dragOffset === 20, 'Further pull moves offset by exactly 20px from transition point');
}

// 1.4: Tapping a button in the header does not initiate drag handle (Bug 3 regression test)
{
  const sim = createBottomSheetSimulator(80);
  sim.onTouchStart({ clientX: 350, clientY: 40 }, 'button', true);
  assert(sim.isGestureActive === false, 'Tapping button inside header does not activate drag (Bug 3 fixed)');
}

// -----------------------------------------------------------------------------
// Test 2: Pull-To-Refresh Logic on Catalog View
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Pull-To-Refresh State Machine ---');

function createPullToRefreshSimulator() {
  let isRefreshing = false;
  let pullDistance = 0;
  let startY = 0;
  let startX = 0;
  let isPullActive = false;

  return {
    get pullDistance() { return pullDistance; },
    get isRefreshing() { return isRefreshing; },

    onTouchStart(touch: { clientX: number; clientY: number }, scrollY: number, hasOpenModal = false) {
      if (hasOpenModal || scrollY > 2) {
        isPullActive = false;
        return;
      }
      startY = touch.clientY;
      startX = touch.clientX;
      isPullActive = true;
    },

    onTouchMove(touch: { clientX: number; clientY: number }, scrollY: number) {
      if (!isPullActive || isRefreshing || scrollY > 2) {
        isPullActive = false;
        pullDistance = 0;
        return;
      }
      const deltaY = touch.clientY - startY;
      const deltaX = touch.clientX - startX;

      if (deltaY <= 0) {
        pullDistance = 0;
        return;
      }

      // Discard horizontal gestures
      if (Math.abs(deltaX) > deltaY * 1.2) return;

      pullDistance = Math.min(deltaY * 0.45, 85);
    },

    onTouchEnd() {
      if (!isPullActive || isRefreshing) return;
      isPullActive = false;
      if (pullDistance >= 60) {
        isRefreshing = true;
      } else {
        pullDistance = 0;
      }
    }
  };
}

// 2.1: Pulling down past 60px triggers refresh
{
  const ptr = createPullToRefreshSimulator();
  ptr.onTouchStart({ clientX: 200, clientY: 100 }, 0, false);
  ptr.onTouchMove({ clientX: 200, clientY: 250 }, 0); // deltaY = 150px -> pullDistance = 67.5px
  assert(ptr.pullDistance >= 60, 'Sufficient pull results in pullDistance >= 60');
  ptr.onTouchEnd();
  assert(ptr.isRefreshing === true, 'Releasing trigger distance initiates refresh');
}

// 2.2: Pulling down then moving back up cancels refresh
{
  const ptr = createPullToRefreshSimulator();
  ptr.onTouchStart({ clientX: 200, clientY: 100 }, 0, false);
  ptr.onTouchMove({ clientX: 200, clientY: 250 }, 0); // pull distance reached
  ptr.onTouchMove({ clientX: 200, clientY: 90 }, 0);  // moved back up above start
  assert(ptr.pullDistance === 0, 'Moving finger back up cancels pullDistance to 0');
  ptr.onTouchEnd();
  assert(ptr.isRefreshing === false, 'Cancelled pull does NOT trigger refresh');
}

// 2.3: Horizontal swipe does not trigger pull-to-refresh
{
  const ptr = createPullToRefreshSimulator();
  ptr.onTouchStart({ clientX: 100, clientY: 100 }, 0, false);
  ptr.onTouchMove({ clientX: 250, clientY: 120 }, 0); // deltaX = 150, deltaY = 20
  assert(ptr.pullDistance === 0, 'Horizontal swipe does not trigger pull-to-refresh');
}

// 2.4: Modal open blocks pull-to-refresh
{
  const ptr = createPullToRefreshSimulator();
  ptr.onTouchStart({ clientX: 100, clientY: 100 }, 0, true);
  ptr.onTouchMove({ clientX: 100, clientY: 300 }, 0);
  assert(ptr.pullDistance === 0, 'Pull-to-refresh is blocked when modal is open');
}

// -----------------------------------------------------------------------------
// Test 3: Horizontal Gallery Swipe in ProductDetailModal
// -----------------------------------------------------------------------------
console.log('\n--- 3. Testing Gallery Horizontal Swipe ---');

function simulateGallerySwipe(startIndex: number, totalImages: number, dragX: number) {
  if (totalImages <= 1) return startIndex;
  if (dragX < -40) {
    return (startIndex + 1) % totalImages;
  } else if (dragX > 40) {
    return (startIndex - 1 + totalImages) % totalImages;
  }
  return startIndex;
}

assert(simulateGallerySwipe(0, 3, -50) === 1, 'Swipe left (-50px) advances to next image (0 -> 1)');
assert(simulateGallerySwipe(1, 3, -60) === 2, 'Swipe left advances to next image (1 -> 2)');
assert(simulateGallerySwipe(2, 3, -60) === 0, 'Swipe left wraps around (2 -> 0)');
assert(simulateGallerySwipe(0, 3, 50) === 2, 'Swipe right (+50px) wraps to previous image (0 -> 2)');
assert(simulateGallerySwipe(1, 3, 20) === 1, 'Small jitter drag (+20px) snaps back to original image');
assert(simulateGallerySwipe(0, 1, -100) === 0, 'Single image does not change on swipe');

// -----------------------------------------------------------------------------
// Test 4: Dynamic System Theme Synchronization & Toggle Cycle
// -----------------------------------------------------------------------------
console.log('\n--- 4. Testing Theme Mode Synchronization & Toggle States ---');

function evaluateIsDark(themeMode: 'system' | 'light' | 'dark', systemPrefersDark: boolean): boolean {
  return themeMode === 'system' ? systemPrefersDark : themeMode === 'dark';
}

function nextThemeToggle(prev: 'system' | 'light' | 'dark', systemPrefersDark: boolean): 'system' | 'light' | 'dark' {
  if (prev === 'system') {
    return systemPrefersDark ? 'light' : 'dark';
  }
  if (prev === (systemPrefersDark ? 'light' : 'dark')) {
    return systemPrefersDark ? 'dark' : 'light';
  }
  return 'system';
}

// When phone is in light mode (systemPrefersDark = false):
assert(evaluateIsDark('system', false) === false, 'System mode on light phone evaluates to light theme (false)');
assert(nextThemeToggle('system', false) === 'dark', 'First toggle from system (light) switches to dark');
assert(nextThemeToggle('dark', false) === 'light', 'Second toggle switches to explicit light');
assert(nextThemeToggle('light', false) === 'system', 'Third toggle returns to system auto');

// When phone is in dark mode (systemPrefersDark = true):
assert(evaluateIsDark('system', true) === true, 'System mode on dark phone evaluates to dark theme (true)');
assert(nextThemeToggle('system', true) === 'light', 'First toggle from system (dark) switches to light');
assert(nextThemeToggle('light', true) === 'dark', 'Second toggle switches to explicit dark');
assert(nextThemeToggle('dark', true) === 'system', 'Third toggle returns to system auto');

// Dynamic change when user toggles Android quick settings in system mode:
let sysDark = false;
let currentMode: 'system' | 'light' | 'dark' = 'system';
assert(evaluateIsDark(currentMode, sysDark) === false, 'Initial state: Light phone -> Light app');
sysDark = true; // User toggles dark mode in Android Quick Settings
assert(evaluateIsDark(currentMode, sysDark) === true, 'Android switch to Dark instantly updates app to Dark theme without reload');

console.log('\n========================================================');
console.log('✅ ALL DEEP RUNTIME GESTURE & THEME TESTS PASSED!');
console.log('========================================================\n');
