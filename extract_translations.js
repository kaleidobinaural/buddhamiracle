const fs = require('fs');

const html = fs.readFileSync('d:/Buddha_Frequency/Landing_Page/base/index.html', 'utf8');

const startIdx = html.indexOf('const TRANSLATIONS = {');
if (startIdx === -1) {
    console.log('Not found');
    process.exit(1);
}

// Extract the TRANSLATIONS object string
let openBraces = 0;
let endIdx = -1;
let started = false;

for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '{') {
        openBraces++;
        started = true;
    } else if (html[i] === '}') {
        openBraces--;
    }
    
    if (started && openBraces === 0) {
        endIdx = i;
        break;
    }
}

if (endIdx === -1) {
    console.log('Could not find end brace');
    process.exit(1);
}

const objStr = html.substring(startIdx + 'const TRANSLATIONS = '.length, endIdx + 1);

// We need to parse this JS object string into a real JS object
// Since it's a JS object literal, we can use Function constructor to evaluate it safely
const getTranslations = new Function(`return ${objStr};`);
const translations = getTranslations();

// Map the index.html translations to the structure expected in messages/*.json
const mapping = {
    hero_title: 'heroTitle',
    hero_desc: 'heroSub',
    hero_sub: 'heroDesc',
    free_sample: 'heroCaption',
    social_proof_count: 'socialProof', // Needs special handling since it contains HTML
    instant_title: 'instantAccessTitle',
    badge_most: 'mostChosen',
    om_title: 'omManiTitle',
    om_f1: 'omManiF1',
    om_f2: 'omManiF2',
    om_f3: 'omManiF3',
    btn_om: 'getInstantAccess',
    om_guarantee: 'microNote',
    amulet_title: 'amuletTitle',
    amulet_f1: 'amuletF1',
    amulet_f2: 'amuletF2',
    amulet_f3: 'amuletF3',
    btn_amulet: 'receiveAmulet',
    bundle_title: 'bundleTitle',
    badge_best: 'bestValue',
    bundle_save: 'saveAmount',
    bundle_f1: 'bundleF1',
    bundle_f2: 'bundleF2',
    bundle_f3: 'bundleF3',
    btn_bundle: 'getBundle',
    sci_title: 'sciTitle',
    sci_desc: 'sciDesc',
    sci_1_title: 'sci1Title',
    sci_1_desc: 'sci1Desc',
    sci_2_title: 'sci2Title',
    sci_2_desc: 'sci2Desc',
    sci_3_title: 'sci3Title',
    sci_3_desc: 'sci3Desc',
    tier_main_title: 'vipTitle',
    badge_text1: 'badgeText1',
    badge_text2: 'badgeText2',
    t2_reg_title: 'premiumTier',
    t2_f1: 'premiumF1',
    t2_f2: 'premiumF2',
    t2_f3: 'premiumF3',
    btn_reg: 'getPremium',
    tier_1_title: 'vvipTier',
    t1_f1: 'vvipF1',
    t1_f2: 'vvipF2',
    t1_f3: 'vvipF3',
    btn_vvip: 'applyVvip'
};

const locales = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'km', 'ko', 'my', 'pt', 'th', 'vi', 'zh'];

locales.forEach(loc => {
    const jsonPath = './messages/' + loc + '.json';
    if (!fs.existsSync(jsonPath)) return;
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    if (!data.Store) data.Store = {};
    if (!data.Resonance) data.Resonance = {};
    
    const htmlLang = translations[loc];
    if (htmlLang) {
        for (const [htmlKey, jsonKey] of Object.entries(mapping)) {
            if (htmlLang[htmlKey]) {
                // Strip HTML tags from strings like social_proof_count for safety
                let text = htmlLang[htmlKey].replace(/<[^>]*>?/gm, '');
                
                // For social proof, we split into Pre and Post
                if (htmlKey === 'social_proof_count') {
                    // This is a hacky split but works for most
                    const parts = htmlLang[htmlKey].split(/<span[^>]*>[0-9,\.]+<\/span>/);
                    if (parts.length === 2) {
                        data.Store.socialProofPre = parts[0].replace(/<[^>]*>?/gm, '').trim() + ' ';
                        data.Store.socialProofPost = ' ' + parts[1].replace(/<[^>]*>?/gm, '').trim();
                    }
                } else if (htmlKey === 'btn_om' || htmlKey === 'btn_amulet' || htmlKey === 'btn_bundle' || htmlKey === 'btn_reg' || htmlKey === 'btn_vvip') {
                    // Extract text before " – $XX.XX"
                    text = text.split('–')[0].split('-')[0].trim() + ' – ';
                    data.Store[jsonKey] = text;
                } else if (htmlKey === 't1_f1' || htmlKey === 't2_f1' || htmlKey === 'tier_1_title' || htmlKey === 't2_reg_title') {
                    text = htmlLang[htmlKey].replace(/<br>/g, ' ');
                    data.Store[jsonKey] = text;
                } else {
                    data.Store[jsonKey] = text;
                }
            }
        }
    }
    
    // Hardcode Resonance for now to fix Japanese etc. based on index.html (but index doesn't have Resonance)
    // The user had Resonance strings translated? No, Resonance is just TikToks. We can use the English fallback for now,
    // but maybe we can translate the Resonance title to Japanese using basic words if we want, or leave it. 
    // The user complained about Store + Resonance being English. So let's leave Resonance fallback, but Store will be fully translated.
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Updated ' + loc);
});
