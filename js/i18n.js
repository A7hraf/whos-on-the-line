/* Who's on the Line? — interface text in English and Arabic (Modern Standard Arabic) */
window.STRINGS = {
  en: {
    gameTitle: "Who's on the Line?", gameTitleAr: 'مع من أتحدث؟',
    tagline: 'Every visitor hides a secret. Can you tell who’s who?',
    counterOpen: 'COUNTER 03 · OPEN',
    youthDay: 'Youth Day', youthDayAr: 'يوم الشباب العماني', dateShort: '26 OCT', bank: 'AHLIBANK',
    howTitle: 'How to play',
    howBody: 'Chat with each visitor. Spot the Scammer, Attacker, Money launderer or Insider — or the genuine customer. 3 chances, 5 minutes.',
    ringStart: 'Ring to start shift', topToday: 'TOP DETECTIVES<br>TODAY', noScores: 'No scores yet — be the first!',
    happyYD: 'Happy Youth Day!',
    // clock in
    signIn: 'SHIFT SIGN-IN', signInAr: 'تسجيل المناوبة',
    signMeta: 'Omani Youth Day · Monday 26 October 2026 · Counter 03',
    name: 'Name:', namePh: 'Your name', post: 'Your post today:', visitorsSpeak: 'Visitors speak:',
    fictional: 'All visitors are fictional. Never use real customer details.',
    timeClock: 'TIME CLOCK', punch: 'punch in to open the counter', clockIn: 'CLOCK IN',
    needName: 'Write your name and tick your post', in: 'IN',
    // briefing
    briefTitle: 'Training briefing: know your five visitors', briefTitleAr: 'تعرّف على الزوّار',
    wants: 'Wants:', watch: 'Watch for:',
    r1: 'Chat: ask a few questions', r2: 'Tap words to flag them', r3: 'Stamp your verdict', r4: '3 chances · 5 minutes',
    rWarn: 'Calling every visitor a fraudster loses chances too.',
    points: 'Points', pts1: 'Correct verdict +100', pts2: 'Within 3 questions +50', pts3: 'Checked ID or papers +20',
    pts4: 'Each red flag you tapped +10 · chance left +50',
    openCounter: 'Open the counter',
    // difficulty
    chooseLevel: 'Choose your level',
    levels: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    levelDesc: {
      easy: 'Clear cases · up to 6 questions · hints on',
      medium: 'Trickier cases · visitors get impatient · ×1.5 points',
      hard: 'Expert cases · strict time · no hints · ×2 points'
    },
    stage: 'Stage', levelUp: 'LEVEL UP!',
    stageMsg: ['', 'Trickier visitors, fewer questions', 'Expert visitors — stay sharp!'],
    waits: 'leaves in', tooSlow: 'TOO SLOW', leftWaiting: 'got tired of waiting and left.',
    difficulty: 'LEVEL',
    // play
    nowServing: 'NOW SERVING', shiftLeft: 'shift left', chances: 'chances', questions: 'questions',
    flagHint: 'Tap a suspicious word to flag it', flagged: 'flagged', stampYour: 'stamp your verdict',
    evidence: 'evidence on your desk', makeCall: 'Make your call →', otherQ: 'Other questions', leftOf: 'left',
    youAsked: 'You:', otpNote: 'Never share or ask for OTPs!', idSticker: 'Please have<br>your ID ready',
    claims: 'claims to be', typing: 'typing…',
    // incoming
    ringing: 'LINE 2 · RINGING', ringRing: 'RING RING!', backMoment: 'Back in a moment', onCall: 'teller on a call',
    customerN: 'Customer', cantSee: "You can't see this visitor. Listen closely.", answer: 'Answer',
    newMsg: 'NEW MESSAGE', connected: 'LINE 2 · CONNECTED', incoming: 'INCOMING', line2: 'LINE 2',
    // verdict
    caseClosed: 'CASE CLOSED', wrongLed: 'WRONG CALL', caught: 'CAUGHT!', wellServed: 'WELL SERVED!', wrongCall: 'WRONG CALL',
    correct: 'Correct', speed: 'Speed bonus', papers: 'Asked for papers', flagsPts: 'Red flags spotted', levelBonus: 'Level bonus',
    lostChance: '−1 chance lost', truth: 'The truth about', was: 'was', wasA: 'was a', wasGenuine: 'was a genuine customer.',
    replay: 'Replay the chat', callNext: 'Call next customer', seeResults: 'End of shift →',
    stampUsed: 'stamp used', onGlass: 'on the glass', refused: 'REFUSED', approved: 'APPROVED',
    youSaid: 'you said', transcript: 'The conversation', ok: 'OK',
    // pause
    onBreak: 'ON BREAK', onBreakAr: 'استراحة', resume: 'Resume shift', howToPlay: 'How to play',
    sound: 'Sound', on: 'on', off: 'off', language: 'Language', endEarly: 'End shift early',
    sureEnd: 'End your shift now? Your score will be saved.',
    // over
    shiftOver: 'SHIFT OVER', caseFiles: 'CASE FILES', wellDone: 'Well done', goodTry: 'Good try', readRight: 'visitors read right',
    chancesLeft: 'CHANCES LEFT', total: 'TOTAL', rank: 'RANK', today: 'TODAY', timeUp: 'TIME UP',
    operator: 'OPERATOR', counter: 'COUNTER 03', score: 'SCORE', wasRole: 'was',
    nextPlayer: 'Next player', playAgain: 'Play again', board: 'Leaderboard', claimed: 'claimed:', unresolved: 'not decided',
    // leaderboard
    live: 'LIVE', players: 'PLAYERS', bestToday: 'Best Detectives Today', bestTodayAr: 'أفضل المحققين',
    bestByRole: 'Best by role', prize: 'Top 3 win a Youth Day trophy!', exportCsv: 'Export CSV', resetToday: "Reset today's board",
    sureReset: "Delete all of today's scores on this device?", back: 'Back',
    home: 'Welcome page', mainMenu: 'Back to welcome page', sureQuit: 'Leave this shift and go back to the welcome page? This game will not be saved.',
    audioTitle: 'Sound board', music: 'Music', office: 'Office sounds', voices: 'Visitor voices', effects: 'Effects',
    roleNames: { scammer: 'Scammer', attacker: 'Attacker', launderer: 'Money launderer', insider: 'Insider', legal: 'Legal' },
    roleNamesF: { scammer: 'Scammer', attacker: 'Attacker', launderer: 'Money launderer', insider: 'Insider', legal: 'Legal' },
    roleStamp: { scammer: 'SCAMMER', attacker: 'ATTACKER', launderer: 'LAUNDERER', insider: 'INSIDER', legal: 'LEGAL' },
    roleWants: {
      scammer: 'To trick the bank or a customer into moving money.',
      attacker: 'To break into bank systems or staff accounts.',
      launderer: 'To hide where dirty money came from.',
      insider: 'A real colleague using their job to break the rules.',
      legal: 'A genuine service.'
    },
    roleWatch: {
      scammer: 'Urgency, emotional pressure, fake papers, "just this once".',
      attacker: 'Passwords, OTPs, USBs, links. Poses as IT or a vendor.',
      launderer: 'Lots of cash, split deposits, no clear source, money in and straight out.',
      insider: '"Skip the approval", "just between us", sharing passwords or data, favours for family.',
      legal: 'Maybe in a hurry, but answers checks and accepts the process.'
    },
    memo: ['Rush and pressure', 'Asks for OTP or password', 'Cash with no clear source', '"Just between us"', "Papers don't match"],
    memoTitle: 'RED FLAGS!',
    badges: { VENDOR: 'VENDOR', IT: 'IT', COURIER: 'COURIER', VISITOR: 'VISITOR', STAFF: 'STAFF' },
    jobs: {
      guard: 'Security guard', reception: 'Receptionist', teller: 'Customer care / teller', hr: 'HR officer',
      ceo: 'CEO / executive office', rm: 'Relationship manager', it: 'IT / helpdesk', ops: 'Operations / back office', any: 'Any employee'
    }
  },
  ar: {
    gameTitle: 'مع من أتحدث؟', gameTitleAr: '',
    tagline: 'لكل زائرٍ سرّ. فهل تستطيع أن تكشف حقيقة كلّ واحد؟',
    counterOpen: 'الشبّاك 03 · مفتوح',
    youthDay: 'يوم الشباب', youthDayAr: 'يوم الشباب العُماني', dateShort: '26 أكتوبر', bank: 'البنك الأهلي',
    howTitle: 'طريقة اللعب',
    howBody: 'حاوِر كلّ زائر، واكشف المحتال أو المخترق أو غاسل الأموال أو الموظف المخالف، أو تعرّف على العميل الحقيقي. لديك ثلاث فرص وخمس دقائق.',
    ringStart: 'اقرع الجرس لبدء المناوبة', topToday: 'أفضل المحققين<br>اليوم', noScores: 'لا توجد نتائج بعد، كن أول المشاركين!',
    happyYD: 'يوم شباب سعيد!',
    signIn: 'تسجيل المناوبة', signInAr: '',
    signMeta: 'يوم الشباب العُماني · الاثنين 26 أكتوبر 2026 · الشبّاك 03',
    name: 'الاسم:', namePh: 'اكتب اسمك', post: 'موقع عملك اليوم:', visitorsSpeak: 'لغة الزوّار:',
    fictional: 'جميع الزوّار شخصيات خيالية. لا تستخدم بيانات عملاء حقيقية أبدًا.',
    timeClock: 'ساعة الحضور', punch: 'سجّل حضورك لفتح الشبّاك', clockIn: 'تسجيل الحضور',
    needName: 'اكتب اسمك واختر موقع عملك', in: 'دخول',
    briefTitle: 'إحاطة تدريبية: تعرّف على زوّارك الخمسة', briefTitleAr: '',
    wants: 'هدفه:', watch: 'انتبه إلى:',
    r1: 'حاوِر الزائر واطرح بعض الأسئلة', r2: 'اضغط على الكلمات المريبة', r3: 'اختم حكمك', r4: 'ثلاث فرص · خمس دقائق',
    rWarn: 'من يتّهم كلّ الزوّار بالاحتيال يخسر فرصه أيضًا.',
    points: 'النقاط', pts1: 'حكم صحيح +100', pts2: 'حكم خلال 3 أسئلة +50', pts3: 'التحقق من الهوية أو المستندات +20',
    pts4: 'كل علامة خطر تكتشفها +10 · كل فرصة متبقية +50',
    openCounter: 'افتح الشبّاك',
    chooseLevel: 'اختر مستوى الصعوبة',
    levels: { easy: 'سهل', medium: 'متوسط', hard: 'صعب' },
    levelDesc: {
      easy: 'حالات واضحة · حتى 6 أسئلة · مع تلميحات',
      medium: 'حالات أدق · صبر الزوّار ينفد · النقاط مرة ونصف',
      hard: 'للخبراء · وقت محدود · بلا تلميحات · النقاط مضاعفة'
    },
    stage: 'المرحلة', levelUp: 'مرحلة جديدة!',
    stageMsg: ['', 'زوّار أكثر دهاءً وأسئلة أقل', 'زوّار محترفون، فابقَ يقظًا!'],
    waits: 'يغادر بعد', tooSlow: 'تأخّرت كثيرًا', leftWaiting: 'ملّ الانتظار وغادر.',
    difficulty: 'المستوى',
    nowServing: 'نخدم الآن', shiftLeft: 'المتبقي', chances: 'الفرص', questions: 'الأسئلة',
    flagHint: 'اضغط على كلمة مريبة لتمييزها', flagged: 'مميّزة', stampYour: 'اختم حكمك',
    evidence: 'الأدلة على مكتبك', makeCall: 'أصدِر حكمك ←', otherQ: 'أسئلة أخرى', leftOf: 'متبقية',
    youAsked: 'أنت:', otpNote: 'لا تشارك رمز التحقق ولا تطلبه أبدًا!', idSticker: 'يُرجى تجهيز<br>البطاقة الشخصية',
    claims: 'الصفة المدّعاة:', typing: 'يكتب…',
    ringing: 'الخط 2 · يرنّ', ringRing: 'رنين!', backMoment: 'نعود بعد لحظات', onCall: 'الموظف في مكالمة',
    customerN: 'العميل', cantSee: 'لا يمكنك رؤية هذا المتصل، فأنصِت جيدًا.', answer: 'رُدّ',
    newMsg: 'رسالة جديدة', connected: 'الخط 2 · متّصل', incoming: 'مكالمة واردة', line2: 'الخط 2',
    caseClosed: 'أُغلقت القضية', wrongLed: 'حكم خاطئ', caught: 'كُشِف أمره!', wellServed: 'خدمة ممتازة!', wrongCall: 'حكم خاطئ',
    correct: 'حكم صحيح', speed: 'مكافأة السرعة', papers: 'طلبت المستندات', flagsPts: 'علامات خطر مكتشفة', levelBonus: 'مكافأة المستوى',
    lostChance: 'خسرت فرصة واحدة', truth: 'حقيقة', was: '', wasA: '', wasGenuine: '',
    replay: 'أعِد عرض المحادثة', callNext: 'نادِ العميل التالي', seeResults: 'نهاية المناوبة ←',
    stampUsed: 'الختم المستخدم', onGlass: 'على الزجاج', refused: 'مرفوض', approved: 'مقبول',
    youSaid: 'حكمك:', transcript: 'المحادثة', ok: 'موافق',
    onBreak: 'استراحة', onBreakAr: '', resume: 'استئناف المناوبة', howToPlay: 'طريقة اللعب',
    sound: 'الصوت', on: 'يعمل', off: 'متوقف', language: 'اللغة', endEarly: 'إنهاء المناوبة',
    sureEnd: 'هل تريد إنهاء مناوبتك الآن؟ ستُحفَظ نتيجتك.',
    shiftOver: 'انتهت المناوبة', caseFiles: 'ملفات القضايا', wellDone: 'أحسنت', goodTry: 'محاولة جيدة', readRight: 'زوّار حكمت عليهم بصواب',
    chancesLeft: 'الفرص المتبقية', total: 'المجموع', rank: 'الترتيب', today: 'اليوم', timeUp: 'انتهى الوقت',
    operator: 'الموظف', counter: 'الشبّاك 03', score: 'النقاط', wasRole: 'الحقيقة:',
    nextPlayer: 'اللاعب التالي', playAgain: 'العب مرة أخرى', board: 'لوحة الصدارة', claimed: 'الصفة المدّعاة:', unresolved: 'لم يُحكَم',
    live: 'مباشر', players: 'لاعبًا', bestToday: 'أفضل المحققين اليوم', bestTodayAr: '',
    bestByRole: 'الأفضل حسب موقع العمل', prize: 'يفوز أصحاب المراكز الثلاثة الأولى بكأس يوم الشباب!', exportCsv: 'تصدير ملف CSV', resetToday: 'مسح نتائج اليوم',
    sureReset: 'هل تريد حذف جميع نتائج اليوم من هذا الجهاز؟', back: 'رجوع',
    home: 'الصفحة الرئيسية', mainMenu: 'العودة إلى الصفحة الرئيسية', sureQuit: 'هل تريد مغادرة المناوبة والعودة إلى الصفحة الرئيسية؟ لن تُحفَظ هذه الجولة.',
    audioTitle: 'لوحة الصوت', music: 'الموسيقى', office: 'أصوات المكتب', voices: 'أصوات الزوّار', effects: 'المؤثرات',
    roleNames: { scammer: 'محتال', attacker: 'مخترق', launderer: 'غاسل أموال', insider: 'موظف مخالف', legal: 'عميل حقيقي' },
    roleNamesF: { scammer: 'محتالة', attacker: 'مخترقة', launderer: 'غاسلة أموال', insider: 'موظفة مخالفة', legal: 'عميلة حقيقية' },
    roleStamp: { scammer: 'محتال', attacker: 'مخترق', launderer: 'غاسل أموال', insider: 'موظف مخالف', legal: 'عميل حقيقي' },
    roleWants: {
      scammer: 'خداع البنك أو العميل لتحويل الأموال.',
      attacker: 'اختراق أنظمة البنك أو حسابات الموظفين.',
      launderer: 'إخفاء مصدر أموال مشبوهة.',
      insider: 'زميل حقيقي يستغلّ وظيفته لمخالفة القواعد.',
      legal: 'الحصول على خدمة حقيقية.'
    },
    roleWatch: {
      scammer: 'الاستعجال، والضغط العاطفي، والمستندات المزوّرة، وعبارة "هذه المرة فقط".',
      attacker: 'طلب كلمات المرور ورموز التحقق، وأجهزة USB، والروابط، وانتحال صفة فريق التقنية أو المورّدين.',
      launderer: 'نقود كثيرة، وإيداعات مقسّمة، ومصدر غير واضح، وأموال تدخل وتخرج بسرعة.',
      insider: 'عبارات مثل "تجاوز الموافقة" و"بيني وبينك"، ومشاركة كلمات المرور أو البيانات، وخدمات للأقارب.',
      legal: 'قد يكون مستعجلًا، لكنه يجيب عن أسئلة التحقق ويلتزم بالإجراءات.'
    },
    memo: ['الاستعجال والضغط', 'طلب رمز التحقق أو كلمة المرور', 'نقود بلا مصدر واضح', 'عبارة "بيني وبينك"', 'مستندات غير متطابقة'],
    memoTitle: 'علامات الخطر!',
    badges: { VENDOR: 'مورّد', IT: 'تقنية', COURIER: 'مندوب', VISITOR: 'زائر', STAFF: 'موظف' },
    jobs: {
      guard: 'حارس أمن', reception: 'موظف استقبال', teller: 'خدمة العملاء / أمين الصندوق', hr: 'موظف الموارد البشرية',
      ceo: 'الرئيس التنفيذي / المكتب التنفيذي', rm: 'مدير علاقات العملاء', it: 'تقنية المعلومات / الدعم الفني', ops: 'العمليات / المكتب الخلفي', any: 'أي موظف'
    }
  }
};
// English role names in stamps (always shown with Arabic underneath in the English interface)
window.ROLE_EN = { scammer: 'SCAMMER', attacker: 'ATTACKER', launderer: 'LAUNDERER', insider: 'INSIDER', legal: 'LEGAL' };
window.ROLE_AR = { scammer: 'محتال', attacker: 'مخترق', launderer: 'غاسل أموال', insider: 'موظف مخالف', legal: 'عميل حقيقي' };
window.JOB_ORDER = ['guard', 'reception', 'teller', 'hr', 'ceo', 'rm', 'it', 'ops', 'any'];
