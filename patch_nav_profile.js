const fs = require('fs');

const translations = {
  en: {
    Nav: {
      mySanctuary: 'My Sanctuary',
      privacyPolicy: 'Privacy Policy',
      signOut: 'Sign out',
      signIn: 'Sign In',
    },
    Store: { vipDesc: 'For those who wish to make a profound impact.' },
    Profile: {
      myWishes: 'My Wishes',
      myPillars: 'My Pillars',
      privacyData: 'Privacy & Data',
      dataPrivacy: 'Data Privacy & Protection',
      privacyDesc: 'In compliance with global privacy standards (GDPR, CCPA, KR PIPA), you have full control over your digital footprint in the Sanctuary.',
      rightForgotten: 'Right to be Forgotten',
      rightForgottenDesc: 'Permanently remove all your inscriptions and interactions from our records.',
      deleteData: 'Delete My Data',
      deleting: 'Erasing...',
      dataPortability: 'Data Portability',
      dataPortabilityDesc: 'Request a complete export of your personal data in JSON format.',
      requestExport: 'Request Export',
      exportSent: 'Data export link will be sent to your email.',
      loading: 'Gathering your memories...',
      emptyWishes: 'You have not inscribed any wishes yet.',
      emptyPillars: 'You have not inscribed any pillars yet.',
      lights: 'Lights',
      soulPoints: 'Soul Points',
      public: 'Public',
      private: 'Private',
    }
  },
  ko: {
    Nav: {
      mySanctuary: '내 성소',
      privacyPolicy: '개인정보 처리방침',
      signOut: '로그아웃',
      signIn: '로그인',
    },
    Store: { vipDesc: '깊은 울림을 남기고자 하는 분들을 위한 특별한 여정입니다.' },
    Profile: {
      myWishes: '내 소원',
      myPillars: '내 기둥',
      privacyData: '개인정보 & 데이터',
      dataPrivacy: '데이터 개인정보 보호',
      privacyDesc: '글로벌 개인정보 보호 기준(GDPR, CCPA, KR PIPA)을 준수하여 성소에서의 디지털 흔적을 완전히 통제하실 수 있습니다.',
      rightForgotten: '잊혀질 권리',
      rightForgottenDesc: '당신의 모든 소원과 상호작용을 영구적으로 삭제합니다.',
      deleteData: '내 데이터 삭제',
      deleting: '삭제 중...',
      dataPortability: '데이터 이동권',
      dataPortabilityDesc: 'JSON 형식으로 개인 데이터 전체 내보내기를 요청하세요.',
      requestExport: '내보내기 요청',
      exportSent: '데이터 내보내기 링크가 이메일로 전송됩니다.',
      loading: '기억을 불러오는 중...',
      emptyWishes: '아직 새겨진 소원이 없습니다.',
      emptyPillars: '아직 새겨진 기둥이 없습니다.',
      lights: '빛',
      soulPoints: '소울 포인트',
      public: '공개',
      private: '비공개',
    }
  },
  ja: {
    Nav: {
      mySanctuary: '私の聖域',
      privacyPolicy: 'プライバシーポリシー',
      signOut: 'サインアウト',
      signIn: 'サインイン',
    },
    Store: { vipDesc: '深い影響を与えたいと願う方々のための特別な旅。' },
    Profile: {
      myWishes: '私の願い',
      myPillars: '私の柱',
      privacyData: 'プライバシー & データ',
      dataPrivacy: 'データプライバシー保護',
      privacyDesc: 'グローバルプライバシー基準（GDPR、CCPA、KR PIPA）に準拠し、聖域でのデジタルフットプリントを完全に管理できます。',
      rightForgotten: '忘れられる権利',
      rightForgottenDesc: 'すべての記録とインタラクションを永久に削除します。',
      deleteData: 'データを削除',
      deleting: '削除中...',
      dataPortability: 'データポータビリティ',
      dataPortabilityDesc: 'JSON形式で個人データの完全エクスポートをリクエストします。',
      requestExport: 'エクスポートをリクエスト',
      exportSent: 'データエクスポートリンクがメールに送信されます。',
      loading: '記憶を集めています...',
      emptyWishes: 'まだ願いが刻まれていません。',
      emptyPillars: 'まだ柱が刻まれていません。',
      lights: '光',
      soulPoints: 'ソウルポイント',
      public: '公開',
      private: 'プライベート',
    }
  },
  zh: {
    Nav: { mySanctuary: '我的圣所', privacyPolicy: '隐私政策', signOut: '退出登录', signIn: '登录' },
    Store: { vipDesc: '为那些希望留下深远影响的人们而设。' },
    Profile: {
      myWishes: '我的心愿', myPillars: '我的柱子', privacyData: '隐私与数据',
      dataPrivacy: '数据隐私与保护', privacyDesc: '遵守全球隐私标准(GDPR, CCPA, KR PIPA)，您可完全控制在圣所中的数字足迹。',
      rightForgotten: '被遗忘权', rightForgottenDesc: '永久删除您的所有记录和互动。',
      deleteData: '删除我的数据', deleting: '删除中...', dataPortability: '数据可携带性',
      dataPortabilityDesc: '请求以JSON格式导出您的完整个人数据。', requestExport: '请求导出',
      exportSent: '数据导出链接将发送到您的邮箱。', loading: '正在收集您的记忆...', 
      emptyWishes: '您还没有留下任何心愿。', emptyPillars: '您还没有留下任何柱子。',
      lights: '光', soulPoints: '灵魂积分', public: '公开', private: '私密',
    }
  },
  es: {
    Nav: { mySanctuary: 'Mi Santuario', privacyPolicy: 'Política de Privacidad', signOut: 'Cerrar Sesión', signIn: 'Iniciar Sesión' },
    Store: { vipDesc: 'Para quienes desean dejar un impacto profundo.' },
    Profile: {
      myWishes: 'Mis Deseos', myPillars: 'Mis Pilares', privacyData: 'Privacidad y Datos',
      dataPrivacy: 'Privacidad y Protección de Datos', privacyDesc: 'En cumplimiento con estándares globales de privacidad (GDPR, CCPA, KR PIPA), tienes control total sobre tu huella digital en el Santuario.',
      rightForgotten: 'Derecho al Olvido', rightForgottenDesc: 'Elimina permanentemente todas tus inscripciones e interacciones de nuestros registros.',
      deleteData: 'Eliminar Mis Datos', deleting: 'Borrando...', dataPortability: 'Portabilidad de Datos',
      dataPortabilityDesc: 'Solicita una exportación completa de tus datos personales en formato JSON.', requestExport: 'Solicitar Exportación',
      exportSent: 'El enlace de exportación de datos se enviará a tu correo.', loading: 'Reuniendo tus memorias...',
      emptyWishes: 'Aún no has inscrito ningún deseo.', emptyPillars: 'Aún no has inscrito ningún pilar.',
      lights: 'Luces', soulPoints: 'Puntos del Alma', public: 'Público', private: 'Privado',
    }
  },
  fr: {
    Nav: { mySanctuary: 'Mon Sanctuaire', privacyPolicy: 'Politique de Confidentialité', signOut: 'Déconnexion', signIn: 'Connexion' },
    Store: { vipDesc: 'Pour ceux qui souhaitent laisser un impact profond.' },
    Profile: {
      myWishes: 'Mes Vœux', myPillars: 'Mes Piliers', privacyData: 'Confidentialité & Données',
      dataPrivacy: 'Confidentialité et Protection des Données', privacyDesc: 'Conformément aux normes mondiales de confidentialité (GDPR, CCPA, KR PIPA), vous avez un contrôle total sur votre empreinte numérique dans le Sanctuaire.',
      rightForgotten: 'Droit à l\'Oubli', rightForgottenDesc: 'Supprimez définitivement toutes vos inscriptions et interactions de nos archives.',
      deleteData: 'Supprimer Mes Données', deleting: 'Effacement...', dataPortability: 'Portabilité des Données',
      dataPortabilityDesc: 'Demandez une exportation complète de vos données personnelles au format JSON.', requestExport: 'Demander l\'Exportation',
      exportSent: 'Le lien d\'exportation de données sera envoyé à votre email.', loading: 'Rassemblement de vos souvenirs...',
      emptyWishes: 'Vous n\'avez pas encore inscrit de vœux.', emptyPillars: 'Vous n\'avez pas encore inscrit de piliers.',
      lights: 'Lumières', soulPoints: 'Points d\'Âme', public: 'Public', private: 'Privé',
    }
  },
  de: {
    Nav: { mySanctuary: 'Mein Heiligtum', privacyPolicy: 'Datenschutzrichtlinie', signOut: 'Abmelden', signIn: 'Anmelden' },
    Store: { vipDesc: 'Für diejenigen, die einen tiefgreifenden Einfluss hinterlassen möchten.' },
    Profile: {
      myWishes: 'Meine Wünsche', myPillars: 'Meine Säulen', privacyData: 'Datenschutz & Daten',
      dataPrivacy: 'Datenschutz & Datensicherheit', privacyDesc: 'Gemäß globaler Datenschutzstandards (DSGVO, CCPA, KR PIPA) haben Sie die volle Kontrolle über Ihren digitalen Fußabdruck im Heiligtum.',
      rightForgotten: 'Recht auf Vergessenwerden', rightForgottenDesc: 'Löschen Sie dauerhaft alle Ihre Inschriften und Interaktionen aus unseren Aufzeichnungen.',
      deleteData: 'Meine Daten löschen', deleting: 'Wird gelöscht...', dataPortability: 'Datenübertragbarkeit',
      dataPortabilityDesc: 'Fordern Sie einen vollständigen Export Ihrer persönlichen Daten im JSON-Format an.', requestExport: 'Export anfordern',
      exportSent: 'Der Datenexport-Link wird an Ihre E-Mail gesendet.', loading: 'Samle Ihre Erinnerungen...',
      emptyWishes: 'Sie haben noch keine Wünsche eingetragen.', emptyPillars: 'Sie haben noch keine Säulen eingetragen.',
      lights: 'Lichter', soulPoints: 'Seelenpunkte', public: 'Öffentlich', private: 'Privat',
    }
  },
  pt: {
    Nav: { mySanctuary: 'Meu Santuário', privacyPolicy: 'Política de Privacidade', signOut: 'Sair', signIn: 'Entrar' },
    Store: { vipDesc: 'Para aqueles que desejam causar um impacto profundo.' },
    Profile: {
      myWishes: 'Meus Desejos', myPillars: 'Meus Pilares', privacyData: 'Privacidade & Dados',
      dataPrivacy: 'Privacidade e Proteção de Dados', privacyDesc: 'Em conformidade com padrões globais de privacidade (GDPR, CCPA, KR PIPA), você tem controle total sobre sua pegada digital no Santuário.',
      rightForgotten: 'Direito ao Esquecimento', rightForgottenDesc: 'Remova permanentemente todas as suas inscrições e interações de nossos registros.',
      deleteData: 'Excluir Meus Dados', deleting: 'Apagando...', dataPortability: 'Portabilidade de Dados',
      dataPortabilityDesc: 'Solicite uma exportação completa de seus dados pessoais em formato JSON.', requestExport: 'Solicitar Exportação',
      exportSent: 'O link de exportação de dados será enviado ao seu email.', loading: 'Reunindo suas memórias...',
      emptyWishes: 'Você ainda não inscreveu nenhum desejo.', emptyPillars: 'Você ainda não inscreveu nenhum pilar.',
      lights: 'Luzes', soulPoints: 'Pontos de Alma', public: 'Público', private: 'Privado',
    }
  },
  ar: {
    Nav: { mySanctuary: 'ملاذي', privacyPolicy: 'سياسة الخصوصية', signOut: 'تسجيل الخروج', signIn: 'تسجيل الدخول' },
    Store: { vipDesc: 'لأولئك الذين يرغبون في إحداث تأثير عميق.' },
    Profile: {
      myWishes: 'أمنياتي', myPillars: 'أعمدتي', privacyData: 'الخصوصية والبيانات',
      dataPrivacy: 'خصوصية البيانات وحمايتها', privacyDesc: 'وفقاً لمعايير الخصوصية العالمية (GDPR, CCPA, KR PIPA)، لديك السيطرة الكاملة على بصمتك الرقمية في الملاذ.',
      rightForgotten: 'حق النسيان', rightForgottenDesc: 'احذف نهائياً جميع نقوشك وتفاعلاتك من سجلاتنا.',
      deleteData: 'حذف بياناتي', deleting: 'جارٍ الحذف...', dataPortability: 'قابلية نقل البيانات',
      dataPortabilityDesc: 'اطلب تصديراً كاملاً لبياناتك الشخصية بصيغة JSON.', requestExport: 'طلب التصدير',
      exportSent: 'سيتم إرسال رابط تصدير البيانات إلى بريدك الإلكتروني.', loading: 'جمع ذكرياتك...',
      emptyWishes: 'لم تنقش أي أمنيات بعد.', emptyPillars: 'لم تنقش أي أعمدة بعد.',
      lights: 'أضواء', soulPoints: 'نقاط الروح', public: 'عام', private: 'خاص',
    }
  },
  vi: {
    Nav: { mySanctuary: 'Thánh Địa Của Tôi', privacyPolicy: 'Chính Sách Bảo Mật', signOut: 'Đăng Xuất', signIn: 'Đăng Nhập' },
    Store: { vipDesc: 'Dành cho những ai muốn tạo ra tác động sâu sắc.' },
    Profile: {
      myWishes: 'Ước Nguyện Của Tôi', myPillars: 'Trụ Cột Của Tôi', privacyData: 'Quyền Riêng Tư & Dữ Liệu',
      dataPrivacy: 'Bảo Mật & Bảo Vệ Dữ Liệu', privacyDesc: 'Tuân thủ các tiêu chuẩn quyền riêng tư toàn cầu (GDPR, CCPA, KR PIPA), bạn có toàn quyền kiểm soát dấu vết kỹ thuật số trong Thánh Địa.',
      rightForgotten: 'Quyền Bị Lãng Quên', rightForgottenDesc: 'Xóa vĩnh viễn tất cả bản ghi và tương tác của bạn khỏi hệ thống.',
      deleteData: 'Xóa Dữ Liệu Của Tôi', deleting: 'Đang xóa...', dataPortability: 'Tính Di Động Dữ Liệu',
      dataPortabilityDesc: 'Yêu cầu xuất toàn bộ dữ liệu cá nhân ở định dạng JSON.', requestExport: 'Yêu Cầu Xuất',
      exportSent: 'Liên kết xuất dữ liệu sẽ được gửi đến email của bạn.', loading: 'Đang thu thập ký ức...',
      emptyWishes: 'Bạn chưa khắc bất kỳ ước nguyện nào.', emptyPillars: 'Bạn chưa khắc bất kỳ trụ cột nào.',
      lights: 'Ánh Sáng', soulPoints: 'Điểm Linh Hồn', public: 'Công Khai', private: 'Riêng Tư',
    }
  },
  th: {
    Nav: { mySanctuary: 'ศาลเจ้าของฉัน', privacyPolicy: 'นโยบายความเป็นส่วนตัว', signOut: 'ออกจากระบบ', signIn: 'เข้าสู่ระบบ' },
    Store: { vipDesc: 'สำหรับผู้ที่ต้องการสร้างผลกระทบอย่างลึกซึ้ง' },
    Profile: {
      myWishes: 'ความปรารถนาของฉัน', myPillars: 'เสาของฉัน', privacyData: 'ความเป็นส่วนตัวและข้อมูล',
      dataPrivacy: 'ความเป็นส่วนตัวและการปกป้องข้อมูล', privacyDesc: 'เป็นไปตามมาตรฐานความเป็นส่วนตัวระดับโลก คุณมีการควบคุมเต็มรูปแบบเหนือรอยเท้าดิจิทัลของคุณในศาลเจ้า',
      rightForgotten: 'สิทธิ์ที่จะถูกลืม', rightForgottenDesc: 'ลบจารึกและการโต้ตอบทั้งหมดของคุณออกจากบันทึกของเราอย่างถาวร',
      deleteData: 'ลบข้อมูลของฉัน', deleting: 'กำลังลบ...', dataPortability: 'ความสามารถในการพกพาข้อมูล',
      dataPortabilityDesc: 'ขอส่งออกข้อมูลส่วนตัวของคุณทั้งหมดในรูปแบบ JSON', requestExport: 'ขอส่งออก',
      exportSent: 'ลิงก์ส่งออกข้อมูลจะถูกส่งไปยังอีเมลของคุณ', loading: 'กำลังรวบรวมความทรงจำ...',
      emptyWishes: 'คุณยังไม่ได้บันทึกความปรารถนาใดๆ', emptyPillars: 'คุณยังไม่ได้บันทึกเสาใดๆ',
      lights: 'แสงสว่าง', soulPoints: 'คะแนนวิญญาณ', public: 'สาธารณะ', private: 'ส่วนตัว',
    }
  },
  id: {
    Nav: { mySanctuary: 'Tempat Suciku', privacyPolicy: 'Kebijakan Privasi', signOut: 'Keluar', signIn: 'Masuk' },
    Store: { vipDesc: 'Untuk mereka yang ingin memberikan dampak mendalam.' },
    Profile: {
      myWishes: 'Keinginan Saya', myPillars: 'Pilar Saya', privacyData: 'Privasi & Data',
      dataPrivacy: 'Privasi & Perlindungan Data', privacyDesc: 'Sesuai standar privasi global (GDPR, CCPA, KR PIPA), Anda memiliki kendali penuh atas jejak digital Anda di Tempat Suci.',
      rightForgotten: 'Hak untuk Dilupakan', rightForgottenDesc: 'Hapus secara permanen semua catatan dan interaksi Anda dari arsip kami.',
      deleteData: 'Hapus Data Saya', deleting: 'Menghapus...', dataPortability: 'Portabilitas Data',
      dataPortabilityDesc: 'Minta ekspor lengkap data pribadi Anda dalam format JSON.', requestExport: 'Minta Ekspor',
      exportSent: 'Tautan ekspor data akan dikirim ke email Anda.', loading: 'Mengumpulkan kenangan Anda...',
      emptyWishes: 'Anda belum mengukir keinginan apapun.', emptyPillars: 'Anda belum mengukir pilar apapun.',
      lights: 'Cahaya', soulPoints: 'Poin Jiwa', public: 'Publik', private: 'Pribadi',
    }
  },
  my: {
    Nav: { mySanctuary: 'ကျွန်ုပ်၏ ဘုရားကျောင်း', privacyPolicy: 'ကိုယ်ရေးကိုယ်တာ မူဝါဒ', signOut: 'ထွက်ရန်', signIn: 'ဝင်ရောက်ရန်' },
    Store: { vipDesc: 'နက်ရှိုင်းသောအကျိုးသက်ရောက်မှုကို ဖန်တီးလိုသူများအတွက်' },
    Profile: {
      myWishes: 'ကျွန်ုပ်၏ဆန္ဒများ', myPillars: 'ကျွန်ုပ်၏တိုင်များ', privacyData: 'ကိုယ်ရေးကိုယ်တာ & ဒေတာ',
      dataPrivacy: 'ဒေတာကိုယ်ရေးကိုယ်တာနှင့်ကာကွယ်ရေး', privacyDesc: 'ကမ္ဘာလုံးဆိုင်ရာ ကိုယ်ရေးကိုယ်တာ စံချိန်များနှင့်အညီ သင်သည် ဘုရားကျောင်းရှိ သင်၏ဒစ်ဂျစ်တယ်ခြေရာများကို ထိန်းချုပ်နိုင်သည်',
      rightForgotten: 'မေ့ပျောက်ခွင့်', rightForgottenDesc: 'သင်၏မှတ်တမ်းများနှင့် အပြန်အလှန်ဆောင်ရွက်မှုများကို အမြဲတမ်း ဖျက်ပစ်ပါ',
      deleteData: 'ကျွန်ုပ်ဒေတာဖျက်ရန်', deleting: 'ဖျက်နေသည်...', dataPortability: 'ဒေတာပြောင်းရွှေ့မှု',
      dataPortabilityDesc: 'JSON ဖော်မတ်ဖြင့် သင်၏ကိုယ်ရေးကိုယ်တာ ဒေတာများကို ထုတ်ယူရန် တောင်းဆိုပါ', requestExport: 'ထုတ်ယူမှုတောင်းဆိုရန်',
      exportSent: 'ဒေတာထုတ်ယူလင့်ကို သင်၏အီးမေးလ်သို့ ပေးပို့မည်', loading: 'မှတ်ဉာဏ်များ စုဆောင်းနေသည်...',
      emptyWishes: 'သင်မည်သည့်ဆန္ဒမျှ မထွင်းဆစ်သေးပါ', emptyPillars: 'သင်မည်သည့်တိုင်မျှ မထွင်းဆစ်သေးပါ',
      lights: 'အလင်းများ', soulPoints: 'စိတ်ဝိညာဉ်မှတ်နိပ်', public: 'အများနှင့်', private: 'ကိုယ်ပိုင်',
    }
  },
  km: {
    Nav: { mySanctuary: 'សន្ទ្រាន់របស់ខ្ញុំ', privacyPolicy: 'គោលការណ៍ភាពឯកជន', signOut: 'ចេញ', signIn: 'ចូល' },
    Store: { vipDesc: 'សម្រាប់អ្នកដែលចង់បង្កើតផលប៉ះពាល់ជ្រៅៗ' },
    Profile: {
      myWishes: 'បំណងប្រាថ្នារបស់ខ្ញុំ', myPillars: 'សសររបស់ខ្ញុំ', privacyData: 'ភាពឯកជន & ទិន្នន័យ',
      dataPrivacy: 'ភាពឯកជននិងការការពារទិន្នន័យ', privacyDesc: 'អនុលោមតាមស្តង់ដារភាពឯកជនពិភពលោក អ្នកមានការគ្រប់គ្រងពេញលេញលើស្នាមចំណាំឌីជីថលរបស់អ្នកនៅក្នុងទីសក្ការបូជា',
      rightForgotten: 'សិទ្ធិត្រូវបានភ្លេច', rightForgottenDesc: 'លុបការចារឹករបស់អ្នកទាំងអស់ចេញពីកំណត់ត្រារបស់យើងជាអចិន្ត្រៃយ៍',
      deleteData: 'លុបទិន្នន័យរបស់ខ្ញុំ', deleting: 'កំពុងលុប...', dataPortability: 'ការចល័តទិន្នន័យ',
      dataPortabilityDesc: 'ស្នើសុំការនាំចេញទិន្នន័យផ្ទាល់ខ្លួនទាំងស្រុងរបស់អ្នកក្នុងទម្រង់ JSON', requestExport: 'ស្នើសុំការនាំចេញ',
      exportSent: 'តំណភ្ជាប់នាំចេញទិន្នន័យនឹងត្រូវបានផ្ញើទៅអ៊ីមែលរបស់អ្នក', loading: 'កំពុងប្រមូលការចងចាំ...',
      emptyWishes: 'អ្នកមិនទាន់ចារឹកបំណងប្រាថ្នាណាមួយទេ', emptyPillars: 'អ្នកមិនទាន់ចារឹកសសរណាមួយទេ',
      lights: 'ពន្លឺ', soulPoints: 'ពិន្ទុវិញ្ញាណ', public: 'សាធារណៈ', private: 'ឯកជន',
    }
  }
};

const locales = Object.keys(translations);

locales.forEach(loc => {
  const jsonPath = './messages/' + loc + '.json';
  if (!fs.existsSync(jsonPath)) return;
  
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const t = translations[loc];
  
  if (!json.Nav) json.Nav = {};
  Object.assign(json.Nav, t.Nav);
  
  if (!json.Store) json.Store = {};
  Object.assign(json.Store, t.Store);
  
  if (!json.Profile) json.Profile = {};
  Object.assign(json.Profile, t.Profile);
  
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log('Updated ' + loc);
});
