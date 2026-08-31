const fs = require('fs');

const guruAuth = {
  en: { unauthMessage: 'Step into the light to speak with the Guru.', signIn: 'Sign In to Seek Wisdom' },
  ko: { unauthMessage: '구루와 대화하려면 빛 안으로 들어오세요.', signIn: '로그인하여 지혜를 구하세요' },
  ja: { unauthMessage: '師と語るために、光の中に踏み込んでください。', signIn: 'サインインして知恵を求める' },
  zh: { unauthMessage: '踏入光明，与大师交流。', signIn: '登录以寻求智慧' },
  es: { unauthMessage: 'Entra en la luz para hablar con el Guru.', signIn: 'Inicia sesión para buscar sabiduría' },
  fr: { unauthMessage: 'Entrez dans la lumière pour parler au Guru.', signIn: 'Connectez-vous pour chercher la sagesse' },
  de: { unauthMessage: 'Tritt ins Licht, um mit dem Guru zu sprechen.', signIn: 'Anmelden, um Weisheit zu suchen' },
  pt: { unauthMessage: 'Entre na luz para falar com o Guru.', signIn: 'Entrar para buscar sabedoria' },
  ar: { unauthMessage: 'ادخل في النور للتحدث مع الغورو.', signIn: 'سجل دخولك لطلب الحكمة' },
  vi: { unauthMessage: 'Bước vào ánh sáng để nói chuyện với Guru.', signIn: 'Đăng nhập để tìm kiếm trí tuệ' },
  th: { unauthMessage: 'ก้าวเข้าสู่แสงสว่างเพื่อพูดคุยกับครูบาอาจารย์', signIn: 'เข้าสู่ระบบเพื่อแสวงหาปัญญา' },
  id: { unauthMessage: 'Masuki cahaya untuk berbicara dengan Guru.', signIn: 'Masuk untuk mencari kebijaksanaan' },
  my: { unauthMessage: 'ဂုရုနှင့် စကားပြောရန် အလင်းထဲသို့ ဝင်ရောက်ပါ', signIn: 'ပညာကို ရှာဖွေရန် ဝင်ရောက်ပါ' },
  km: { unauthMessage: 'ចូលក្នុងពន្លឺដើម្បីនិយាយជាមួយ Guru', signIn: 'ចូលដើម្បីស្វែងរកប្រាជ្ញា' },
};

Object.keys(guruAuth).forEach(loc => {
  const path = `./messages/${loc}.json`;
  if (!fs.existsSync(path)) return;
  const json = JSON.parse(fs.readFileSync(path, 'utf8'));
  if (!json.Guru) json.Guru = {};
  json.Guru.unauthMessage = guruAuth[loc].unauthMessage;
  json.Guru.signIn = guruAuth[loc].signIn;
  // Also fix Chat namespace
  if (!json.Chat) json.Chat = {};
  json.Chat.unauthMessage = guruAuth[loc].unauthMessage;
  json.Chat.signIn = guruAuth[loc].signIn;
  fs.writeFileSync(path, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Updated ${loc}`);
});
