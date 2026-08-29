const fs = require('fs');
const path = require('path');

const locales = ['ar', 'de', 'en', 'es', 'fr', 'id', 'ja', 'km', 'ko', 'my', 'pt', 'th', 'vi', 'zh'];
const translations = {
    en: { b1: "Only ", b2: " exclusive seats left" },
    ko: { b1: "이번 달 남은 자리는 단 ", b2: "자리뿐입니다" },
    ar: { b1: "متبقي ", b2: " مقاعد حصرية فقط" },
    de: { b1: "Nur noch ", b2: " exklusive Plätze" },
    es: { b1: "Solo quedan ", b2: " lugares exclusivos" },
    fr: { b1: "Seulement ", b2: " places exclusives restantes" },
    id: { b1: "Hanya tersisa ", b2: " kursi eksklusif" },
    ja: { b1: "今月の残り限定席はあと ", b2: " 席のみ" },
    km: { b1: "នៅសល់តែ ", b2: " កន្លែងផ្តាច់មុខប៉ុណ្ណោះ" },
    my: { b1: "သီးသန့်နေရာ ", b2: " ခုသာ ကျန်ပါတော့သည်" },
    pt: { b1: "Restam apenas ", b2: " vagas exclusivas" },
    th: { b1: "เหลือเพียง ", b2: " ที่นั่งพิเศษเท่านั้น" },
    vi: { b1: "Chỉ còn ", b2: " chỗ độc quyền" },
    zh: { b1: "仅剩 ", b2: " 个专属席位" }
};

locales.forEach(loc => {
    const filePath = path.join(__dirname, 'messages', `${loc}.json`);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!data.Store) data.Store = {};
        data.Store.badgeText1 = translations[loc] ? translations[loc].b1 : translations.en.b1;
        data.Store.badgeText2 = translations[loc] ? translations[loc].b2 : translations.en.b2;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Updated ${loc}.json`);
    } else {
        console.log(`File not found: ${loc}.json`);
    }
});
