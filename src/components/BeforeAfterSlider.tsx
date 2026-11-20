"use client";

import { useRef, useState, useCallback } from "react";

export default function BeforeAfterSlider({
  before,
  after,
  altBefore,
  altAfter,
}: {
  before: string;
  after: string;
  altBefore: string;
  altAfter: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(98, Math.max(2, x)));
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-lg select-none touch-none bg-warmgray-100"
      onPointerDown={(e) => {
        dragging.current = true;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        update(e.clientX);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={after}
        alt={altAfter}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pos}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={before}
          alt={altBefore}
          className="absolute inset-0 h-full max-w-none object-cover"
          style={{ width: ref.current ? `${ref.current.offsetWidth}px` : "100%" }}
          draggable={false}
        />
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-2.5 py-1 text-[11px] font-semibold text-white">
        Prima
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-bronze px-2.5 py-1 text-[11px] font-semibold text-white">
        Dopo
      </span>

      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
        style={{ left: `${pos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-bronze text-white shadow-lg border-2 border-white">
          <span className="text-xs font-bold">↔</span>
        </div>
      </div>
    </div>
  );
}
