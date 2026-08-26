'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CharacterAvatarProps {
  src: string;
  alt?: string;
  message?: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  delay?: number;
  width?: number;
  height?: number;
}

export default function CharacterAvatar({ 
  src, 
  alt = "Character", 
  message, 
  position = 'bottom-right', 
  delay = 0,
  width = 180,
  height = 240
}: CharacterAvatarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isBubbleClosed, setIsBubbleClosed] = useState(false);
  // Portal needs document to be available (client-side only)
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!mounted || !isVisible || isBubbleClosed) return null;

  // ★ Portal: render directly under <body> to escape any parent transform
  return createPortal(
    <>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`avatar-container ${position}`}
      >
        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay / 1000 + 0.3 }}
            className="avatar-message"
          >
            {message}
            <button 
              className="bubble-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsBubbleClosed(true);
              }}
              aria-label="Close comment"
            >
              ×
            </button>
          </motion.div>
        )}
        
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="avatar-image-wrapper"
        >
          <Image 
            src={src} 
            alt={alt} 
            width={width} 
            height={height} 
            style={{ objectFit: 'contain' }}
            priority
          />
        </motion.div>
      </motion.div>

      <style>{`
        /* ── Portal root: always fixed to viewport ── */
        .avatar-container {
          position: fixed;
          z-index: 9000;      /* above everything including modals */
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          pointer-events: none;
        }

        .avatar-container.bottom-right {
          bottom: 80px;
          right: 40px;
        }

        .avatar-container.bottom-left {
          bottom: 80px;
          left: 40px;
        }

        .avatar-container.center {
          bottom: 50%;
          right: 50%;
          transform: translate(50%, 50%);
        }

        .avatar-message {
          position: relative;
          background: rgba(20, 20, 20, 0.95);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(212, 160, 23, 0.45);
          color: #fff6d9;
          padding: 16px 36px 16px 24px;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
          font-size: 0.95rem;
          max-width: 280px;
          line-height: 1.6;
          pointer-events: auto;
          font-family: var(--font-sans, system-ui, sans-serif);
          text-align: center;
        }

        .bubble-close-btn {
          position: absolute;
          top: 6px;
          right: 12px;
          background: none;
          border: none;
          color: rgba(212, 160, 23, 0.5);
          font-size: 18px;
          cursor: pointer;
          line-height: 1;
          padding: 2px;
          transition: all 0.2s;
        }

        .bubble-close-btn:hover {
          color: var(--primary-gold);
          transform: scale(1.1);
        }

        /* Speech bubble tail (pointing down toward character) */
        .avatar-message::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 10px solid rgba(212, 160, 23, 0.45);
        }

        .avatar-message::before {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid rgba(20, 20, 20, 0.95);
          z-index: 1;
        }

        .avatar-image-wrapper {
          pointer-events: auto;
          filter: drop-shadow(0 15px 25px rgba(0,0,0,0.5));
          flex-shrink: 0;
        }

        /* ── Tablet ── */
        @media (max-width: 768px) {
          .avatar-container {
            gap: 10px;
          }
          .avatar-container.bottom-right {
            bottom: 70px;
            right: 20px;
          }
          .avatar-container.bottom-left {
            bottom: 70px;
            left: 20px;
          }
          .avatar-message {
            font-size: 0.85rem;
            max-width: 220px;
            padding: 12px 28px 12px 16px;
          }
          .avatar-image-wrapper img {
            width: 120px !important;
            height: auto !important;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .avatar-container.bottom-right {
            bottom: 64px;
            right: 12px;
          }
          .avatar-container.bottom-left {
            bottom: 64px;
            left: 12px;
          }
          .avatar-message {
            font-size: 0.8rem;
            max-width: 170px;
            padding: 10px 24px 10px 14px;
            border-radius: 16px;
          }
          .bubble-close-btn {
            top: 4px;
            right: 8px;
            font-size: 16px;
          }
          .avatar-image-wrapper img {
            width: 80px !important;
            height: auto !important;
          }
        }
      `}</style>
    </>,
    document.body
  );
}
