const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

const translations = {
  ko: {
    lotusNotice: "※ 연꽃 공양은 가상 공간을 밝히는 수행의 일부입니다. 후원자의 전당에 영원한 기둥(Pillar)을 세우시려면 [Real Offering (USD)] 탭에서 후원을 진행해 주세요."
  },
  en: {
    lotusNotice: "※ Lotus offerings are spiritual gestures to illuminate the sanctuary. To establish an eternal Pillar in the Hall of Supporters, please make your offering via the [Real Offering] tab."
  }
};

fs.readdirSync(messagesDir).forEach(file => {
  if (file.endsWith('.json')) {
    const locale = path.basename(file, '.json');
    const filePath = path.join(messagesDir, file);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
      return;
    }

    if (!data.Donate) data.Donate = {};

    const trans = translations[locale] || translations['en'];
    
    if (!data.Donate.lotusNotice) {
      data.Donate.lotusNotice = trans.lotusNotice;
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file}`);
  }
});
