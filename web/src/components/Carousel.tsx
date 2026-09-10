import { useRef, useState, type PointerEvent, type ReactNode } from "react";

interface Page {
  label: string;
  content: ReactNode;
}

interface Props {
  pages: Page[];
}

const SWIPE_THRESHOLD = 50;

/** A lightweight full-screen swipeable carousel — no external dependency needed for two pages. */
export default function Carousel({ pages }: Props) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function clampIndex(i: number) {
    return Math.max(0, Math.min(pages.length - 1, i));
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    startX.current = e.clientX;
    setDragging(true);
    containerRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragX(e.clientX - startX.current);
  }

  function endDrag() {
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      setIndex((i) => clampIndex(i + (dragX < 0 ? 1 : -1)));
    }
    setDragging(false);
    setDragX(0);
  }

  const widthPct = 100 / pages.length;
  const offsetPct = -index * widthPct;
  const dragPct = containerRef.current
    ? (dragX / containerRef.current.clientWidth) * 100
    : 0;

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex justify-center gap-2 py-2">
        {pages.map((page, i) => (
          <button
            key={page.label}
            type="button"
            onClick={() => setIndex(i)}
            className={`rounded-full px-4 py-1 text-xs font-medium transition ${
              i === index ? "bg-white text-slate-900" : "bg-white/10 text-white/70"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 touch-pan-y overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={() => dragging && endDrag()}
      >
        <div
          className="flex h-full"
          style={{
            width: `${pages.length * 100}%`,
            transform: `translateX(${offsetPct + dragPct}%)`,
            transition: dragging ? "none" : "transform 300ms ease",
          }}
        >
          {pages.map((page) => (
            <div key={page.label} className="h-full" style={{ width: `${widthPct}%` }}>
              {page.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
