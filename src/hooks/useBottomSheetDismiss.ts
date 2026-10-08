import React, { useState, useRef, useCallback, useEffect } from 'react';

interface UseBottomSheetDismissOptions {
  isOpen?: boolean;
  onClose: () => void;
  threshold?: number;
}

export function useBottomSheetDismiss({
  isOpen = true,
  onClose,
  threshold = 80,
}: UseBottomSheetDismissOptions) {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragOffsetRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const isGestureActiveRef = useRef<boolean>(false);
  const isFromHandleRef = useRef<boolean>(false);
  const startTimeRef = useRef<number>(0);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep ref synchronized with state for callbacks
  useEffect(() => {
    dragOffsetRef.current = dragOffset;
  }, [dragOffset]);

  // Clean reset whenever modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      setDragOffset(0);
      setIsDragging(false);
      dragOffsetRef.current = 0;
      isGestureActiveRef.current = false;
      isFromHandleRef.current = false;
    }
  }, [isOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    startYRef.current = touch.clientY;
    startXRef.current = touch.clientX;
    startTimeRef.current = Date.now();
    isGestureActiveRef.current = false;
    isFromHandleRef.current = false;

    const target = e.target as HTMLElement | null;

    // Do not initiate drag if user tapped an interactive button, link, or input
    if (target?.closest('button, a, input, select')) {
      return;
    }

    if (target?.closest('[data-drag-handle="true"]')) {
      isFromHandleRef.current = true;
      isGestureActiveRef.current = true;
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - startYRef.current;
    const deltaX = touch.clientX - startXRef.current;

    // Detect pull-down intent from content when already at the top
    if (!isGestureActiveRef.current) {
      if (deltaY > 8 && deltaY > Math.abs(deltaX) * 1.2) {
        const scrollable = (e.target as HTMLElement | null)?.closest('.overflow-y-auto');
        if (!scrollable) {
          isGestureActiveRef.current = true;
          setIsDragging(true);
        } else if (scrollable.scrollTop <= 0) {
          isGestureActiveRef.current = true;
          setIsDragging(true);
          // Re-anchor start position to prevent jarring jump from prior scroll
          startYRef.current = touch.clientY;
          startTimeRef.current = Date.now();
        }
      }
    }

    if (isGestureActiveRef.current) {
      const currentDeltaY = touch.clientY - startYRef.current;
      if (currentDeltaY > 0) {
        // Apply smooth logarithmic spring resistance when pulled deeply
        const offset = currentDeltaY > 180 ? 180 + (currentDeltaY - 180) * 0.4 : currentDeltaY;
        setDragOffset(offset);
        dragOffsetRef.current = offset;
      } else {
        // Reset offset if user moved back up to cancel dismiss
        setDragOffset(0);
        dragOffsetRef.current = 0;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isGestureActiveRef.current) {
      setIsDragging(false);
      setDragOffset(0);
      dragOffsetRef.current = 0;
      return;
    }

    const currentOffset = dragOffsetRef.current;
    const duration = Date.now() - startTimeRef.current;
    const velocity = currentOffset / Math.max(duration, 1);

    // Trigger dismiss if pulled past threshold or fast flick downward
    if (currentOffset >= threshold || (currentOffset > 30 && velocity > 0.35)) {
      setIsDragging(false); // Enable smooth transition to slide off-screen
      setDragOffset(window.innerHeight);
      dragOffsetRef.current = window.innerHeight;
      dismissTimerRef.current = setTimeout(() => {
        onClose();
        setDragOffset(0);
        dragOffsetRef.current = 0;
        isGestureActiveRef.current = false;
        isFromHandleRef.current = false;
        dismissTimerRef.current = null;
      }, 200);
    } else {
      // Smoothly snap back to original position
      setIsDragging(false);
      setDragOffset(0);
      dragOffsetRef.current = 0;
    }

    isGestureActiveRef.current = false;
    isFromHandleRef.current = false;
  }, [onClose, threshold]);

  const handleTouchCancel = useCallback(() => {
    setIsDragging(false);
    setDragOffset(0);
    dragOffsetRef.current = 0;
    isGestureActiveRef.current = false;
    isFromHandleRef.current = false;
  }, []);

  const sheetStyle: React.CSSProperties = {
    transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
    transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    animation: isDragging || dragOffset > 0 ? 'none' : undefined,
    touchAction: 'pan-y',
  };

  const backdropStyle: React.CSSProperties = {
    opacity: dragOffset > 0 ? Math.max(0.2, 1 - dragOffset / 350) : undefined,
    transition: isDragging ? 'none' : 'opacity 0.25s ease-out',
  };

  return {
    dragOffset,
    isDragging,
    sheetProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel,
      style: sheetStyle,
    },
    handleProps: {
      'data-drag-handle': 'true',
    },
    backdropStyle,
  };
}
