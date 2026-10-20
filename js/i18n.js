/* Who's on the Line? — interface text in English and Arabic */
window.STRINGS = {
  en: {
    gameTitle: "Who's on the Line?", gameTitleAr: 'مع من أتحدث؟',
    tagline: 'Every visitor hides a secret. Can you tell who’s who?',
    counterOpen: 'COUNTER 03 · OPEN',
    youthDay: 'Youth Day', youthDayAr: 'يوم الشباب العماني',
    howTitle: 'How to play',
    howBody: 'Chat with each visitor. Spot the Scammer, Attacker or Stealer — or the genuine customer. 3 chances, 5 minutes.',
    ringStart: 'Ring to start shift', topToday: 'TOP DETECTIVES TODAY', noScores: 'No scores yet — be the first!',
    happyYD: 'Happy Youth Day!',
    // clock in
    signIn: 'SHIFT SIGN-IN', signInAr: 'تسجيل المناوبة',
    signMeta: 'Omani Youth Day · Monday 26 October 2026 · Counter 03',
    name: 'Name:', namePh: 'Your name', post: 'Your post today:', visitorsSpeak: 'Visitors speak:',
    fictional: 'All visitors are fictional. Never use real customer details.',
    timeClock: 'TIME CLOCK', punch: 'punch in to open the counter', clockIn: 'CLOCK IN',
    needName: 'Write your name and tick your post', in: 'IN',
    // briefing
    briefTitle: 'Training briefing: know your four visitors', briefTitleAr: 'تعرّف على الزوّار',
    wants: 'Wants:', watch: 'Watch for:',
    r1: 'Chat: up to 6 questions', r2: 'Tap words to flag them', r3: 'Stamp your verdict', r4: '3 chances · 5 minutes',
    rWarn: 'Calling every visitor a fraudster loses chances too.',
    points: 'Points', pts1: 'Correct verdict +100', pts2: 'Within 3 questions +50', pts3: 'Checked ID or papers +20',
    pts4: 'Each red flag you tapped +10 · chance left +50',
    openCounter: 'Open the counter',
    // play
    nowServing: 'NOW SERVING', shiftLeft: 'shift left', chances: 'chances', questions: 'questions',
    flagHint: 'Tap a suspicious word to flag it', flagged: 'flagged', stampYour: 'stamp your verdict',
    evidence: 'evidence on your desk', makeCall: 'Make your call →', otherQ: 'Other questions', leftOf: 'of 6 left',
    youAsked: 'You:', otpNote: 'Never share or ask for OTPs!', idSticker: 'Please have<br>your ID ready',
    claims: 'claims to be', typing: 'typing…',
    // incoming
    ringing: 'LINE 2 · RINGING', ringRing: 'RING RING!', backMoment: 'Back in a moment', onCall: 'teller on a call',
    customerN: 'Customer', cantSee: "You can't see this visitor. Listen closely.", answer: 'Answer',
    newMsg: 'NEW MESSAGE', connected: 'LINE 2 · CONNECTED',
    // verdict
    caseClosed: 'CASE CLOSED', wrongLed: 'WRONG CALL', caught: 'CAUGHT!', wellServed: 'WELL SERVED!', wrongCall: 'WRONG CALL',
    correct: 'Correct', speed: 'Speed bonus', papers: 'Asked for papers', flagsPts: 'Red flags spotted',
    lostChance: '−1 chance lost', truth: 'The truth about', was: 'was', wasA: 'was a', wasGenuine: 'was a genuine customer.',
    replay: 'Replay the chat', callNext: 'Call next customer', seeResults: 'End of shift →',
    stampUsed: 'stamp used', onGlass: 'on the glass', refused: 'REFUSED', approved: 'APPROVED',
    youSaid: 'you said', transcript: 'The conversation',
    // pause
    onBreak: 'ON BREAK', onBreakAr: 'استراحة', resume: 'Resume shift', howToPlay: 'How to play',
    sound: 'Sound', on: 'on', off: 'off', language: 'Language', endEarly: 'End shift early',
    sureEnd: 'End your shift now? Your score will be saved.',
    // over
    shiftOver: 'SHIFT OVER', caseFiles: 'CASE FILES', wellDone: 'Well done', goodTry: 'Good try', readRight: 'visitors read right',
    chancesLeft: 'CHANCES LEFT', total: 'TOTAL', rank: 'RANK', today: 'TODAY', timeUp: 'TIME UP',
    nextPlayer: 'Next player', playAgain: 'Play again', board: 'Leaderboard', claimed: 'claimed:', unresolved: 'not decided',
    // leaderboard
    live: 'LIVE', players: 'PLAYERS', bestToday: 'Best Detectives Today', bestTodayAr: 'أفضل المحققين',
    bestByRole: 'Best by role', prize: 'Top 3 win a Youth Day trophy!', exportCsv: 'Export CSV', resetToday: "Reset today's board",
    sureReset: "Delete all of today's scores on this device?", back: 'Back',
    roleNames: { scammer: 'Scammer', attacker: 'Attacker', stealer: 'Stealer', legal: 'Legal' },
    roleWants: {
      scammer: 'To trick the bank or a customer into moving money.',
      attacker: 'To break into bank systems or staff accounts.',
      stealer: "To steal a customer's identity or data.",
      legal: 'A genuine service.'
    },
    roleWatch: {
      scammer: 'Urgency, emotional pressure, fake papers, "just this once".',
      attacker: 'Passwords, OTPs, USBs, links. Poses as IT or a vendor.',
      stealer: "Changing phone or email, asking about someone else's account.",
      legal: 'Maybe in a hurry, but answers checks and accepts the process.'
    },
    memo: ['Rush and pressure', 'Asks for OTP or password', 'New phone or email', '"Just this once"', "Papers don't match"],
    memoTitle: 'RED FLAGS!',
    jobs: {
      guard: 'Security guard', reception: 'Receptionist', teller: 'Customer care / teller', hr: 'HR officer',
      ceo: 'CEO / executive office', rm: 'Relationship manager', it: 'IT / helpdesk', ops: 'Operations / back office', any: 'Any employee'
    }
  },
  ar: {
    gameTitle: "Who's on the Line?", gameTitleAr: 'مع من أتحدث؟',
    tagline: 'كل زائر عنده سر. تقدر تعرف منو منو؟',
    counterOpen: 'COUNTER 03 · OPEN',
    youthDay: 'يوم الشباب', youthDayAr: 'يوم الشباب العماني',
    howTitle: 'طريقة اللعب',
    howBody: 'تحدّث مع كل زائر. اكتشف المحتال أو المخترق أو سارق البيانات — أو العميل الحقيقي. 3 فرص، 5 دقائق.',
    ringStart: 'اضغط الجرس لبدء المناوبة', topToday: 'TOP DETECTIVES TODAY', noScores: 'ما في نتائج للحين — كن الأول!',
    happyYD: 'يوم شباب سعيد!',
    signIn: 'تسجيل المناوبة', signInAr: 'SHIFT SIGN-IN',
    signMeta: 'يوم الشباب العماني · الاثنين 26 أكتوبر 2026 · الكاونتر 03',
    name: 'الاسم:', namePh: 'اسمك', post: 'موقعك اليوم:', visitorsSpeak: 'لغة الزوّار:',
    fictional: 'كل الزوّار شخصيات خيالية. لا تستخدم بيانات عملاء حقيقية.',
    timeClock: 'ساعة الدوام', punch: 'سجّل حضورك لفتح الكاونتر', clockIn: 'تسجيل حضور',
    needName: 'اكتب اسمك واختر موقعك', in: 'IN',
    briefTitle: 'تعرّف على زوّارك الأربعة', briefTitleAr: 'Know your four visitors',
    wants: 'يبي:', watch: 'انتبه من:',
    r1: 'حوار: لين 6 أسئلة', r2: 'اضغط الكلمات المشبوهة', r3: 'اختم حكمك', r4: '3 فرص · 5 دقائق',
    rWarn: 'اللي يشك في كل الناس يخسر فرص بعد.',
    points: 'النقاط', pts1: 'حكم صحيح +100', pts2: 'خلال 3 أسئلة +50', pts3: 'تحققت من الهوية أو الأوراق +20',
    pts4: 'كل علامة خطر ضغطتها +10 · كل فرصة باقية +50',
    openCounter: 'افتح الكاونتر',
    nowServing: 'NOW SERVING', shiftLeft: 'باقي', chances: 'الفرص', questions: 'الأسئلة',
    flagHint: 'اضغط على كلمة مشبوهة لتعليمها', flagged: 'معلّمة', stampYour: 'اختم حكمك',
    evidence: 'الأدلة على مكتبك', makeCall: 'احكم الحين ←', otherQ: 'أسئلة ثانية', leftOf: 'من 6 باقية',
    youAsked: 'أنت:', otpNote: 'لا تشارك أو تطلب رموز التحقق!', idSticker: 'جهّز بطاقتك<br>لو سمحت',
    claims: 'يدّعي أنه', typing: 'يكتب…',
    ringing: 'LINE 2 · RINGING', ringRing: 'رننن!', backMoment: 'لحظة وراجعين', onCall: 'الموظف في مكالمة',
    customerN: 'العميل', cantSee: 'ما تشوف هالزائر. اسمع زين.', answer: 'رد',
    newMsg: 'NEW MESSAGE', connected: 'LINE 2 · CONNECTED',
    caseClosed: 'CASE CLOSED', wrongLed: 'WRONG CALL', caught: 'انكشف!', wellServed: 'خدمة ممتازة!', wrongCall: 'حكم خاطئ',
    correct: 'حكم صحيح', speed: 'مكافأة السرعة', papers: 'طلبت الأوراق', flagsPts: 'علامات خطر',
    lostChance: '−1 فرصة', truth: 'الحقيقة عن', was: 'كان', wasA: 'كان', wasGenuine: 'كان عميل حقيقي.',
    replay: 'راجع المحادثة', callNext: 'نادِ العميل التالي', seeResults: 'نهاية المناوبة ←',
    stampUsed: 'الختم المستخدم', onGlass: 'على الزجاج', refused: 'REFUSED', approved: 'APPROVED',
    youSaid: 'حكمك', transcript: 'المحادثة',
    onBreak: 'استراحة', onBreakAr: 'ON BREAK', resume: 'كمّل المناوبة', howToPlay: 'طريقة اللعب',
    sound: 'الصوت', on: 'شغال', off: 'مقفل', language: 'اللغة', endEarly: 'أنهِ المناوبة',
    sureEnd: 'تبي تنهي المناوبة الحين؟ بينحفظ مجموعك.',
    shiftOver: 'SHIFT OVER', caseFiles: 'ملفات القضايا', wellDone: 'أحسنت', goodTry: 'محاولة حلوة', readRight: 'زوّار عرفتهم صح',
    chancesLeft: 'CHANCES LEFT', total: 'TOTAL', rank: 'RANK', today: 'TODAY', timeUp: 'TIME UP',
    nextPlayer: 'اللاعب التالي', playAgain: 'العب مرة ثانية', board: 'لوحة الصدارة', claimed: 'يدّعي:', unresolved: 'بدون حكم',
    live: 'LIVE', players: 'PLAYERS', bestToday: 'أفضل المحققين اليوم', bestTodayAr: 'Best Detectives Today',
    bestByRole: 'الأفضل حسب الموقع', prize: 'أول 3 يفوزون بكأس يوم الشباب!', exportCsv: 'تصدير CSV', resetToday: 'مسح لوحة اليوم',
    sureReset: 'تبي تمسح كل نتائج اليوم من هالجهاز؟', back: 'رجوع',
    roleNames: { scammer: 'محتال', attacker: 'مخترق', stealer: 'سارق بيانات', legal: 'عميل حقيقي' },
    roleWants: {
      scammer: 'يخدع البنك أو عميل عشان تتحرك الفلوس.',
      attacker: 'يخترق أنظمة البنك أو حسابات الموظفين.',
      stealer: 'يسرق هوية عميل أو بياناته.',
      legal: 'خدمة حقيقية.'
    },
    roleWatch: {
      scammer: 'استعجال، ضغط عاطفي، أوراق مزيفة، "هالمرة بس".',
      attacker: 'كلمات مرور، رموز تحقق، فلاشات، روابط. ينتحل صفة التقنية أو مورد.',
      stealer: 'يغير الرقم أو الإيميل، يسأل عن حساب غيره.',
      legal: 'يمكن مستعجل، بس يجاوب ويقبل الإجراءات.'
    },
    memo: ['استعجال وضغط', 'يطلب رمز أو كلمة مرور', 'رقم أو إيميل جديد', '"هالمرة بس"', 'أوراق ما تطابق'],
    memoTitle: 'علامات الخطر!',
    jobs: {
      guard: 'حارس أمن', reception: 'موظف استقبال', teller: 'خدمة العملاء / صراف', hr: 'موظف موارد بشرية',
      ceo: 'الرئيس التنفيذي / المكتب التنفيذي', rm: 'مدير علاقات', it: 'التقنية / الدعم الفني', ops: 'العمليات / المكتب الخلفي', any: 'أي موظف'
    }
  }
};
// English role names in stamps (always shown with Arabic underneath)
window.ROLE_EN = { scammer: 'SCAMMER', attacker: 'ATTACKER', stealer: 'STEALER', legal: 'LEGAL' };
window.ROLE_AR = { scammer: 'محتال', attacker: 'مخترق', stealer: 'سارق بيانات', legal: 'عميل حقيقي' };
window.JOB_ORDER = ['guard', 'reception', 'teller', 'hr', 'ceo', 'rm', 'it', 'ops', 'any'];
