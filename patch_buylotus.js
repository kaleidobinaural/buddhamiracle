const fs = require('fs');

// buyLotus translations per locale
const buyLotus = {
  en: 'Offer ',
  ko: '공양하기 ',
  ja: '供養する ',
  zh: '供养 ',
  es: 'Ofrecer ',
  fr: 'Offrir ',
  de: 'Anbieten ',
  pt: 'Oferecer ',
  ar: 'تقديم ',
  vi: 'Dâng cúng ',
  th: 'ถวาย ',
  id: 'Persembahkan ',
  my: 'ပူဇော်သည် ',
  km: 'ថ្វាយ ',
};

const locales = Object.keys(buyLotus);

locales.forEach(loc => {
  const jsonPath = './messages/' + loc + '.json';
  if (!fs.existsSync(jsonPath)) return;

  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  if (!json.Store) json.Store = {};
  json.Store.buyLotus = buyLotus[loc];

  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Updated ${loc}: "${buyLotus[loc]}"`);
});
