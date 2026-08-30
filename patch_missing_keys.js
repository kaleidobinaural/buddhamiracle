const fs = require('fs');

// All missing keys per locale
const additions = {
  en: {
    Resonance: { eyebrow: 'GLOBAL RESONANCE' },
    Store: {
      lotusTitle: 'Temple Offerings',
      lotusDesc: 'Support the sanctuary and collect Lotus flowers to manifest your wishes on the Wish Roof.',
      premiumModalTitle: 'Premium Collection Inquiry',
      vvipModalTitle: 'VVIP Private Journey',
      modalDesc: 'Please leave your details. The founder will review and reply directly.',
      modalName: 'Your Name',
      modalEmail: 'Your Email',
      modalPremiumQ: 'What draws you to the Premium Collection?',
      modalVvipQ: 'Why do you wish to join the inner circle?',
      modalCancel: 'Cancel',
      modalSubmit: 'Submit',
      modalSending: 'Sending...',
      modalSuccess: 'Your application has been received with gratitude.',
      modalSuccessNote: 'Our team will contact you shortly.',
      modalClose: 'Close',
      modalError: 'Failed to send. Please try again.'
    },
    hall: { eco: 'Eco', ecoOn: 'Eco On' }
  },
  ko: {
    Resonance: { eyebrow: '글로벌 울림' },
    Store: {
      lotusTitle: '사원 공양 (연꽃)',
      lotusDesc: '사원을 후원하고 연꽃을 모아 소원 지붕에 소원을 남겨보세요.',
      premiumModalTitle: '프리미엄 컬렉션 문의',
      vvipModalTitle: 'VVIP 프라이빗 여정',
      modalDesc: '아래 정보를 남겨주세요. 창립자가 직접 검토 후 답변드립니다.',
      modalName: '성함',
      modalEmail: '이메일',
      modalPremiumQ: '프리미엄 컬렉션에 끌리시는 이유가 무엇인가요?',
      modalVvipQ: '내면의 원으로 들어오고 싶으신 이유는 무엇인가요?',
      modalCancel: '취소',
      modalSubmit: '신청하기',
      modalSending: '전송 중...',
      modalSuccess: '신청이 감사히 접수되었습니다.',
      modalSuccessNote: '담당자가 곧 연락드릴 것입니다.',
      modalClose: '닫기',
      modalError: '전송에 실패했습니다. 다시 시도해 주세요.'
    },
    hall: { eco: '에코', ecoOn: '에코 ON' }
  },
  ja: {
    Resonance: { eyebrow: 'グローバル・レゾナンス' },
    Store: {
      lotusTitle: '寺院への供養',
      lotusDesc: '聖域をサポートし、蓮の花を集めて願い事を願い屋根に残しましょう。',
      premiumModalTitle: 'プレミアムコレクションのお問い合わせ',
      vvipModalTitle: 'VVIPプライベートジャーニー',
      modalDesc: '詳細をご記入ください。創業者が直接確認してご返答いたします。',
      modalName: 'お名前',
      modalEmail: 'メールアドレス',
      modalPremiumQ: 'プレミアムコレクションに惹かれる理由は何ですか？',
      modalVvipQ: 'なぜインナーサークルに参加したいのですか？',
      modalCancel: 'キャンセル',
      modalSubmit: '申し込む',
      modalSending: '送信中...',
      modalSuccess: '申し込みをありがたく受け付けました。',
      modalSuccessNote: '担当者よりまもなくご連絡いたします。',
      modalClose: '閉じる',
      modalError: '送信に失敗しました。もう一度お試しください。'
    },
    hall: { eco: 'エコ', ecoOn: 'エコ ON' }
  },
  zh: {
    Resonance: { eyebrow: '全球共鸣' },
    Store: {
      lotusTitle: '寺庙供养',
      lotusDesc: '支持圣所并收集莲花，在许愿屋顶上留下您的愿望。',
      premiumModalTitle: '精品收藏咨询',
      vvipModalTitle: 'VVIP私人之旅',
      modalDesc: '请留下您的详细信息。创始人将亲自审阅并直接回复。',
      modalName: '您的姓名',
      modalEmail: '您的邮箱',
      modalPremiumQ: '是什么吸引您选择精品收藏？',
      modalVvipQ: '您为什么希望加入内圈？',
      modalCancel: '取消',
      modalSubmit: '提交',
      modalSending: '发送中...',
      modalSuccess: '您的申请已被感激地收到。',
      modalSuccessNote: '我们的团队将很快与您联系。',
      modalClose: '关闭',
      modalError: '发送失败，请重试。'
    },
    hall: { eco: '节能', ecoOn: '节能 ON' }
  },
  es: {
    Resonance: { eyebrow: 'RESONANCIA GLOBAL' },
    Store: {
      lotusTitle: 'Ofrendas del Templo',
      lotusDesc: 'Apoya el santuario y recolecta flores de loto para manifestar tus deseos en el Techo de los Deseos.',
      premiumModalTitle: 'Consulta sobre Colección Premium',
      vvipModalTitle: 'Viaje Privado VVIP',
      modalDesc: 'Por favor deja tus datos. El fundador revisará y responderá directamente.',
      modalName: 'Tu Nombre',
      modalEmail: 'Tu Correo Electrónico',
      modalPremiumQ: '¿Qué te atrae de la Colección Premium?',
      modalVvipQ: '¿Por qué deseas unirte al círculo interno?',
      modalCancel: 'Cancelar',
      modalSubmit: 'Enviar',
      modalSending: 'Enviando...',
      modalSuccess: 'Tu solicitud ha sido recibida con gratitud.',
      modalSuccessNote: 'Nuestro equipo se pondrá en contacto contigo pronto.',
      modalClose: 'Cerrar',
      modalError: 'Error al enviar. Por favor inténtalo de nuevo.'
    },
    hall: { eco: 'Eco', ecoOn: 'Eco ON' }
  },
  fr: {
    Resonance: { eyebrow: 'RÉSONANCE MONDIALE' },
    Store: {
      lotusTitle: 'Offrandes du Temple',
      lotusDesc: 'Soutenez le sanctuaire et collectez des fleurs de lotus pour manifester vos vœux sur le Toit des Vœux.',
      premiumModalTitle: 'Renseignements sur la Collection Premium',
      vvipModalTitle: 'Voyage Privé VVIP',
      modalDesc: 'Veuillez laisser vos coordonnées. Le fondateur examinera et répondra directement.',
      modalName: 'Votre Nom',
      modalEmail: 'Votre E-mail',
      modalPremiumQ: 'Qu\'est-ce qui vous attire vers la Collection Premium ?',
      modalVvipQ: 'Pourquoi souhaitez-vous rejoindre le cercle intérieur ?',
      modalCancel: 'Annuler',
      modalSubmit: 'Soumettre',
      modalSending: 'Envoi en cours...',
      modalSuccess: 'Votre candidature a été reçue avec gratitude.',
      modalSuccessNote: 'Notre équipe vous contactera prochainement.',
      modalClose: 'Fermer',
      modalError: 'Échec de l\'envoi. Veuillez réessayer.'
    },
    hall: { eco: 'Éco', ecoOn: 'Éco ON' }
  },
  de: {
    Resonance: { eyebrow: 'GLOBALE RESONANZ' },
    Store: {
      lotusTitle: 'Tempelgaben',
      lotusDesc: 'Unterstützen Sie das Heiligtum und sammeln Sie Lotusblumen, um Ihre Wünsche auf dem Wunschdach zu manifestieren.',
      premiumModalTitle: 'Premium-Kollektion Anfrage',
      vvipModalTitle: 'VVIP Privatreise',
      modalDesc: 'Bitte hinterlassen Sie Ihre Daten. Der Gründer wird sie prüfen und direkt antworten.',
      modalName: 'Ihr Name',
      modalEmail: 'Ihre E-Mail',
      modalPremiumQ: 'Was zieht Sie zur Premium-Kollektion?',
      modalVvipQ: 'Warum möchten Sie dem inneren Kreis beitreten?',
      modalCancel: 'Abbrechen',
      modalSubmit: 'Absenden',
      modalSending: 'Senden...',
      modalSuccess: 'Ihre Bewerbung wurde dankbar entgegengenommen.',
      modalSuccessNote: 'Unser Team wird Sie in Kürze kontaktieren.',
      modalClose: 'Schließen',
      modalError: 'Senden fehlgeschlagen. Bitte versuchen Sie es erneut.'
    },
    hall: { eco: 'Öko', ecoOn: 'Öko AN' }
  },
  pt: {
    Resonance: { eyebrow: 'RESSONÂNCIA GLOBAL' },
    Store: {
      lotusTitle: 'Oferendas do Templo',
      lotusDesc: 'Apoie o santuário e colete flores de lótus para manifestar seus desejos no Telhado dos Desejos.',
      premiumModalTitle: 'Consulta sobre Coleção Premium',
      vvipModalTitle: 'Jornada Privada VVIP',
      modalDesc: 'Por favor deixe seus dados. O fundador revisará e responderá diretamente.',
      modalName: 'Seu Nome',
      modalEmail: 'Seu E-mail',
      modalPremiumQ: 'O que te atrai para a Coleção Premium?',
      modalVvipQ: 'Por que deseja entrar no círculo interno?',
      modalCancel: 'Cancelar',
      modalSubmit: 'Enviar',
      modalSending: 'Enviando...',
      modalSuccess: 'Sua inscrição foi recebida com gratidão.',
      modalSuccessNote: 'Nossa equipe entrará em contato em breve.',
      modalClose: 'Fechar',
      modalError: 'Falha ao enviar. Por favor tente novamente.'
    },
    hall: { eco: 'Eco', ecoOn: 'Eco ON' }
  },
  ar: {
    Resonance: { eyebrow: 'الصدى العالمي' },
    Store: {
      lotusTitle: 'قرابين المعبد',
      lotusDesc: 'ادعم الملاذ واجمع زهور اللوتس لتجلي أمنياتك على سقف الأمنيات.',
      premiumModalTitle: 'استفسار عن المجموعة المميزة',
      vvipModalTitle: 'الرحلة الخاصة VVIP',
      modalDesc: 'يرجى ترك تفاصيلك. سيراجع المؤسس ويرد مباشرة.',
      modalName: 'اسمك',
      modalEmail: 'بريدك الإلكتروني',
      modalPremiumQ: 'ما الذي يجذبك إلى المجموعة المميزة؟',
      modalVvipQ: 'لماذا تريد الانضمام إلى الدائرة الداخلية؟',
      modalCancel: 'إلغاء',
      modalSubmit: 'إرسال',
      modalSending: 'جارٍ الإرسال...',
      modalSuccess: 'تم استلام طلبك بامتنان.',
      modalSuccessNote: 'سيتصل بك فريقنا قريباً.',
      modalClose: 'إغلاق',
      modalError: 'فشل الإرسال. يرجى المحاولة مرة أخرى.'
    },
    hall: { eco: 'اقتصادي', ecoOn: 'اقتصادي ON' }
  },
  vi: {
    Resonance: { eyebrow: 'CỘNG HƯỞNG TOÀN CẦU' },
    Store: {
      lotusTitle: 'Cúng Dường Chùa',
      lotusDesc: 'Hỗ trợ thánh địa và thu thập hoa sen để hiển thị ước nguyện trên Mái Nguyện Cầu.',
      premiumModalTitle: 'Tư Vấn Bộ Sưu Tập Premium',
      vvipModalTitle: 'Hành Trình Riêng Tư VVIP',
      modalDesc: 'Vui lòng để lại thông tin của bạn. Người sáng lập sẽ xem xét và trả lời trực tiếp.',
      modalName: 'Tên của bạn',
      modalEmail: 'Email của bạn',
      modalPremiumQ: 'Điều gì thu hút bạn đến Bộ Sưu Tập Premium?',
      modalVvipQ: 'Tại sao bạn muốn tham gia vòng tròn nội bộ?',
      modalCancel: 'Hủy',
      modalSubmit: 'Gửi',
      modalSending: 'Đang gửi...',
      modalSuccess: 'Đơn đăng ký của bạn đã được nhận với lòng biết ơn.',
      modalSuccessNote: 'Đội ngũ của chúng tôi sẽ liên hệ với bạn sớm.',
      modalClose: 'Đóng',
      modalError: 'Gửi thất bại. Vui lòng thử lại.'
    },
    hall: { eco: 'Tiết Kiệm', ecoOn: 'Tiết Kiệm ON' }
  },
  th: {
    Resonance: { eyebrow: 'เสียงสะท้อนระดับโลก' },
    Store: {
      lotusTitle: 'เครื่องบูชาวัด',
      lotusDesc: 'สนับสนุนศาลเจ้าและเก็บดอกบัวเพื่อแสดงความปรารถนาบนหลังคาแห่งความปรารถนา',
      premiumModalTitle: 'สอบถามเกี่ยวกับคอลเลคชัน Premium',
      vvipModalTitle: 'การเดินทางส่วนตัว VVIP',
      modalDesc: 'กรุณาฝากรายละเอียดของคุณ ผู้ก่อตั้งจะตรวจสอบและตอบกลับโดยตรง',
      modalName: 'ชื่อของคุณ',
      modalEmail: 'อีเมลของคุณ',
      modalPremiumQ: 'อะไรดึงดูดคุณไปยังคอลเลคชัน Premium?',
      modalVvipQ: 'ทำไมคุณถึงอยากเข้าร่วมวงในเล็ก?',
      modalCancel: 'ยกเลิก',
      modalSubmit: 'ส่ง',
      modalSending: 'กำลังส่ง...',
      modalSuccess: 'ได้รับใบสมัครของคุณด้วยความกตัญญู',
      modalSuccessNote: 'ทีมของเราจะติดต่อคุณเร็วๆ นี้',
      modalClose: 'ปิด',
      modalError: 'ส่งล้มเหลว กรุณาลองอีกครั้ง'
    },
    hall: { eco: 'ประหยัด', ecoOn: 'ประหยัด ON' }
  },
  id: {
    Resonance: { eyebrow: 'RESONANSI GLOBAL' },
    Store: {
      lotusTitle: 'Persembahan Kuil',
      lotusDesc: 'Dukung tempat suci dan kumpulkan bunga teratai untuk mewujudkan keinginan Anda di Atap Keinginan.',
      premiumModalTitle: 'Pertanyaan Koleksi Premium',
      vvipModalTitle: 'Perjalanan Pribadi VVIP',
      modalDesc: 'Silakan tinggalkan detail Anda. Pendiri akan meninjau dan membalas langsung.',
      modalName: 'Nama Anda',
      modalEmail: 'Email Anda',
      modalPremiumQ: 'Apa yang menarik Anda ke Koleksi Premium?',
      modalVvipQ: 'Mengapa Anda ingin bergabung dengan lingkaran dalam?',
      modalCancel: 'Batal',
      modalSubmit: 'Kirim',
      modalSending: 'Mengirim...',
      modalSuccess: 'Lamaran Anda telah diterima dengan rasa syukur.',
      modalSuccessNote: 'Tim kami akan menghubungi Anda segera.',
      modalClose: 'Tutup',
      modalError: 'Gagal mengirim. Silakan coba lagi.'
    },
    hall: { eco: 'Hemat', ecoOn: 'Hemat ON' }
  },
  my: {
    Resonance: { eyebrow: 'ကမ္ဘာလုံးဆိုင်ရာ ပဲ့တင်သံ' },
    Store: {
      lotusTitle: 'ကျောင်းတော်ပူဇော်ခြင်း',
      lotusDesc: 'ဘုန်းကြီးကျောင်းကို ကူညီပြီး ကြာဖူးများကို စုဆောင်းကာ ဆုတောင်းခြင်းမိုးမျက်နှာတွင် ဆန္ဒများဖော်ထုတ်ပါ',
      premiumModalTitle: 'Premium စုဆောင်းမှုအကြောင်းမေးမြန်းချက်',
      vvipModalTitle: 'VVIP ကိုယ်ပိုင်ခရီးစဉ်',
      modalDesc: 'သင့်အချက်အလက်များကိုထားရစ်ပါ။ တည်ထောင်သူသည်တိုက်ရိုက်စစ်ဆေးပြီးပြန်လည်ဖြေကြားမည်',
      modalName: 'သင့်အမည်',
      modalEmail: 'သင့်အီးမေးလ်',
      modalPremiumQ: 'Premium Collection ဆီသို့ ဘာကြောင့်ဆွဲဆောင်ရောက်ရှိသနည်း?',
      modalVvipQ: 'ဘာကြောင့် အတွင်းစက်ဝိုင်းသို့ ပါဝင်လိုသနည်း?',
      modalCancel: 'ပယ်ဖျက်',
      modalSubmit: 'တင်သွင်း',
      modalSending: 'ပို့ဆောင်နေသည်...',
      modalSuccess: 'သင်၏လျှောက်လွှာကို ကျေးဇူးတင်ကြောင်းဖြင့် လက်ခံရရှိခဲ့သည်',
      modalSuccessNote: 'ကျွန်ုပ်တို့အဖွဲ့မှ မကြာမီ ဆက်သွယ်ပေးပါမည်',
      modalClose: 'ပိတ်',
      modalError: 'ပို့ဆောင်မှု မအောင်မြင်ပါ။ ထပ်မံကြိုးစားပါ'
    },
    hall: { eco: 'Eco', ecoOn: 'Eco ON' }
  },
  km: {
    Resonance: { eyebrow: 'សំឡេងជ្រួញជ្រើសសកល' },
    Store: {
      lotusTitle: 'ការថ្វាយដល់វត្ត',
      lotusDesc: 'គាំទ្រដល់ទីសักការបូជា និងប្រមូលផ្កាឈូកដើម្បីបង្ហាញបំណងប្រាថ្នារបស់អ្នកនៅលើដំបូលបំណង',
      premiumModalTitle: 'ការសួររកព័ត៌មានអំពីការប្រមូល Premium',
      vvipModalTitle: 'ដំណើរការឯកជន VVIP',
      modalDesc: 'សូមទុកព័ត៌មានលម្អិតរបស់អ្នក។ អ្នកបង្កើតនឹងពិនិត្យ និងឆ្លើយតបដោយផ្ទាល់',
      modalName: 'ឈ្មោះរបស់អ្នក',
      modalEmail: 'អ៊ីមែលរបស់អ្នក',
      modalPremiumQ: 'អ្វីដែលទាក់ទាញអ្នកទៅកាន់ការប្រមូល Premium?',
      modalVvipQ: 'ហេតុអ្វីអ្នកចង់ចូលរួមក្នុងជំរុំខាងក្នុង?',
      modalCancel: 'បោះបង់',
      modalSubmit: 'ដាក់ស្នើ',
      modalSending: 'កំពុងផ្ញើ...',
      modalSuccess: 'ពាក្យសុំរបស់អ្នកត្រូវបានទទួលដោយការដឹងគុណ',
      modalSuccessNote: 'ក្រុមការងាររបស់យើងនឹងទាក់ទងអ្នកក្នុងពេលឆាប់ៗ',
      modalClose: 'បិទ',
      modalError: 'ការផ្ញើបានបរាជ័យ។ សូមព្យាយាមម្ដងទៀត'
    },
    hall: { eco: 'Eco', ecoOn: 'Eco ON' }
  }
};

const locales = Object.keys(additions);

locales.forEach(loc => {
  const jsonPath = './messages/' + loc + '.json';
  if (!fs.existsSync(jsonPath)) return;
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  
  const a = additions[loc];
  
  // Resonance
  if (!data.Resonance) data.Resonance = {};
  Object.assign(data.Resonance, a.Resonance);
  
  // Store
  if (!data.Store) data.Store = {};
  Object.assign(data.Store, a.Store);
  
  // hall (lowercase)
  if (!data.hall) data.hall = {};
  Object.assign(data.hall, a.hall);
  
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated ' + loc);
});
