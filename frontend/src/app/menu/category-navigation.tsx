"use client";

import {
  type MouseEvent,
  type PointerEvent,
  useRef,
  useState,
} from "react";

type Category = {
  id: string;
  label: string;
};

type CategoryNavigationProps = {
  categories: Category[];
};

export function CategoryNavigation({
  categories,
}: CategoryNavigationProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const didDrag = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    didDrag.current = false;
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = scroller.scrollLeft;
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging || event.pointerType !== "mouse") {
      return;
    }

    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const distance = event.clientX - dragStartX.current;

    if (Math.abs(distance) > 4) {
      didDrag.current = true;

      if (!scroller.hasPointerCapture(event.pointerId)) {
        scroller.setPointerCapture(event.pointerId);
      }
    }

    scroller.scrollLeft = dragStartScrollLeft.current - distance;
    event.preventDefault();
  }

  function stopDragging(event: PointerEvent<HTMLDivElement>) {
    const scroller = scrollerRef.current;

    if (
      scroller?.hasPointerCapture(event.pointerId) &&
      event.pointerType === "mouse"
    ) {
      scroller.releasePointerCapture(event.pointerId);
    }

    setIsDragging(false);
    window.setTimeout(() => {
      didDrag.current = false;
    }, 0);
  }

  function handleClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (!didDrag.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    didDrag.current = false;
  }

  return (
    <nav
      className="sticky top-16 z-40 -mx-5 mt-6 border-y border-cas-outline-variant/30 bg-cas-surface/95 py-3 shadow-[0_8px_18px_var(--cas-shadow-color)] backdrop-blur-xl md:-mx-10 md:px-10"
      aria-label="Đi đến danh mục món"
    >
      <div
        className={`flex w-full max-w-full touch-pan-x snap-x snap-proximity select-none gap-2 overflow-x-auto overscroll-x-contain px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-0 ${
          isDragging ? "snap-none" : ""
        }`}
        data-drag-scroll-axis="x"
        ref={scrollerRef}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
      >
        {categories.map((category) => (
          <a
            className="shrink-0 snap-start whitespace-nowrap rounded-full bg-cas-surface-container px-4 py-2.5 text-xs font-bold text-cas-on-surface-variant transition hover:bg-cas-primary hover:text-cas-on-primary focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring"
            href={`#${category.id}`}
            key={category.id}
          >
            {category.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
