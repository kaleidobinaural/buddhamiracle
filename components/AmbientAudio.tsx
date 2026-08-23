'use client';

import { useState, useRef, useEffect } from 'react';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attempt to recover audio state across page loads if we want,
  // but for simplicity and browser policy, we'll let user manually start it,
  // or it persists during client-side navigation within the app.
  
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/ambient-temple.mp3"
        loop
        preload="auto"
      />
      <button 
        className={`ambient-audio-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        title={isPlaying ? "Mute Ambient Sound" : "Play Ambient Sound"}
        aria-label="Toggle Ambient Sound"
      >
        <span className="icon">{isPlaying ? '🔊' : '🔇'}</span>
      </button>

      <style jsx>{`
        .ambient-audio-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(20, 20, 20, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(212, 160, 23, 0.3);
          color: #d4a017;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .ambient-audio-btn:hover {
          background: rgba(212, 160, 23, 0.1);
          border-color: rgba(212, 160, 23, 0.6);
          transform: scale(1.05);
        }
        .ambient-audio-btn.playing {
          border-color: rgba(212, 160, 23, 0.8);
          box-shadow: 0 0 15px rgba(212, 160, 23, 0.3);
        }
        .icon {
          font-size: 1.2rem;
          filter: grayscale(1) sepia(1) hue-rotate(30deg) brightness(1.5);
        }

        @media (max-width: 768px) {
          .ambient-audio-btn {
            bottom: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
          }
          .icon {
            font-size: 1rem;
          }
        }
      `}</style>
    </>
  );
}
