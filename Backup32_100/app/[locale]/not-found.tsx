import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="error-page flex items-center justify-center min-h-screen relative overflow-hidden bg-[#050505] text-white">
      <div className="error-atmosphere absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(212,160,23,0.1)_0%,transparent_60%)] pointer-events-none" />
      
      <div className="error-content text-center z-10 p-6 animate-fade-up max-w-lg mx-auto flex flex-col items-center">
        <div className="mb-8 w-48 h-48 relative drop-shadow-2xl opacity-90">
          <img 
            src="/images/bori/bori_sleeping.png" 
            alt="Bori Sleeping" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-8xl font-serif text-gradient-gold-v2 mb-4 drop-shadow-2xl opacity-80">404</div>
        <h2 className="text-3xl font-serif mb-6 tracking-wide">The Path is Obscured</h2>
        <p className="text-[#a0a0a0] leading-relaxed mb-10 italic">
          "The sanctuary you are seeking seems to be hidden in the mist.<br/>
          Bori fell asleep waiting. Let's return to the center."
        </p>
        <Link href="/" className="btn-gold-glow-v2 px-8 py-3 text-sm tracking-widest uppercase inline-block">
          Return to Sanctuary
        </Link>
      </div>
      
      <style>{`
        .text-gradient-gold-v2 {
          background: linear-gradient(180deg, #FFF6D9 0%, #D4A017 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
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
