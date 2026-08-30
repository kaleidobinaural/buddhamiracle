const fs = require('fs');

const translations = {
  ar: {
    Nav: { resonance: 'صدى عالمي' },
    Pillars: {
      foundersHall: 'قاعة المؤسسين',
      supportersWall: 'حائط الداعمين',
      emptySupporter: 'العمود الأول ينتظر أن يُنقش.'
    },
    Resonance: {
      title: 'ملايين تأثروا بالتردد',
      desc: 'من سيول إلى ساو باولو، سافرت لحظات السكون هذه عبر العالم.',
      followBtn: 'تابع @buddha_miracle على تيك توك'
    }
  },
  de: {
    Nav: { resonance: 'Globale Resonanz' },
    Pillars: {
      foundersHall: 'Halle der Gründer',
      supportersWall: 'Wand der Unterstützer',
      emptySupporter: 'Die erste Säule wartet darauf, beschriftet zu werden.'
    },
    Resonance: {
      title: 'Millionen von der Frequenz berührt',
      desc: 'Von Seoul bis Sao Paulo sind diese Momente der Stille um die Welt gereist.',
      followBtn: 'Folge @buddha_miracle auf TikTok'
    }
  },
  en: {
    Nav: { resonance: 'Global Resonance' },
    Pillars: {
      foundersHall: "Founders' Hall",
      supportersWall: "Supporter's Wall",
      emptySupporter: 'The first pillar is waiting to be inscribed.'
    },
    Resonance: {
      title: 'Millions Touched by the Frequency',
      desc: 'From Seoul to Sao Paulo, these moments of stillness have traveled across the world.',
      followBtn: 'Follow @buddha_miracle on TikTok'
    }
  },
  es: {
    Nav: { resonance: 'Resonancia Global' },
    Pillars: {
      foundersHall: 'Salón de los Fundadores',
      supportersWall: 'Muro de los Simpatizantes',
      emptySupporter: 'El primer pilar espera ser inscrito.'
    },
    Resonance: {
      title: 'Millones Tocados por la Frecuencia',
      desc: 'Desde Seúl hasta Sao Paulo, estos momentos de quietud han viajado por el mundo.',
      followBtn: 'Sigue a @buddha_miracle en TikTok'
    }
  },
  fr: {
    Nav: { resonance: 'Résonance Mondiale' },
    Pillars: {
      foundersHall: 'Salle des Fondateurs',
      supportersWall: 'Mur des Sympathisants',
      emptySupporter: 'Le premier pilier attend d\'être inscrit.'
    },
    Resonance: {
      title: 'Des Millions Touchés par la Fréquence',
      desc: 'De Séoul à Sao Paulo, ces moments de silence ont voyagé à travers le monde.',
      followBtn: 'Suivez @buddha_miracle sur TikTok'
    }
  },
  id: {
    Nav: { resonance: 'Resonansi Global' },
    Pillars: {
      foundersHall: 'Aula Pendiri',
      supportersWall: 'Dinding Pendukung',
      emptySupporter: 'Pilar pertama menunggu untuk diukir.'
    },
    Resonance: {
      title: 'Jutaan Orang Tersentuh oleh Frekuensi',
      desc: 'Dari Seoul hingga Sao Paulo, momen-momen keheningan ini telah melintasi dunia.',
      followBtn: 'Ikuti @buddha_miracle di TikTok'
    }
  },
  ja: {
    Nav: { resonance: 'グローバル・レゾナンス' },
    Pillars: {
      foundersHall: '創設者の殿堂',
      supportersWall: 'サポーターの壁',
      emptySupporter: '最初の柱が刻印されるのを待っています。'
    },
    Resonance: {
      title: '周波数に触れた何百万もの魂',
      desc: 'ソウルからサンパウロまで、この静寂の瞬間が世界中を旅しました。',
      followBtn: 'TikTokで@buddha_miracleをフォロー'
    }
  },
  km: {
    Nav: { resonance: 'សម្លេងសកល' },
    Pillars: {
      foundersHall: 'សាលស្ថាបនិក',
      supportersWall: 'ជញ្ជាំងអ្នកគាំទ្រ',
      emptySupporter: 'សសរទីមួយកំពុងរង់ចាំការចារឹក។'
    },
    Resonance: {
      title: 'មនុស្សរាប់លាននាក់ត្រូវបានប៉ះដោយប្រេកង់',
      desc: 'ពីទីក្រុងសេអ៊ូលដល់ទីក្រុងសៅប៉ូឡូ ពេលវេលានៃភាពស្ងៀមស្ងាត់ទាំងនេះបានធ្វើដំណើរជុំវិញពិភពលោក។',
      followBtn: 'តាមដាន @buddha_miracle នៅលើ TikTok'
    }
  },
  ko: {
    Nav: { resonance: '글로벌 울림' },
    Pillars: {
      foundersHall: '창립자의 전당',
      supportersWall: '후원자의 벽',
      emptySupporter: '첫 번째 기둥이 새겨지기를 기다리고 있습니다.'
    },
    Resonance: {
      title: '주파수가 닿은 수백만의 영혼들',
      desc: '서울에서 상파울루까지, 이 고요의 순간들이 전 세계로 퍼져나갔습니다.',
      followBtn: 'TikTok에서 @buddha_miracle 팔로우하기'
    }
  },
  my: {
    Nav: { resonance: 'ကမ္ဘာလုံးဆိုင်ရာ ပဲ့တင်သံ' },
    Pillars: {
      foundersHall: 'တည်ထောင်သူများခန်းမ',
      supportersWall: 'ထောက်ခံသူများနံရံ',
      emptySupporter: 'ပထမဆုံးတိုင်ကို ကမ္ပည်းထိုးရန် စောင့်ဆိုင်းနေသည်။'
    },
    Resonance: {
      title: 'ကြိမ်နှုန်းဖြင့် ထိတွေ့ခံရသူ သန်းပေါင်းများစွာ',
      desc: 'ဆိုးလ်မှ ဆော်ပေါ်လိုအထိ၊ ဤငြိမ်သက်ခြင်းအချိန်များသည် ကမ္ဘာတဝှမ်းသို့ ရောက်ရှိသွားသည်။',
      followBtn: 'TikTok တွင် @buddha_miracle ကို Follow လုပ်ပါ'
    }
  },
  pt: {
    Nav: { resonance: 'Ressonância Global' },
    Pillars: {
      foundersHall: 'Salão dos Fundadores',
      supportersWall: 'Muro dos Apoiadores',
      emptySupporter: 'O primeiro pilar espera para ser inscrito.'
    },
    Resonance: {
      title: 'Milhões Tocados pela Frequência',
      desc: 'De Seul a São Paulo, esses momentos de quietude viajaram pelo mundo.',
      followBtn: 'Siga @buddha_miracle no TikTok'
    }
  },
  th: {
    Nav: { resonance: 'เสียงสะท้อนระดับโลก' },
    Pillars: {
      foundersHall: 'หอเกียรติยศผู้ก่อตั้ง',
      supportersWall: 'กำแพงผู้สนับสนุน',
      emptySupporter: 'เสาต้นแรกกำลังรอการจารึก'
    },
    Resonance: {
      title: 'หลายล้านคนสัมผัสได้ถึงคลื่นความถี่',
      desc: 'จากโซลถึงเซาเปาโล ช่วงเวลาแห่งความสงบเหล่านี้ได้เดินทางไปทั่วโลก',
      followBtn: 'ติดตาม @buddha_miracle บน TikTok'
    }
  },
  vi: {
    Nav: { resonance: 'Sự Cộng Hưởng Toàn Cầu' },
    Pillars: {
      foundersHall: 'Sảnh Sáng Lập',
      supportersWall: 'Bức Tường Người Ủng Hộ',
      emptySupporter: 'Trụ cột đầu tiên đang chờ được khắc tên.'
    },
    Resonance: {
      title: 'Hàng Triệu Người Được Chạm Đến Bởi Tần Số',
      desc: 'Từ Seoul đến Sao Paulo, những khoảnh khắc tĩnh lặng này đã lan tỏa khắp thế giới.',
      followBtn: 'Theo dõi @buddha_miracle trên TikTok'
    }
  },
  zh: {
    Nav: { resonance: '全球共鸣' },
    Pillars: {
      foundersHall: '创始人殿堂',
      supportersWall: '支持者之墙',
      emptySupporter: '第一根柱子正等待被铭刻。'
    },
    Resonance: {
      title: '数百万灵魂被频率触动',
      desc: '从首尔到圣保罗，这些宁静的时刻传遍了全世界。',
      followBtn: '在TikTok上关注 @buddha_miracle'
    }
  }
};

const locales = Object.keys(translations);

locales.forEach(loc => {
  const jsonPath = './messages/' + loc + '.json';
  if (!fs.existsSync(jsonPath)) return;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  if (!data.Nav) data.Nav = {};
  if (!data.Pillars) data.Pillars = {};
  if (!data.Resonance) data.Resonance = {};
  
  data.Nav.resonance = translations[loc].Nav.resonance;
  data.Pillars.foundersHall = translations[loc].Pillars.foundersHall;
  data.Pillars.supportersWall = translations[loc].Pillars.supportersWall;
  data.Pillars.emptySupporter = translations[loc].Pillars.emptySupporter;
  data.Resonance.title = translations[loc].Resonance.title;
  data.Resonance.desc = translations[loc].Resonance.desc;
  data.Resonance.followBtn = translations[loc].Resonance.followBtn;
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated ' + loc);
});
