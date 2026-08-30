const fs = require('fs');

const html = fs.readFileSync('d:/Buddha_Frequency/Landing_Page/base/index.html', 'utf8');

const startIdx = html.indexOf('const TRANSLATIONS = {');
let openBraces = 0;
let endIdx = -1;
let started = false;

for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '{') { openBraces++; started = true; }
    else if (html[i] === '}') { openBraces--; }
    if (started && openBraces === 0) { endIdx = i; break; }
}

const objStr = html.substring(startIdx + 'const TRANSLATIONS = '.length, endIdx + 1);
const getTranslations = new Function(`return ${objStr};`);
const translations = getTranslations();

const locales = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'km', 'ko', 'my', 'pt', 'th', 'vi', 'zh'];

// Custom additions that aren't in index.html (like supportersWall, global resonance, etc)
// I will just use basic translations for ko, en, and fallback to en for others
const custom = {
    ko: {
        Nav: { resonance: '글로벌 울림' },
        Pillars: { 
            foundersHall: "Founders' Hall",
            supportersWall: "후원자의 벽",
            foundersDesc: "이 성소를 지탱하는 이들의 이름이 영원한 돌에 새겨집니다.",
            supportersDesc: "성스러운 디지털 공간을 유지할 수 있도록 도와주신 감사한 분들"
        },
        Resonance: {
            title: "주파수가 닿은 수백만의 영혼들",
            desc: "서울에서 상파울루까지, 이 고요의 순간들이 온 세계로 퍼져나갔습니다.",
            related: "관련 영상"
        }
    },
    en: {
        Nav: { resonance: 'Global Resonance' },
        Pillars: { 
            foundersHall: "Founders' Hall",
            supportersWall: "Supporter's Wall",
            foundersDesc: "Those who built the foundation of this sanctuary.",
            supportersDesc: "Hearts who continue to sustain this sacred space."
        },
        Resonance: {
            title: "Millions Touched by the Frequency",
            desc: "From Seoul to Sao Paulo, these moments of stillness have traveled across the world.",
            related: "Related videos"
        }
    }
};

const storeMapping = {
    lotus_title: 'lotusTitle',
    lotus_desc: 'lotusDesc',
    offer_candle: 'candlePack',
    offer_candle_desc: 'candleDesc',
    offer_lotus: 'lotusPack',
    offer_lotus_desc: 'lotusDesc2',
    offer_mala: 'malaPack',
    offer_mala_desc: 'malaDesc',
    btn_candle: 'buyCandle', // though we used buyLotus + price, let's just make sure they exist
    btn_offer_lotus: 'buyLotus'
};

locales.forEach(loc => {
    const jsonPath = './messages/' + loc + '.json';
    if (!fs.existsSync(jsonPath)) return;
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!data.Store) data.Store = {};
    if (!data.Nav) data.Nav = {};
    if (!data.Pillars) data.Pillars = {};
    if (!data.Resonance) data.Resonance = {};
    
    // 1. Missing Store translations from index.html
    const htmlLang = translations[loc];
    if (htmlLang) {
        for (const [htmlKey, jsonKey] of Object.entries(storeMapping)) {
            if (htmlLang[htmlKey]) {
                data.Store[jsonKey] = htmlLang[htmlKey].replace(/<[^>]*>?/gm, '');
            }
        }
    }
    
    // 2. Custom translations for Pillars, Nav.resonance, Resonance page
    const c = custom[loc] || custom.en;
    
    data.Nav.resonance = c.Nav.resonance;
    data.Pillars.foundersHall = c.Pillars.foundersHall;
    data.Pillars.supportersWall = c.Pillars.supportersWall;
    data.Pillars.foundersDesc = c.Pillars.foundersDesc;
    data.Pillars.supportersDesc = c.Pillars.supportersDesc;
    data.Resonance.title = c.Resonance.title;
    data.Resonance.desc = c.Resonance.desc;
    data.Resonance.related = c.Resonance.related;
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Patched ' + loc);
});
