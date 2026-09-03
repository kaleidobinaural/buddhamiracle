const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, 'messages');

// New keys to inject per namespace
const newKeys = {
  Donate: {
    ko: {
      inquiryLink: 'PayPal을 사용할 수 없나요? 결제 방법 문의하기',
      inquiryModalTitle: '결제 방법 문의',
      inquiryDesc: '선호하시는 결제 방법(계좌이체, 위챗페이 등)을 알려주시면 직접 안내해 드립니다.',
      inquiryName: '이름',
      inquiryEmail: '이메일',
      inquiryMessage: '선호하시는 결제 방법 및 문의 내용을 입력해 주세요.',
      inquirySuccess: '문의가 접수되었습니다. 🙏',
      inquirySuccessNote: '담당자가 빠른 시일 내에 연락드릴 것입니다.',
      inquiryClose: '닫기',
      inquiryCancel: '취소',
      inquirySubmit: '문의 보내기',
      inquiryError: '오류가 발생했습니다. 다시 시도해 주세요.',
    },
    en: {
      inquiryLink: "Can't use PayPal? Inquire about alternative payment methods",
      inquiryModalTitle: 'Payment Inquiry',
      inquiryDesc: 'Let us know your preferred payment method (e.g., Bank Transfer, WeChat Pay) and we will guide you personally.',
      inquiryName: 'Name',
      inquiryEmail: 'Email',
      inquiryMessage: 'Please describe your preferred payment method and any questions.',
      inquirySuccess: 'Inquiry received. 🙏',
      inquirySuccessNote: 'Our team will contact you shortly.',
      inquiryClose: 'Close',
      inquiryCancel: 'Cancel',
      inquirySubmit: 'Send Inquiry',
      inquiryError: 'An error occurred. Please try again.',
    }
  },
  WishRoof: {
    ko: { sortDeep: '깊은 염원' },
    en: { sortDeep: 'Deep Wishes' }
  },
  hall: {
    ko: { eco: '라이트 모드', ecoOn: '라이트 ON' },
    en: { eco: 'Lite Mode', ecoOn: 'Lite On' }
  },
  Profile: {
    ko: {
      makePublic: '공개로 전환',
      makePrivate: '비공개로 전환',
      deleteWish: '소원 삭제',
      confirmDelete: '이 소원을 삭제하시겠습니까? 되돌릴 수 없습니다.',
      exportError: '내보내기에 실패했습니다. 다시 시도해 주세요.',
    },
    en: {
      makePublic: 'Make Public',
      makePrivate: 'Make Private',
      deleteWish: 'Delete Wish',
      confirmDelete: 'Delete this wish? This cannot be undone.',
      exportError: 'Export failed. Please try again.',
    }
  }
};

fs.readdirSync(messagesDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const locale = path.basename(file, '.json');
  const filePath = path.join(messagesDir, file);
  let data;
  try { data = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
  catch (e) { console.error(`Error parsing ${file}:`, e); return; }

  let changed = false;
  for (const [namespace, localeMap] of Object.entries(newKeys)) {
    if (!data[namespace]) data[namespace] = {};
    const trans = localeMap[locale] || localeMap['en'];
    for (const [key, value] of Object.entries(trans)) {
      if (data[namespace][key] === undefined || data[namespace][key] === localeMap['en'][key]) {
        data[namespace][key] = value;
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`No changes: ${file}`);
  }
});
