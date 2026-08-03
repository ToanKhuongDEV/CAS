"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type GlobalDragScrollProps = {
  children: ReactNode;
};

export function GlobalDragScroll({ children }: GlobalDragScrollProps) {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragStartScrollY = useRef(0);
  const didDrag = useRef(false);
  const isPointerDown = useRef(false);
  const previousScrollBehavior = useRef("");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const surface = surfaceRef.current;

    if (!surface) {
      return;
    }

    surface.dataset.dragScrollReady = "true";

    function handlePointerDown(event: globalThis.PointerEvent) {
      const target = event.target;

      if (
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        !(target instanceof Element) ||
        target.closest('[data-drag-scroll-axis="x"]') ||
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      didDrag.current = false;
      isPointerDown.current = true;
      dragStartY.current = event.clientY;
      dragStartScrollY.current = window.scrollY;
      previousScrollBehavior.current =
        document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      setIsDragging(true);
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
      if (!isPointerDown.current || event.pointerType !== "mouse") {
        return;
      }

      const distance = event.clientY - dragStartY.current;

      if (Math.abs(distance) > 4) {
        didDrag.current = true;
        window.getSelection()?.removeAllRanges();
      }

      window.scrollTo(0, dragStartScrollY.current - distance);
      event.preventDefault();
    }

    function stopDragging(event: globalThis.PointerEvent) {
      if (!isPointerDown.current || event.pointerType !== "mouse") {
        return;
      }

      isPointerDown.current = false;
      document.documentElement.style.scrollBehavior =
        previousScrollBehavior.current;
      setIsDragging(false);
      window.setTimeout(() => {
        didDrag.current = false;
      }, 0);
    }

    function preventClickAfterDrag(event: globalThis.MouseEvent) {
      if (!didDrag.current) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      didDrag.current = false;
    }

    function preventNativeDrag(event: DragEvent) {
      event.preventDefault();
    }

    surface.addEventListener("pointerdown", handlePointerDown);
    surface.addEventListener("click", preventClickAfterDrag, true);
    surface.addEventListener("dragstart", preventNativeDrag);
    document.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    });
    document.addEventListener("pointerup", stopDragging);
    document.addEventListener("pointercancel", stopDragging);

    return () => {
      surface.removeEventListener("pointerdown", handlePointerDown);
      surface.removeEventListener("click", preventClickAfterDrag, true);
      surface.removeEventListener("dragstart", preventNativeDrag);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", stopDragging);
      document.removeEventListener("pointercancel", stopDragging);
      document.documentElement.style.scrollBehavior =
        previousScrollBehavior.current;
      delete surface.dataset.dragScrollReady;
    };
  }, []);

  return (
    <div
      className={`min-h-screen ${isDragging ? "select-none" : ""}`}
      data-drag-scroll-root
      ref={surfaceRef}
    >
      {children}
    </div>
  );
}
