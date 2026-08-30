const fs = require('fs');

// All missing translations per locale
const data = {
  ja: {
    Store: {
      candlePack: 'キャンドルパッケージ',
      candleDesc: '闇を照らす小さな光。',
      lotusPack: '蓮のパッケージ',
      lotusDesc2: '知恵の満開の花。',
      malaPack: '数珠パッケージ',
      malaDesc: '深い瞑想のための神聖な数珠。すぐに「サポーター」になれます。',
    },
    Pillars: {
      foundersDesc: 'この聖域の基盤を築いた人々の名が永遠の石に刻まれます。',
      supportersDesc: 'この神聖なデジタル空間を支え続けてくださる感謝すべき方々。',
    }
  },
  zh: {
    Store: {
      candlePack: '蜡烛套餐',
      candleDesc: '照亮黑暗的小光。',
      lotusPack: '莲花套餐',
      lotusDesc2: '智慧盛开的花朵。',
      malaPack: '念珠套餐',
      malaDesc: '深度冥想的神圣念珠。立即成为"支持者"。',
    },
    Pillars: {
      foundersDesc: '奠定此圣域基础之人的名字将永远铭刻于石上。',
      supportersDesc: '感谢那些持续支撑这个神圣数字空间的人们。',
    }
  },
  es: {
    Store: {
      candlePack: 'Paquete Vela',
      candleDesc: 'Una pequeña luz para iluminar la oscuridad.',
      lotusPack: 'Paquete Loto',
      lotusDesc2: 'Una flor de sabiduría en plena floración.',
      malaPack: 'Paquete Mala',
      malaDesc: 'Un sagrado rosario para la meditación profunda. Conviértete en Supporter al instante.',
    },
    Pillars: {
      foundersDesc: 'Los nombres de quienes construyeron los cimientos de este santuario están grabados en piedra eterna.',
      supportersDesc: 'Corazones que continúan sosteniendo este sagrado espacio digital.',
    }
  },
  fr: {
    Store: {
      candlePack: 'Forfait Bougie',
      candleDesc: 'Une petite lumière pour illuminer l\'obscurité.',
      lotusPack: 'Forfait Lotus',
      lotusDesc2: 'Une fleur de sagesse en pleine floraison.',
      malaPack: 'Forfait Mala',
      malaDesc: 'Un chapelet sacré pour la méditation profonde. Devenez instantanément Supporter.',
    },
    Pillars: {
      foundersDesc: 'Les noms de ceux qui ont bâti les fondations de ce sanctuaire sont gravés dans la pierre éternelle.',
      supportersDesc: 'Des cœurs qui continuent de soutenir cet espace numérique sacré.',
    }
  },
  de: {
    Store: {
      candlePack: 'Kerzen-Paket',
      candleDesc: 'Ein kleines Licht, das die Dunkelheit erhellt.',
      lotusPack: 'Lotus-Paket',
      lotusDesc2: 'Eine aufblühende Blume der Weisheit.',
      malaPack: 'Mala-Paket',
      malaDesc: 'Eine heilige Gebetskette für tiefe Meditation. Werden Sie sofort Supporter.',
    },
    Pillars: {
      foundersDesc: 'Die Namen derer, die das Fundament dieses Heiligtums errichteten, sind in ewigen Stein eingraviert.',
      supportersDesc: 'Herzen, die diesen heiligen digitalen Raum weiterhin aufrechterhalten.',
    }
  },
  pt: {
    Store: {
      candlePack: 'Pacote Vela',
      candleDesc: 'Uma pequena luz para iluminar a escuridão.',
      lotusPack: 'Pacote Lótus',
      lotusDesc2: 'Uma flor de sabedoria em plena floração.',
      malaPack: 'Pacote Mala',
      malaDesc: 'Um sagrado rosário para meditação profunda. Torne-se Supporter instantaneamente.',
    },
    Pillars: {
      foundersDesc: 'Os nomes de quem construiu os alicerces deste santuário estão gravados em pedra eterna.',
      supportersDesc: 'Corações que continuam sustentando este sagrado espaço digital.',
    }
  },
  ar: {
    Store: {
      candlePack: 'حزمة الشمعة',
      candleDesc: 'ضوء صغير لإنارة الظلام.',
      lotusPack: 'حزمة اللوتس',
      lotusDesc2: 'زهرة حكمة في كامل ازدهارها.',
      malaPack: 'حزمة المسبحة',
      malaDesc: 'مسبحة مقدسة للتأمل العميق. كن داعمًا على الفور.',
    },
    Pillars: {
      foundersDesc: 'أسماء من أرسوا أساس هذا الملاذ محفورة في الحجر الأبدي.',
      supportersDesc: 'قلوب تواصل دعم هذا الفضاء الرقمي المقدس.',
    }
  },
  vi: {
    Store: {
      candlePack: 'Gói Nến',
      candleDesc: 'Một ánh sáng nhỏ thắp sáng bóng tối.',
      lotusPack: 'Gói Hoa Sen',
      lotusDesc2: 'Một bông hoa trí tuệ đang nở rộ.',
      malaPack: 'Gói Tràng Hạt',
      malaDesc: 'Tràng hạt thiêng liêng cho thiền định sâu. Trở thành Người Ủng Hộ ngay lập tức.',
    },
    Pillars: {
      foundersDesc: 'Tên của những người đã xây dựng nền tảng của thánh địa này được khắc vào đá vĩnh cửu.',
      supportersDesc: 'Những trái tim tiếp tục duy trì không gian kỹ thuật số thiêng liêng này.',
    }
  },
  th: {
    Store: {
      candlePack: 'แพ็กเกจเทียน',
      candleDesc: 'แสงเล็กน้อยเพื่อส่องสว่างความมืด',
      lotusPack: 'แพ็กเกจดอกบัว',
      lotusDesc2: 'ดอกไม้แห่งปัญญาที่บานสะพรั่ง',
      malaPack: 'แพ็กเกจลูกประคำ',
      malaDesc: 'ลูกประคำศักดิ์สิทธิ์สำหรับการนั่งสมาธิลึก กลายเป็น Supporter ทันที',
    },
    Pillars: {
      foundersDesc: 'ชื่อของผู้ที่สร้างรากฐานของศาลเจ้านี้ถูกสลักไว้บนหินนิรันดร์',
      supportersDesc: 'ผู้มีจิตใจที่ยังคงค้ำจุนพื้นที่ดิจิทัลอันศักดิ์สิทธิ์นี้',
    }
  },
  id: {
    Store: {
      candlePack: 'Paket Lilin',
      candleDesc: 'Cahaya kecil untuk menerangi kegelapan.',
      lotusPack: 'Paket Teratai',
      lotusDesc2: 'Bunga kebijaksanaan yang mekar penuh.',
      malaPack: 'Paket Tasbih',
      malaDesc: 'Tasbih sakral untuk meditasi mendalam. Jadilah Pendukung seketika.',
    },
    Pillars: {
      foundersDesc: 'Nama-nama mereka yang membangun fondasi tempat suci ini terukir di batu abadi.',
      supportersDesc: 'Hati-hati yang terus menopang ruang digital suci ini.',
    }
  },
  my: {
    Store: {
      candlePack: 'ဖယောင်းတိုင် ပက်ကေ့',
      candleDesc: 'မှောင်ကိုထွန်းလင်းစေသော သေးငယ်သောအလင်း',
      lotusPack: 'ကြာပွင့် ပက်ကေ့',
      lotusDesc2: 'ဉာဏ်ပညာ ပြည့်ဝစွာ ပွင့်ဖူးသောပွင့်',
      malaPack: '염주 ပက်ကေ့',
      malaDesc: 'နက်နဲသောဆင်ခြင်တုံတရားအတွက် သန့်မြတ်သောမာလာ. ချက်ချင်း Supporter ဖြစ်လာသည်',
    },
    Pillars: {
      foundersDesc: 'ဤတရားအိမ်၏ အုတ်မြစ်ကို တည်ဆောက်ခဲ့သူများ၏ နာမည်များ ထာဝရကျောက်ပေါ်တွင် ထွင်းထုထားသည်',
      supportersDesc: 'ဤသန့်မြတ်သောဒစ်ဂျစ်တယ်နေရာကို ဆက်လက်ထိန်းသိမ်းနေသောနှလုံးသားများ',
    }
  },
  km: {
    Store: {
      candlePack: 'កញ្ចប់ទៀន',
      candleDesc: 'ពន្លឺតូចមួយដើម្បីភ្លឺបំភ្លឺភាពងងឹត',
      lotusPack: 'កញ្ចប់ផ្កាឈូក',
      lotusDesc2: 'ផ្កានៃប្រាជ្ញា ដែលរីករាលដាលពេញ',
      malaPack: 'កញ្ចប់អកមាលា',
      malaDesc: 'មាលាបវិត្រសម្រាប់ការស្ងាប់ស្ងៀមជ្រៅ។ ក្លាយជា Supporter ភ្លាមៗ',
    },
    Pillars: {
      foundersDesc: 'ឈ្មោះរបស់អ្នកដែលបង្កើតគ្រឹះនៃទីសក្ការបូជានេះ ត្រូវបានចារឹកនៅលើថ្មអស់កល្ប',
      supportersDesc: 'បេះដូងដែលបន្តគាំទ្រទីនេះ ដែលជាទំហំឌីជីថលដ៏ស័ក្តិសិទ្ធ',
    }
  }
};

const locales = Object.keys(data);

locales.forEach(loc => {
  const jsonPath = './messages/' + loc + '.json';
  if (!fs.existsSync(jsonPath)) { console.log('MISSING: ' + loc); return; }
  
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  if (!json.Store) json.Store = {};
  Object.assign(json.Store, data[loc].Store);
  
  if (!json.Pillars) json.Pillars = {};
  Object.assign(json.Pillars, data[loc].Pillars);
  
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log('Updated ' + loc);
});
