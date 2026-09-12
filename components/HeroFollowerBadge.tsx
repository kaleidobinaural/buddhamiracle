'use client';

import { useState, useEffect } from 'react';

interface Props {
  template: string; // e.g. "틱톡 @buddha_miracle {count} 순례자의 공간"
  defaultCount?: string;
}

export default function HeroFollowerBadge({ template, defaultCount = '366,000+' }: Props) {
  const [count, setCount] = useState(defaultCount);

  useEffect(() => {
    fetch('https://script.google.com/macros/s/AKfycby0kLrjrJjKnjMyJvyjzecSgocdN6_PXNp-LjgfGSnrE0xNSvYF_kA-bGsp4d0Ec5vH/exec?t=' + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data?.followerCount && typeof data.followerCount === 'number') {
          const c = data.followerCount;
          if (c >= 1000000) {
            setCount(`${(c / 1000000).toFixed(1)}M+`);
          } else if (c >= 1000) {
            setCount(`${Math.floor(c / 1000).toLocaleString()}K+`);
          } else {
            setCount(`${c.toLocaleString()}+`);
          }
        }
      })
      .catch(() => {
        // Safe silent catch — fallback remains 366,000+
      });
  }, []);

  const fallbackTemplate = '✨ 틱톡 @buddha_miracle {count} 순례자의 공간';
  const effectiveTemplate = (!template || template.toUpperCase().includes('INDEX.')) ? fallbackTemplate : template;
  const badgeText = effectiveTemplate.replace('{count}', count);

  return (
    <a
      href="https://www.tiktok.com/@buddha_miracle"
      target="_blank"
      rel="noopener noreferrer"
      className="hero-badge hero-follower-badge animate-fade-up"
      title="TikTok @buddha_miracle"
      style={{ textDecoration: 'none', cursor: 'pointer' }}
    >
      <span className="badge-dot" />
      <span className="badge-text">{badgeText} ↗</span>
    </a>
  );
}
