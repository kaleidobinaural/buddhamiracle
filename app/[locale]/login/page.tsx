export const runtime = 'edge';
import { signIn } from "@/auth"
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access personalized features like Guru Chat history and Wish Inscriptions.',
};

export default function LoginPage() {
  return (
    <main className="login-page fade-in">
      <div className="login-container glass-card">
        <header className="login-header">
          <div className="login-icon" aria-hidden="true">☸</div>
          <h1 className="login-title">Enter the Sanctuary</h1>
          <p className="login-subtitle">
            Sign in to track your wishes, preserve your conversations with the Guru, and honor your contributions.
          </p>
        </header>

        <div className="login-actions">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <button className="btn-social google-btn" type="submit">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
          <div className="login-disclaimer">
            <p>
              By continuing, you acknowledge that you have read and agree to our 
              <Link href="/terms" className="legal-link"> Terms of Service </Link> 
              and 
              <Link href="/privacy" className="legal-link"> Privacy Policy</Link>.
            </p>
            <p>We respect your privacy. No personal data other than your email and name is stored.</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: calc(100dvh - var(--nav-height));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .login-container {
          width: 100%;
          max-width: 460px;
          padding: 48px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .login-icon {
          font-size: 2.5rem;
          color: var(--primary-gold);
          opacity: 0.8;
          margin-bottom: 24px;
          filter: drop-shadow(0 0 10px var(--primary-glow));
        }

        .login-title {
          font-family: var(--font-serif);
          font-size: 2.2rem;
          color: var(--text-primary);
          margin-bottom: 16px;
        }

        .login-subtitle {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .login-actions {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 8px;
        }

        .btn-social {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          color: var(--text-primary);
          font-family: var(--font-ui);
          font-size: 1rem;
          font-weight: 500;
          transition: all var(--duration-base) var(--ease-smooth);
        }

        .btn-social:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .login-disclaimer {
          font-size: 0.75rem;
          color: var(--text-tertiary);
          line-height: 1.6;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legal-link {
          color: var(--primary-gold);
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: opacity 0.2s;
        }
        .legal-link:hover {
          opacity: 0.7;
        }
      `}</style>
    </main>
  );
}
