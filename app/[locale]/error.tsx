'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-page flex items-center justify-center min-h-screen relative overflow-hidden bg-[#050505] text-white">
      <div className="error-atmosphere absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(231,76,60,0.05)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="error-content text-center z-10 p-6 animate-fade-up max-w-lg mx-auto">
        <div className="text-6xl mb-6 drop-shadow-2xl opacity-60">🥀</div>
        <h2 className="text-3xl font-serif mb-6 tracking-wide text-[#d4a017]">A Ripple in the Pond</h2>
        <p className="text-[#a0a0a0] leading-relaxed mb-10 italic">
          "Something unexpected occurred while meditating on this page.
          Do not worry; impermanence is the nature of all things."
        </p>
        <button onClick={() => reset()} className="btn-gold-glow-v2 px-8 py-3 text-sm tracking-widest uppercase inline-block">
          Try Again
        </button>
      </div>
      
      <style>{`
        .btn-gold-glow-v2 {
          background: rgba(212, 160, 23, 0.1);
          border: 1px solid rgba(212, 160, 23, 0.5);
          color: #d4a017;
          border-radius: 4px;
          transition: all 0.4s ease;
        }
        .btn-gold-glow-v2:hover {
          background: rgba(212, 160, 23, 0.2);
          box-shadow: 0 0 20px rgba(212, 160, 23, 0.4);
          color: #fff;
        }
      `}</style>
    </main>
  );
}
