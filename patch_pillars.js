const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

const updates = {
  ko: {
    btnSearch: '찾기',
    rankCelestial: '천상의 창립자',
    rankDevout: '경건한 창립자',
    rankSupporter: '후원자'
  },
  en: {
    btnSearch: 'Search',
    rankCelestial: 'Celestial Founder',
    rankDevout: 'Devout Founder',
    rankSupporter: 'Supporter'
  },
  zh: {
    btnSearch: '搜索',
    rankCelestial: '天界创始人',
    rankDevout: '虔诚创始人',
    rankSupporter: '支持者'
  },
  ja: {
    btnSearch: '検索',
    rankCelestial: '天の創設者',
    rankDevout: '敬虔な創設者',
    rankSupporter: 'サポーター'
  },
  es: {
    btnSearch: 'Buscar',
    rankCelestial: 'Fundador Celestial',
    rankDevout: 'Fundador Devoto',
    rankSupporter: 'Partidario'
  },
  fr: {
    btnSearch: 'Chercher',
    rankCelestial: 'Fondateur Céleste',
    rankDevout: 'Fondateur Dévoué',
    rankSupporter: 'Soutien'
  },
  de: {
    btnSearch: 'Suchen',
    rankCelestial: 'Himmlischer Gründer',
    rankDevout: 'Frommer Gründer',
    rankSupporter: 'Unterstützer'
  },
  pt: {
    btnSearch: 'Buscar',
    rankCelestial: 'Fundador Celestial',
    rankDevout: 'Fundador Devoto',
    rankSupporter: 'Apoiador'
  },
  id: {
    btnSearch: 'Cari',
    rankCelestial: 'Pendiri Surgawi',
    rankDevout: 'Pendiri Saleh',
    rankSupporter: 'Pendukung'
  },
  vi: {
    btnSearch: 'Tìm kiếm',
    rankCelestial: 'Người Sáng Lập Thiên Thanh',
    rankDevout: 'Người Sáng Lập Thành Kính',
    rankSupporter: 'Người Ủng Hộ'
  },
  th: {
    btnSearch: 'ค้นหา',
    rankCelestial: 'ผู้ก่อตั้งแห่งสวรรค์',
    rankDevout: 'ผู้ก่อตั้งผู้ศรัทธา',
    rankSupporter: 'ผู้สนับสนุน'
  },
  ar: {
    btnSearch: 'بحث',
    rankCelestial: 'مؤسس سماوي',
    rankDevout: 'مؤسس ورع',
    rankSupporter: 'داعم'
  },
  km: {
    btnSearch: 'ស្វែងរក',
    rankCelestial: 'ស្ថាបនិកសួគ៌',
    rankDevout: 'ស្ថាបនិកស៊ូ',
    rankSupporter: 'អ្នកគាំទ្រ'
  },
  my: {
    btnSearch: 'ရှာဖွေရန်',
    rankCelestial: 'နတ်ပြည်တည်ထောင်သူ',
    rankDevout: 'သဒ္ဓါတရားရှိသော တည်ထောင်သူ',
    rankSupporter: 'ထောက်ခံသူ'
  }
};

fs.readdirSync(messagesDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const locale = path.basename(file, '.json');
  const filePath = path.join(messagesDir, file);
  
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error parsing ${file}`);
    return;
  }

  const trans = updates[locale] || updates['en'];
  
  if (!data.Pillars) data.Pillars = {};
  
  data.Pillars.btnSearch = trans.btnSearch;
  data.Pillars.rankCelestial = trans.rankCelestial;
  data.Pillars.rankDevout = trans.rankDevout;
  data.Pillars.rankSupporter = trans.rankSupporter;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Updated ${file}`);
});
