const fs = require('fs');
const path = require('path');

const locales = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'km', 'ko', 'my', 'pt', 'th', 'vi', 'zh'];

const storeEN = {
  heroEyebrow: "Quiesan × Temple of Light",
  heroTitle: "THE MASTER KEY",
  heroSub: "Find Deep Stillness in 15 Minutes.",
  heroDesc: "A guided 5Hz immersion designed for modern minds.",
  heroCaption: "Experience a free sample above.",
  socialProofPre: "Over ",
  socialProofPost: " souls have already entered.",
  instantAccessTitle: "Enter Now — Instant Access",
  mostChosen: "Most Chosen",
  omManiTitle: "Om Mani 5Hz Experience",
  omManiF1: "5Hz Immersion for Deep Focus",
  omManiF2: "High-Resolution Mandala Artwork",
  omManiF3: "Activation & Meditation Guide",
  getInstantAccess: "Get Instant Access – ",
  microNote: "Instant download. No subscription. One-time access.",
  amuletTitle: "Sacred Cosmic Amulet",
  amuletF1: "Digital Sacred Amulet",
  amuletF2: "Cosmic Symbol Pack",
  amuletF3: "Usage Guide",
  receiveAmulet: "Receive Amulet – ",
  bundleTitle: "Complete Stillness Bundle",
  bestValue: "Best Value",
  saveAmount: "Save $3.34",
  bundleF1: "Om Mani 5Hz Experience",
  bundleF2: "Sacred Cosmic Amulet",
  bundleF3: "Special Bundle Price",
  getBundle: "Get Bundle – ",
  lotusTitle: "Temple Offerings",
  lotusDesc: "Support the sanctuary and collect Lotus flowers to manifest your wishes on the Wish Roof.",
  candlePack: "Candle Package",
  candleDesc: "A small light to brighten the dark.",
  lotusPack: "Lotus Package",
  lotusDesc2: "A blooming flower of wisdom.",
  malaPack: "Mala Package",
  malaDesc: "A sacred string of beads for deep meditation. Instantly become a Supporter.",
  buyLotus: "Offer ",
  vipTitle: "Exclusive Sanctuary Tiers",
  vipDesc: "For those who wish to make a profound impact.",
  premiumTier: "Premium Tier",
  premiumF1: "Everything in the Bundle",
  premiumF2: "Direct Email Support with the Guru",
  premiumF3: "Exclusive 432Hz Soundscape",
  getPremium: "Get Premium – ",
  vvipTier: "VVIP Foundation Tier",
  vvipF1: "Lifetime Access to all future Quiesan products",
  vvipF2: "1-on-1 Quarterly Zoom Session with the Founder",
  vvipF3: "Engraved in the Founders' Hall",
  applyVvip: "Apply for VVIP – ",
  sciTitle: "Sound Design Philosophy",
  sciDesc: "Immersive audio experiences designed to promote focus and stillness.",
  sci1Title: "Structured Sound Composition",
  sci1Desc: "Audio designed to facilitate proven mental states.",
  sci2Title: "Reflective Acoustics",
  sci2Desc: "Meditative audio experiences that stimulate emotional growth.",
  sci3Title: "Harmonic Frequency Layers",
  sci3Desc: "Provides deep stillness through a 5Hz composition."
};

const storeKO = {
  heroEyebrow: "Quiesan × 빛의 사원",
  heroTitle: "마스터 키 (THE MASTER KEY)",
  heroSub: "15분 만에 깊은 고요를 찾으세요.",
  heroDesc: "현대인을 위해 설계된 5Hz 몰입형 가이드.",
  heroCaption: "위에서 무료 샘플을 경험해보세요.",
  socialProofPre: "이미 ",
  socialProofPost: "명의 영혼이 참여했습니다.",
  instantAccessTitle: "지금 바로 입장하세요 — 즉시 접속",
  mostChosen: "가장 인기",
  omManiTitle: "옴마니 5Hz 경험",
  omManiF1: "깊은 집중을 위한 5Hz 몰입",
  omManiF2: "고해상도 만다라 아트워크",
  omManiF3: "활성화 및 명상 가이드",
  getInstantAccess: "즉시 접속하기 – ",
  microNote: "즉시 다운로드. 구독 아님. 평생 소장.",
  amuletTitle: "신성한 우주 부적",
  amuletF1: "디지털 신성한 부적",
  amuletF2: "우주 심볼 팩",
  amuletF3: "사용 가이드",
  receiveAmulet: "부적 받기 – ",
  bundleTitle: "완전한 고요 번들",
  bestValue: "최고의 가치",
  saveAmount: "$3.34 절약",
  bundleF1: "옴마니 5Hz 경험",
  bundleF2: "신성한 우주 부적",
  bundleF3: "특별 번들 가격",
  getBundle: "번들 받기 – ",
  lotusTitle: "사원 공양 (연꽃)",
  lotusDesc: "사원을 후원하고 연꽃을 모아 소원 지붕에 소원을 남겨보세요.",
  candlePack: "양초 패키지",
  candleDesc: "어둠을 밝히는 작은 빛.",
  lotusPack: "연꽃 패키지",
  lotusDesc2: "지혜의 만개하는 꽃.",
  malaPack: "염주 패키지",
  malaDesc: "깊은 명상을 위한 신성한 염주. 즉시 '후원자' 등급 획득.",
  buyLotus: "공양하기 ",
  vipTitle: "특별한 성역 티어",
  vipDesc: "깊은 발자취를 남기고자 하는 분들을 위해.",
  premiumTier: "프리미엄 티어",
  premiumF1: "번들의 모든 항목 포함",
  premiumF2: "구루와의 직접 이메일 지원",
  premiumF3: "독점 432Hz 사운드스케이프",
  getPremium: "프리미엄 받기 – ",
  vvipTier: "VVIP 파운데이션 티어",
  vvipF1: "향후 모든 Quiesan 제품 평생 접속권",
  vvipF2: "설립자와의 분기별 1:1 줌 세션",
  vvipF3: "설립자의 전당에 영구 각인",
  applyVvip: "VVIP 신청하기 – ",
  sciTitle: "사운드 디자인 철학",
  sciDesc: "자연스러운 주파수 구성에서 영감을 받아 설계된 몰입형 오디오 경험은, 집중과 고요를 위해 만들어졌습니다.",
  sci1Title: "구조화된 사운드 컴포지션",
  sci1Desc: "자연연구 입증된 마음 상태를 촉진하도록 설계된 오디오입니다.",
  sci2Title: "성찰적 음향",
  sci2Desc: "정서적 성장을 자극하는 명상적 오디오 경험입니다.",
  sci3Title: "조화 주파수 레이어",
  sci3Desc: "신체의 5Hz 컴포지션은 깊은 정적을 제공합니다."
};

const resEN = {
  title: "Millions Touched by the Frequency",
  desc: "From Seoul to Sao Paulo, these moments of stillness have traveled across the world.",
  related: "Related videos"
};

const resKO = {
  title: "주파수가 닿은 수백만의 영혼들",
  desc: "서울에서 상파울루까지, 이 고요의 순간들이 전 세계로 퍼져나갔습니다.",
  related: "관련 비디오"
};

locales.forEach(loc => {
  const p = path.join('messages', `${loc}.json`);
  if (fs.existsSync(p)) {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    
    // Fallback to EN if not KO
    data.Store = loc === 'ko' ? storeKO : storeEN;
    data.Resonance = loc === 'ko' ? resKO : resEN;
    
    // Fix Nav
    data.Nav = data.Nav || {};
    data.Nav.store = loc === 'ko' ? "Quiesan 스토어" : (loc === 'ja' ? "Quiesan ストア" : (loc === 'zh' ? "Quiesan 商店" : "Quiesan Store"));
    data.Nav.resonance = loc === 'ko' ? "글로벌 울림" : "Global Resonance";
    
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  }
});
console.log('JSON updated successfully');
