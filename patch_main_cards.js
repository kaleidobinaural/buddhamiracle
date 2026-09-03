const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// New Index card keys for Store and Resonance
const newKeys = {
  ko: {
    cardStoreTitle: 'Quiesan 스토어',
    cardStoreDesc: '연꽃과 명상 아트를 만나보세요.',
    cardResonanceTitle: '글로벌 울림',
    cardResonanceDesc: '전 세계 구도자들과 공명하세요.',
    buyLotus: '연꽃 구매하기',
  },
  en: {
    cardStoreTitle: 'Quiesan Store',
    cardStoreDesc: 'Explore lotus offerings and meditation art.',
    cardResonanceTitle: 'Global Resonance',
    cardResonanceDesc: 'Resonate with seekers around the world.',
    buyLotus: 'Purchase Lotus',
  },
  ja: {
    cardStoreTitle: 'Quiesan ストア',
    cardStoreDesc: '蓮の花と瞑想アートを探求しましょう。',
    cardResonanceTitle: 'グローバル共鳴',
    cardResonanceDesc: '世界中の探求者と共鳴しましょう。',
    buyLotus: '蓮を購入する',
  },
  zh: {
    cardStoreTitle: 'Quiesan 商店',
    cardStoreDesc: '探索莲花供品和冥想艺术。',
    cardResonanceTitle: '全球共鸣',
    cardResonanceDesc: '与世界各地的探索者共鸣。',
    buyLotus: '购买莲花',
  },
  es: {
    cardStoreTitle: 'Tienda Quiesan',
    cardStoreDesc: 'Explora ofrendas de loto y arte de meditación.',
    cardResonanceTitle: 'Resonancia Global',
    cardResonanceDesc: 'Resuena con buscadores de todo el mundo.',
    buyLotus: 'Comprar Lotus',
  },
  fr: {
    cardStoreTitle: 'Boutique Quiesan',
    cardStoreDesc: 'Découvrez les offrandes de lotus et l\'art de méditation.',
    cardResonanceTitle: 'Résonance Mondiale',
    cardResonanceDesc: 'Résonnez avec des chercheurs du monde entier.',
    buyLotus: 'Acheter des Lotus',
  },
  de: {
    cardStoreTitle: 'Quiesan Shop',
    cardStoreDesc: 'Entdecken Sie Lotus-Angebote und Meditationskunst.',
    cardResonanceTitle: 'Globale Resonanz',
    cardResonanceDesc: 'Resonieren Sie mit Suchenden aus aller Welt.',
    buyLotus: 'Lotus kaufen',
  },
  pt: {
    cardStoreTitle: 'Loja Quiesan',
    cardStoreDesc: 'Explore oferendas de lótus e arte de meditação.',
    cardResonanceTitle: 'Ressonância Global',
    cardResonanceDesc: 'Ressoe com buscadores ao redor do mundo.',
    buyLotus: 'Comprar Lotus',
  },
  id: {
    cardStoreTitle: 'Toko Quiesan',
    cardStoreDesc: 'Jelajahi persembahan lotus dan seni meditasi.',
    cardResonanceTitle: 'Resonansi Global',
    cardResonanceDesc: 'Beresonansi dengan para pencari di seluruh dunia.',
    buyLotus: 'Beli Lotus',
  },
  vi: {
    cardStoreTitle: 'Cửa hàng Quiesan',
    cardStoreDesc: 'Khám phá cúng dường sen và nghệ thuật thiền định.',
    cardResonanceTitle: 'Cộng hưởng Toàn cầu',
    cardResonanceDesc: 'Cộng hưởng với những người tìm kiếm trên toàn thế giới.',
    buyLotus: 'Mua Hoa Sen',
  },
  th: {
    cardStoreTitle: 'ร้าน Quiesan',
    cardStoreDesc: 'สำรวจเครื่องบูชาดอกบัวและศิลปะการทำสมาธิ',
    cardResonanceTitle: 'การสั่นสะเทือนระดับโลก',
    cardResonanceDesc: 'สั่นสะเทือนร่วมกับผู้แสวงหาทั่วโลก',
    buyLotus: 'ซื้อดอกบัว',
  },
  ar: {
    cardStoreTitle: 'متجر Quiesan',
    cardStoreDesc: 'استكشف عروض اللوتس وفن التأمل.',
    cardResonanceTitle: 'الصدى العالمي',
    cardResonanceDesc: 'تردد صداك مع الباحثين حول العالم.',
    buyLotus: 'شراء اللوتس',
  },
  km: {
    cardStoreTitle: 'ហាង Quiesan',
    cardStoreDesc: 'ស្វែងរកការផ្តល់ជូនផ្កាឈូក និងសិល្បៈសមាធិ',
    cardResonanceTitle: 'ការwood ​​ worldwide',
    cardResonanceDesc: 'ចូលរួមជាមួយអ្នកស្វែងរកទូទាំងពិភពលោក',
    buyLotus: 'ទិញផ្កាឈូក',
  },
  my: {
    cardStoreTitle: 'Quiesan ဆိုင်',
    cardStoreDesc: 'ကြာပန်းပူဇော်မှုများနှင့် တရားထိုင်အနုပညာများကို ရှာဖွေပါ',
    cardResonanceTitle: 'ကမ္ဘာ့တုန်ခါမှု',
    cardResonanceDesc: 'ကမ္ဘာတဝှမ်းရှိ ရှာဖွေသူများနှင့် ပူးပေါင်းပါ',
    buyLotus: 'ကြာပန်း ဝယ်ယူရန်',
  },
};

fs.readdirSync(messagesDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const locale = path.basename(file, '.json');
  const filePath = path.join(messagesDir, file);
  let data;
  try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { console.error(`Error parsing ${file}:`, e); return; }

  const trans = newKeys[locale] || newKeys['en'];

  // Inject into Index namespace
  if (!data.Index) data.Index = {};
  data.Index.cardStoreTitle = trans.cardStoreTitle;
  data.Index.cardStoreDesc = trans.cardStoreDesc;
  data.Index.cardResonanceTitle = trans.cardResonanceTitle;
  data.Index.cardResonanceDesc = trans.cardResonanceDesc;

  // Fix buyLotus in Guru namespace
  if (!data.Guru) data.Guru = {};
  data.Guru.buyLotus = trans.buyLotus;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
});
