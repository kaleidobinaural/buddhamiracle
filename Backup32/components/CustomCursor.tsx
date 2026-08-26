'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(true);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);

      const target = e.target as HTMLElement;
      setIsPointer(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'A' ||
        target.tagName === 'BUTTON'
      );
    };

    const onMouseLeave = () => setIsHidden(true);
    const onMouseEnter = () => setIsHidden(false);

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  return (
    <>
      <div
        className={`cursor-dot ${isHidden ? 'hidden' : ''} ${isPointer ? 'pointer' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />
      <div
        className={`cursor-outline ${isHidden ? 'hidden' : ''} ${isPointer ? 'pointer' : ''}`}
        style={{ left: `${position.x}px`, top: `${position.y}px` }}
      />

      <style>{`
        .cursor-dot, .cursor-outline {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.1s var(--ease-smooth), opacity 0.3s ease, width 0.3s ease, height 0.3s ease;
        }

        .cursor-dot {
          width: 6px;
          height: 6px;
          background-color: var(--primary-gold);
          border-radius: 50%;
          box-shadow: 0 0 10px var(--primary-gold);
        }

        .cursor-outline {
          width: 30px;
          height: 30px;
          border: 1px solid var(--primary-gold);
          border-radius: 50%;
          opacity: 0.3;
          transition: all 0.3s var(--ease-expo);
        }

        .cursor-dot.hidden, .cursor-outline.hidden {
          opacity: 0;
        }

        /* Pointer Hover State */
        .cursor-dot.pointer {
          width: 12px;
          height: 12px;
          background-color: var(--primary-gold-bright);
        }

        .cursor-outline.pointer {
          width: 50px;
          height: 50px;
          opacity: 0.6;
          background: rgba(212, 160, 23, 0.05);
          border-color: var(--primary-gold-bright);
        }

        @media (max-width: 1024px) {
          .cursor-dot, .cursor-outline { display: none; }
        }

        /* Global Reset for Original Cursor */
        @media (min-width: 1025px) {
          body, a, button {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
