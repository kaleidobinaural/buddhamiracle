const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

const translations = {
  ko: {
    viewFounders: "창립자",
    viewSupporters: "후원자",
    sortAmount: "금액순",
    sortNewest: "최신순",
    sortOldest: "과거순"
  },
  en: {
    viewFounders: "Founders",
    viewSupporters: "Supporters",
    sortAmount: "Top Amount",
    sortNewest: "Newest",
    sortOldest: "Oldest"
  }
  // Others will fallback to EN
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

    if (!data.Pillars) data.Pillars = {};

    const trans = translations[locale] || translations['en'];
    
    // Inject missing keys
    for (const [key, value] of Object.entries(trans)) {
      if (!data.Pillars[key]) {
        data.Pillars[key] = value;
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file}`);
  }
});
