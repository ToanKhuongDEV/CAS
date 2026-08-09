"use client";

import { type MouseEvent, type PointerEvent, useEffect, useRef, useState } from "react";

type Category = {
  id: string;
  label: string;
};

type CategoryNavigationProps = {
  categories: Category[];
  className?: string;
};

export function CategoryNavigation({ categories, className }: CategoryNavigationProps) {
  const navigationRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const categoryLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const didDrag = useRef(false);
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]?.id ?? "");
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let animationFrameId: number | null = null;

    function updateActiveCategory() {
      animationFrameId = null;

      const sectionPositions = categories.flatMap((category) => {
        const section = document.getElementById(category.id);

        if (!section) {
          return [];
        }

        const sectionRect = section.getBoundingClientRect();

        if (sectionRect.height <= 0) {
          return [];
        }

        return [{ id: category.id, top: sectionRect.top }];
      });

      if (sectionPositions.length === 0) {
        return;
      }

      const navigationBottom = navigationRef.current?.getBoundingClientRect().bottom ?? 0;
      const activationLine = navigationBottom + 8;
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const reachedDocumentEnd =
        documentHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= documentHeight - 2;
      let nextCategoryId = sectionPositions[0].id;

      if (reachedDocumentEnd) {
        nextCategoryId = sectionPositions.at(-1)?.id ?? nextCategoryId;
      } else {
        for (const sectionPosition of sectionPositions) {
          if (sectionPosition.top > activationLine) {
            break;
          }

          nextCategoryId = sectionPosition.id;
        }
      }

      setActiveCategoryId((currentCategoryId) =>
        currentCategoryId === nextCategoryId ? currentCategoryId : nextCategoryId,
      );
    }

    function scheduleActiveCategoryUpdate() {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateActiveCategory);
    }

    scheduleActiveCategoryUpdate();
    window.addEventListener("resize", scheduleActiveCategoryUpdate);
    window.addEventListener("scroll", scheduleActiveCategoryUpdate, {
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", scheduleActiveCategoryUpdate);
      window.removeEventListener("scroll", scheduleActiveCategoryUpdate);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [categories]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const activeLink = categoryLinkRefs.current[activeCategoryId];

    if (!scroller || !activeLink) {
      return;
    }

    const linkLeft = activeLink.offsetLeft;
    const linkRight = linkLeft + activeLink.offsetWidth;
    const visibleLeft = scroller.scrollLeft;
    const visibleRight = visibleLeft + scroller.clientWidth;

    if (linkLeft < visibleLeft) {
      scroller.scrollLeft = Math.max(0, linkLeft - 8);
    } else if (linkRight > visibleRight) {
      scroller.scrollLeft = linkRight - scroller.clientWidth + 8;
    }
  }, [activeCategoryId]);

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

    if (scroller?.hasPointerCapture(event.pointerId) && event.pointerType === "mouse") {
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
      ref={navigationRef}
      className={`sticky top-16 z-30 border-y border-cas-outline-variant/30 bg-cas-surface/95 py-3 shadow-[0_8px_18px_var(--cas-shadow-color)] backdrop-blur-xl ${
        className ? className : "-mx-5 mt-6 md:-mx-10 md:px-10"
      }`}
      aria-label="Đi đến danh mục món"
    >
      <div
        className={`flex w-full max-w-full touch-pan-x snap-x snap-proximity select-none gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          className ? "px-2" : "px-5 md:px-0"
        } ${isDragging ? "snap-none" : ""}`}
        data-drag-scroll-axis="x"
        ref={scrollerRef}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        onPointerCancel={stopDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;

          return (
            <a
              className={`shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-cas-focus-ring ${
                isActive
                  ? "bg-cas-primary text-cas-on-primary shadow-sm"
                  : "bg-cas-surface-container text-cas-on-surface-variant hover:bg-cas-primary hover:text-cas-on-primary"
              }`}
              href={`#${category.id}`}
              key={category.id}
              aria-current={isActive ? "location" : undefined}
              onClick={() => setActiveCategoryId(category.id)}
              ref={(element) => {
                categoryLinkRefs.current[category.id] = element;
              }}
            >
              {category.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
