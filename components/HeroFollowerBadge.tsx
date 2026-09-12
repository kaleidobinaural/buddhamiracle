'use client';

import { useState, useEffect } from 'react';

interface Props {
  channelLabel?: string;
  communityTemplate?: string;
  defaultCount?: string;
}

export default function HeroFollowerBadge({
  channelLabel = '틱톡 @BUDDHA_MIRACLE',
  communityTemplate = '{count} 순례자의 공간',
  defaultCount = '636K+'
}: Props) {
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
        // Safe silent catch — fallback remains 636K+
      });
  }, []);

  const safeChannel = (!channelLabel || channelLabel.toUpperCase().includes('INDEX.'))
    ? '틱톡 @BUDDHA_MIRACLE'
    : channelLabel;

  const safeCommunity = (!communityTemplate || communityTemplate.toUpperCase().includes('INDEX.'))
    ? '{count} 순례자의 공간'
    : communityTemplate;

  const communityText = safeCommunity.replace('{count}', count);

  return (
    <div className="hero-badge hero-follower-badge animate-fade-up">
      <div className="badge-text-stack">
        <div className="badge-channel-row">
          <span className="badge-dot" />
          <span className="badge-channel-title">{safeChannel}</span>
        </div>
        <span className="badge-community-count">{communityText}</span>
      </div>
    </div>
  );
}
