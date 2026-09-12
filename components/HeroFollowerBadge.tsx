'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  channelLabel?: string;
  communityTemplate?: string;
  defaultCount?: string;
}

export default function HeroFollowerBadge({
  channelLabel,
  communityTemplate,
  defaultCount = '636K+'
}: Props) {
  const t = useTranslations('Index');
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

  let translatedChannel = '';
  try {
    translatedChannel = t('heroBadgeChannel');
  } catch {}
  const safeChannel = channelLabel || 
    (translatedChannel && !translatedChannel.includes('heroBadgeChannel') ? translatedChannel : 'TikTok @BUDDHA_MIRACLE');

  let translatedCommunity = '';
  try {
    translatedCommunity = t('heroBadgeCommunity', { count });
  } catch {}
  const safeCommunity = communityTemplate 
    ? communityTemplate.replace('{count}', count)
    : (translatedCommunity && !translatedCommunity.includes('heroBadgeCommunity') ? translatedCommunity : `${count} Pilgrims' Sanctuary`);

  return (
    <div className="hero-badge hero-follower-badge animate-fade-up">
      <div className="badge-text-stack">
        <div className="badge-channel-row">
          <span className="badge-dot" />
          <span className="badge-channel-title">{safeChannel}</span>
        </div>
        <span className="badge-community-count">{safeCommunity}</span>
      </div>
    </div>
  );
}
