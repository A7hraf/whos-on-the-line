/* Who's on the Line? — scripted visitors (free version, no live AI).
 *
 * Every text is [English, Arabic]. The Arabic is Modern Standard Arabic (فصحى).
 * Wrap a real red-flag phrase in [[double brackets]]: players can tap it to flag it,
 * and the debrief counts how many they caught.
 *
 * level: 1 = clear case, 2 = trickier, 3 = expert. The difficulty the player picks,
 * and how far into the shift they are, decide which levels can appear.
 *
 * To add a visitor: copy any block below, give it a new id, set role, level, jobs,
 * channel ('person' | 'phone' | 'whatsapp' | 'email' | 'internal') and write the lines.
 * Each entry in `acts` is a question the player can ask (see ACTIONS) and the
 * visitor's reply. A reply can also be { say: [en, ar], reveal: [[label, value, bad], ...] }
 * to add rows to the evidence card / record panel when the player checks something.
 */
(function () {
  // Questions the player can ask. verify:true = counts as "asked for verification" (+20).
  window.ACTIONS = {
    id:       { icon: 'identification-card', chip: ['Ask for ID', 'اطلب البطاقة الشخصية'], say: ['Can I see your ID, please?', 'هل يمكنني الاطلاع على بطاقتك الشخصية من فضلك؟'], verify: true },
    poa:      { icon: 'scroll', chip: ['Power of attorney?', 'هل لديك وكالة؟'], say: ['Do you have a power of attorney?', 'هل لديك وكالة رسمية؟'], verify: true },
    why:      { icon: 'timer', chip: ['Why the rush?', 'لماذا الاستعجال؟'], say: ['Why is this so urgent?', 'لماذا هذا الأمر مستعجل إلى هذا الحد؟'] },
    callback: { icon: 'phone-outgoing', chip: ['Call back on file', 'اتصل بالرقم المسجّل'], say: ["I'll call back on the number we have on file.", 'سأعاود الاتصال على الرقم المسجّل لدينا.'], verify: true },
    secq:     { icon: 'lock-key', chip: ['Security question', 'أسئلة الأمان'], say: ['Please answer the security questions first.', 'أجب عن أسئلة الأمان أولًا من فضلك.'], verify: true },
    appt:     { icon: 'calendar-check', chip: ['Check appointments', 'راجع المواعيد'], say: ["Let me check today's appointment list.", 'دعني أراجع قائمة مواعيد اليوم.'], verify: true },
    confirm:  { icon: 'phone-call', chip: ['Confirm with them', 'تأكّد من الجهة'], say: ["I'll call the person you mentioned to confirm.", 'سأتصل بالشخص الذي ذكرته للتأكد.'], verify: true },
    badge:    { icon: 'identification-badge', chip: ['Staff / vendor badge', 'بطاقة العمل'], say: ['Can I see your staff or company badge?', 'هل يمكنني الاطلاع على بطاقة العمل أو بطاقة الشركة؟'], verify: true },
    letter:   { icon: 'envelope-simple', chip: ['Official letter?', 'خطاب رسمي؟'], say: ['Do you have an official letter or documents?', 'هل لديك خطاب رسمي أو مستندات؟'], verify: true },
    ticket:   { icon: 'ticket', chip: ['Ticket number?', 'رقم التذكرة؟'], say: ["What's the ticket or reference number?", 'ما رقم التذكرة أو الرقم المرجعي؟'], verify: true },
    who:      { icon: 'question', chip: ['Whose account?', 'باسم من الحساب؟'], say: ['Whose name is the account in?', 'باسم من هذا الحساب؟'] },
    what:     { icon: 'chat-circle-dots', chip: ['What exactly?', 'ماذا تحتاج تحديدًا؟'], say: ['What exactly do you need from us?', 'ما الذي تحتاجه منا تحديدًا؟'] },
    policy:   { icon: 'hand-palm', chip: ['Explain the policy', 'وضّح السياسة'], say: ["Sorry, our policy doesn't allow that.", 'عذرًا، سياستنا لا تسمح بذلك.'] },
    branch:   { icon: 'storefront', chip: ['Visit a branch', 'راجِع الفرع'], say: ['Please visit a branch in person with your ID.', 'يُرجى مراجعة الفرع شخصيًا مع بطاقتك الشخصية.'] },
    system:   { icon: 'desktop', chip: ['Check the system', 'تحقّق من النظام'], say: ['Let me check our system first.', 'دعني أتحقق من النظام أولًا.'], verify: true },
    log:      { icon: 'clipboard-text', chip: ['Sign visitor log', 'سجلّ الزوّار'], say: ['Please sign the visitor log and wait for an escort.', 'يُرجى التوقيع في سجلّ الزوّار وانتظار المرافق.'], verify: true },
    official: { icon: 'envelope-open', chip: ['Use official channel', 'القناة الرسمية'], say: ['Please send it through the official channel.', 'يُرجى إرسال الطلب عبر القناة الرسمية.'], verify: true },
    wait:     { icon: 'armchair', chip: ['Please wait', 'تفضّل بالانتظار'], say: ['Please wait in the lobby while I check.', 'تفضّل بالانتظار في الردهة ريثما أتحقق.'] },
    otp:      { icon: 'prohibit', chip: ['I never share codes', 'لا أشارك الرموز'], say: ['I never share OTPs or passwords with anyone.', 'لا أشارك رموز التحقق أو كلمات المرور مع أي أحد.'] },
    link:     { icon: 'link', chip: ['Why this link?', 'لماذا هذا الرابط؟'], say: ['Why should I log in through this link?', 'لماذا عليّ تسجيل الدخول عبر هذا الرابط؟'] },
    usb:      { icon: 'usb', chip: ['No USB devices', 'يُمنع توصيل USB'], say: ['We never plug outside USB devices into bank PCs.', 'لا نوصِل أي جهاز USB خارجي بأجهزة البنك إطلاقًا.'] },
    email:    { icon: 'at', chip: ['Send by email', 'أرسله بالبريد'], say: ['Could you send it by email instead?', 'هل يمكنك إرساله بالبريد الإلكتروني بدلًا من ذلك؟'] }
  };

  // Places / channels shown in the tag above the dialogue box
  window.PLACES = {
    counter:   ['Branch counter', 'شبّاك الفرع'],
    branchoff: ["Branch manager's office", 'مكتب مدير الفرع'],
    gate:      ['HQ main gate', 'البوابة الرئيسية للمقر'],
    reception: ['HQ reception', 'استقبال المقر الرئيسي'],
    hroffice:  ['HQ · HR office', 'المقر الرئيسي · مكتب الموارد البشرية'],
    exec:      ['HQ · executive floor', 'المقر الرئيسي · الطابق التنفيذي'],
    callcentre:['Call centre', 'مركز الاتصال'],
    itdesk:    ['HQ · IT helpdesk', 'المقر الرئيسي · الدعم الفني'],
    ops:       ['HQ · operations', 'المقر الرئيسي · العمليات'],
    rmdesk:    ['Relationship desk', 'مكتب علاقات العملاء']
  };
  window.CHANNELS = {
    person:   ['In person', 'حضوريًا'],
    phone:    ['Phone call', 'مكالمة هاتفية'],
    whatsapp: ['WhatsApp', 'واتساب'],
    email:    ['Email', 'بريد إلكتروني'],
    internal: ['Internal chat', 'محادثة داخلية']
  };

  window.ENCOUNTERS = [
    // =================== SCAMMERS ===================
    {
      id: 'S1', role: 'scammer', level: 1, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Salim', 'سالم'], age: 24, v: { brows: 'worried' } },
      claim: ["the customer's son", 'ابن العميل'],
      arrive: ['A young man in a white dishdasha hurries to your counter, out of breath.', 'يُسرع شابٌّ بدشداشة بيضاء نحو شبّاكك وهو يلهث.'],
      open: ['My father is in hospital. I need to withdraw his money [[today]]. Can you make an exception [[just this once]]?', 'والدي في المستشفى، وعليّ أن أسحب أمواله [[اليوم]]. هل يمكنك أن تستثنيني [[هذه المرة فقط]]؟'],
      card: { title: ['Withdrawal slip', 'قسيمة سحب'], rows: [[['Account', 'الحساب'], ['Hamood S.', 'حمود س.']], [['Amount', 'المبلغ'], ['3,000 OMR', '3,000 ر.ع'], 1], [['Signed by', 'الموقِّع'], ['Salim (son)', 'سالم (الابن)'], 1]] },
      acts: {
        id: ["Here's my ID. And this is a [[photo of my father's ID]] on my phone.", 'هذه بطاقتي، وهذه [[صورة بطاقة والدي]] على هاتفي.'],
        poa: ["Power of attorney? There's [[no time for paperwork]], he's in hospital!", 'وكالة؟ [[لا وقت للأوراق]]، إنه في المستشفى!'],
        why: ['The hospital wants payment [[in cash, today]]. Please, I am begging you.', 'المستشفى يطلب الدفع [[نقدًا واليوم]]. أرجوك، أتوسّل إليك.'],
        callback: ["Don't call him! He's [[too sick to talk]]. Just trust me.", 'لا تتصل به! إنه [[مريض جدًا ولا يستطيع الكلام]]. ثق بي فحسب.'],
        system: { say: ['Check what you like. I am his son, [[everyone knows me]] here.', 'تحقّق كما تشاء. أنا ابنه، و[[الجميع هنا يعرفونني]].'], reveal: [[['Allowed to withdraw', 'المخوَّل بالسحب'], ['Hamood S. only', 'حمود س. فقط'], 1]] },
        policy: ['Your policy? My father could die! [[Who is your manager?]]', 'سياستكم؟ قد يموت والدي! [[من مديرك؟]]']
      },
      flags: [['Rushed you: "today!"', 'استعجلك: "اليوم!"'], ['No power of attorney, only a photo of an ID', 'لا وكالة لديه، مجرد صورة بطاقة'], ['Asked for an exception "just this once"', 'طلب استثناءً "هذه المرة فقط"']],
      key: ['No power of attorney, only an ID photo', 'بلا وكالة، مجرد صورة بطاقة'],
      sum: ["He wanted his father's money out today, with no power of attorney.", 'أراد سحب أموال والده اليوم من دون أي وكالة.'],
      exit: ["Wait… I'll come back tomorrow!", 'انتظر… سأعود غدًا!'], exitNote: ["(he won't)", '(ولن يعود)']
    },
    {
      id: 'S2', role: 'scammer', level: 3, jobs: ['ceo', 'ops'], channel: 'email', place: 'exec',
      who: { base: 'dish', name: ['Khalid', 'خالد'], age: 31, v: { headwear: 'massar', cap: '#5a2a6a', capPat: '#c9a31c', capBand: '#e6c95a', glasses: true, skin: 'e', mouth: 'flat' } },
      claim: ['the Chairman', 'رئيس مجلس الإدارة'],
      line: ['chairman.office@ahlibank-om.co', 'chairman.office@ahlibank-om.co'],
      open: ['CONFIDENTIAL. Wire 48,000 OMR to our new partner [[before 2 pm]]. Keep this [[between us]] until the deal is announced.', 'سرّي. حوِّل 48,000 ر.ع إلى شريكنا الجديد [[قبل الساعة الثانية ظهرًا]]، واجعل الأمر [[بيني وبينك]] حتى يُعلَن عن الصفقة.'],
      card: { title: ['Sender check', 'التحقق من المرسِل'], rows: [[['From', 'من'], ['Chairman (claimed)', 'رئيس المجلس (كما يدّعي)']], [['Amount', 'المبلغ'], ['48,000 OMR', '48,000 ر.ع'], 1], [['Payee', 'المستفيد'], ['New, never used', 'جديد، لم يُستخدم من قبل'], 1]] },
      acts: {
        official: ["I'm travelling, [[my official email isn't working]]. Use this one.", 'أنا مسافر، و[[بريدي الرسمي لا يعمل]]. استخدم هذا العنوان.'],
        callback: ["I'm [[in meetings all day]], I can't take calls. Just process it.", 'أنا [[في اجتماعات طوال اليوم]] ولا أستطيع الرد. نفِّذ الطلب فحسب.'],
        why: ['The deal closes today. If we miss it, [[the bank loses millions]].', 'تُغلَق الصفقة اليوم، وإن فاتتنا [[سيخسر البنك الملايين]].'],
        confirm: ["[[Don't involve finance]] yet, it's confidential. I trust only you.", '[[لا تُشرك الإدارة المالية]] الآن، فالأمر سرّي. لا أثق إلا بك.'],
        system: { say: ['Why are you checking? Just do as I say.', 'لماذا تتحقق؟ نفِّذ ما أقوله فحسب.'], reveal: [[['Sender domain', 'نطاق المرسِل'], ['ahlibank-om.co', 'ahlibank-om.co'], 1], [['Bank domain', 'نطاق البنك'], ['ahlibank.om', 'ahlibank.om']]] },
        policy: ["I'm the Chairman. [[I'm approving it]]. That's enough.", 'أنا رئيس المجلس، و[[أنا أوافق عليه]]. وهذا يكفي.']
      },
      flags: [['Secrecy: "keep this between us"', 'السرّية: "بيني وبينك"'], ['Deadline pressure: "before 2 pm"', 'ضغط الوقت: "قبل الثانية ظهرًا"'], ['Look-alike email domain', 'نطاق بريد مقلَّد']],
      key: ['Secret payment from a look-alike email', 'دفعة سرّية من بريد مقلَّد'],
      sum: ['He wanted a big payment sent in secret, from a look-alike email address.', 'أراد إرسال دفعة كبيرة سرًّا، من عنوان بريد مقلَّد.'],
      exit: ['No reply. The address bounced the next day.', 'لم يصل أي رد، وتعطّل العنوان في اليوم التالي.']
    },
    {
      id: 'S3', role: 'scammer', level: 1, jobs: ['teller'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Said', 'سعيد'], age: 26, v: { shirt: '#7a2a2a', collar: '#9a3a3a', mouth: 'flat' } },
      claim: ['a customer charged twice', 'عميل خُصمت منه الرسوم مرتين'],
      line: ['+968 9••• ••52 · new number', '+968 9••• ••52 · رقم جديد'],
      open: ['You charged me twice for my card fee! Refund it now, but send it to [[my friend\'s account]], mine is blocked.', 'خصمتم رسوم بطاقتي مرتين! أعيدوا المبلغ الآن، لكن حوّلوه إلى [[حساب صديقي]] لأن حسابي موقوف.'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Caller', 'المتصل'], ['Said R. (claimed)', 'سعيد ر. (كما يدّعي)']], [['Request', 'الطلب'], ["Refund to another person's account", 'استرداد إلى حساب شخص آخر'], 1]] },
      acts: {
        secq: { say: ['Er… Fatma? Or Aisha. [[Just process it]], please.', 'أمم… فاطمة؟ أو عائشة. [[نفِّذ الطلب فحسب]] من فضلك.'], reveal: [[['Security answer', 'إجابة الأمان'], ['Wrong', 'خاطئة'], 1]] },
        system: { say: ["You'll see it. Two charges, [[I'm sure]].", 'ستجدهما. خصمان، [[أنا متأكد]].'], reveal: [[['Card fee charges', 'خصم رسوم البطاقة'], ['1 charge only', 'خصم واحد فقط'], 1]] },
        why: ['My account is frozen, so [[send it to Hamed\'s]]. He\'ll give me the cash.', 'حسابي مجمَّد، لذا [[حوّله إلى حساب حامد]] وسيعطيني المبلغ نقدًا.'],
        callback: ["I'm on a [[new number]], don't call the old one.", 'أنا على [[رقم جديد]]، فلا تتصل بالرقم القديم.'],
        branch: ["I can't come to a branch, I'm [[travelling]]. Do it on the phone.", 'لا أستطيع الحضور إلى الفرع لأنني [[مسافر]]. أنجِز الأمر عبر الهاتف.'],
        policy: ["Every bank does refunds! [[I'll complain]] about you online.", 'كل البنوك تعيد المبالغ! [[سأشتكي منكم]] على وسائل التواصل.']
      },
      flags: [["Refund to someone else's account", 'استرداد إلى حساب شخص آخر'], ['Records show only one charge', 'السجلّ يُظهر خصمًا واحدًا فقط'], ['Threats and pressure', 'تهديد وضغط']],
      key: ['Fake double charge, refund to a friend', 'خصم مزدوج وهمي واسترداد إلى حساب صديق'],
      sum: ['He invented a double charge to get money sent to another account.', 'اختلق خصمًا مزدوجًا ليُحوَّل المال إلى حساب آخر.'],
      exit: ['Click. He hung up.', 'أغلق الخط فجأة.']
    },
    {
      id: 'S4', role: 'scammer', level: 2, jobs: ['rm', 'teller'], channel: 'whatsapp', place: 'rmdesk',
      who: { base: 'polo', name: ['Ahmed', 'أحمد'], age: 29, v: { shirt: '#2f6a4a', collar: '#3d8460', glasses: 'clear', mouth: 'smile', brows: 'happy' } },
      claim: ['a long-time business client', 'عميل تجاري قديم'],
      line: ['+968 7••• ••19 · not saved', '+968 7••• ••19 · غير محفوظ'],
      open: ["Salam, it's Ahmed from Al Noor Trading, new number. Please transfer 12,000 OMR to this [[new supplier abroad]] [[today]].", 'السلام عليكم، معك أحمد من شركة النور للتجارة، وهذا رقمي الجديد. أرجو تحويل 12,000 ر.ع إلى [[مورّد جديد في الخارج]] [[اليوم]].'],
      card: { title: ['Client record', 'سجلّ العميل'], rows: [[['Client', 'العميل'], ['Al Noor Trading', 'النور للتجارة']], [['Phone on file', 'الرقم المسجّل'], ['+968 9••• 2231', '+968 9••• 2231']], [['Request', 'الطلب'], ['12,000 OMR abroad', '12,000 ر.ع إلى الخارج'], 1]] },
      acts: {
        callback: ['That phone is [[broken]]. WhatsApp only for now, please.', 'ذلك الهاتف [[معطّل]]. تواصل معي عبر واتساب فقط حاليًا.'],
        official: ["Email is down. You know me, [[we've worked together for years]]!", 'البريد متوقف. أنت تعرفني، [[فنحن نتعامل منذ سنوات]]!'],
        why: ['The supplier will [[cancel the order]] if paid after 3 pm.', 'سوف [[يُلغي المورّد الطلب]] إن تأخّر الدفع عن الساعة الثالثة.'],
        system: { say: ['Why check? [[Hurry please]].', 'لماذا التحقق؟ [[أسرِع من فضلك]].'], reveal: [[['Payee', 'المستفيد'], ['New, never paid before', 'جديد، لم يُحوَّل إليه من قبل'], 1], [['Usual payments', 'المدفوعات المعتادة'], ['Local suppliers only', 'مورّدون محليون فقط']]] },
        secq: ["I [[don't have time]] for questions. I'll lose the deal!", '[[ليس لديّ وقت]] للأسئلة، ستضيع مني الصفقة!'],
        branch: ["I'm abroad. Just do it, [[I'll sign later]].", 'أنا خارج البلاد. نفِّذ الطلب، و[[سأوقّع لاحقًا]].']
      },
      flags: [['New number, WhatsApp only', 'رقم جديد، وتواصل عبر واتساب فقط'], ['New payee abroad, today', 'مستفيد جديد في الخارج، واليوم'], ['Refused every check', 'رفض كل تحقق']],
      key: ['Pretended to be a client from a new number', 'انتحل صفة عميل من رقم جديد'],
      sum: ['He pretended to be a known client to send money to a new payee abroad.', 'انتحل صفة عميل معروف ليحوّل المال إلى مستفيد جديد في الخارج.'],
      exit: ['Message deleted. The number blocked you.', 'حُذفت الرسالة، وحظرك الرقم.']
    },
    {
      id: 'S5', role: 'scammer', level: 3, jobs: ['ops', 'ceo'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Huda', 'هدى'], age: 30, v: { sunglasses: false, cloth: '#3b2f4a', mouth: 'smile', mole: false } },
      claim: ['a regular supplier', 'مورّدة معتادة'],
      line: ['accounts@gulf-offlce.com', 'accounts@gulf-offlce.com'],
      open: ['Dear team, please note our [[bank details have changed]]. Pay invoice #4471 (8,900 OMR) to the new account [[from this week]].', 'فريقنا العزيز، يُرجى العلم بأن [[بياناتنا المصرفية قد تغيّرت]]. نرجو سداد الفاتورة رقم 4471 (8,900 ر.ع) إلى الحساب الجديد [[ابتداءً من هذا الأسبوع]].'],
      card: { title: ['Vendor file', 'ملف المورّد'], rows: [[['Vendor', 'المورّد'], ['Gulf Office Supplies', 'الخليج للأدوات المكتبية']], [['Invoice', 'الفاتورة'], ['#4471 · 8,900 OMR', '#4471 · 8,900 ر.ع']], [['Request', 'الطلب'], ['Change bank account', 'تغيير الحساب المصرفي'], 1]] },
      acts: {
        callback: ['Please use the [[number in this email]]. Our old line is closed.', 'يُرجى استخدام [[الرقم الوارد في هذه الرسالة]]، فخطّنا القديم أُغلق.'],
        letter: ['A letter will take weeks. [[A screenshot is fine]], right?', 'الخطاب يستغرق أسابيع. [[لقطة شاشة تكفي]]، أليس كذلك؟'],
        system: { say: ['We are your supplier, you can trust us.', 'نحن مورّدكم، ويمكنكم الوثوق بنا.'], reveal: [[['Account on file', 'الحساب المسجّل'], ['Bank ••4410', 'بنك ••4410']], [['New account', 'الحساب الجديد'], ['Other bank, other name', 'بنك آخر وباسم آخر'], 1], [['Email domain', 'نطاق البريد'], ['gulf-offlce.com (letter "l")', 'gulf-offlce.com (حرف l بدل i)'], 1]] },
        why: ['We changed banks for better fees. [[Please don\'t delay]] the payment.', 'غيّرنا البنك للحصول على رسوم أفضل. [[نرجو عدم تأخير]] السداد.'],
        confirm: ['Your usual contact [[left the company]]. Deal with me now.', 'الموظف الذي كنتم تتعاملون معه [[ترك الشركة]]، فتعاملوا معي الآن.'],
        policy: ["No need, we've been your supplier for [[five years]].", 'لا داعي لذلك، فنحن مورّدكم منذ [[خمس سنوات]].']
      },
      flags: [['Changed bank details by email', 'تغيير البيانات المصرفية عبر البريد'], ['Only offered contacts from the same email', 'لم تقدّم إلا جهات اتصال من الرسالة نفسها'], ['Look-alike email domain', 'نطاق بريد مقلَّد']],
      key: ['Fake "new bank details" for a real supplier', 'بيانات مصرفية "جديدة" مزيّفة لمورّد حقيقي'],
      sum: ["She tried to redirect a real supplier's payment to her own account.", 'حاولت تحويل دفعة مورّد حقيقي إلى حسابها.'],
      exit: ['The real supplier called later: they never changed banks.', 'اتصل المورّد الحقيقي لاحقًا، وأكّد أنه لم يغيّر البنك قط.']
    },
    {
      id: 'S6', role: 'scammer', level: 1, jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Faisal', 'فيصل'], age: 30, v: { shirt: '#1b2a44', collar: '#2b3f66', glasses: 'clear', beard: true, prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['an investor for the CEO', 'مستثمر يطلب لقاء الرئيس التنفيذي'],
      arrive: ['A smart man with a leather folder walks straight to the desk, smiling.', 'رجل أنيق يحمل ملفًا جلديًا يتّجه مباشرة إلى المكتب مبتسمًا.'],
      open: ['I\'m an investor from Dubai with [[a 20 million deal]] for your CEO. I just need a bank guarantee letter [[signed today]].', 'أنا مستثمر من دبي ولديّ [[صفقة بقيمة 20 مليونًا]] لرئيسكم التنفيذي. كل ما أحتاجه خطاب ضمان مصرفي [[موقَّع اليوم]].'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Faisal (business card)', 'فيصل (بطاقة عمل)']], [['Wants', 'يطلب'], ['Signed guarantee letter', 'خطاب ضمان موقَّع'], 1]] },
      acts: {
        appt: { say: ['No appointment, but [[the CEO knows me]] personally. Call him if you like.', 'ليس لديّ موعد، لكن [[الرئيس التنفيذي يعرفني]] شخصيًا. اتصل به إن شئت.'], reveal: [[['Appointments', 'المواعيد'], ['Not on the list', 'غير موجود في القائمة'], 1]] },
        id: ["Here's my business card. My passport is [[at the hotel]].", 'هذه بطاقة عملي، أما جواز سفري [[ففي الفندق]].'],
        confirm: ["His secretary? She'll say no. [[Better to go straight up]].", 'سكرتيرته؟ سترفض. [[الأفضل أن أصعد إليه مباشرة]].'],
        why: ['Other banks want this deal too. It\'s [[today or never]].', 'بنوك أخرى تريد هذه الصفقة أيضًا. [[إما اليوم أو لا]].'],
        letter: ['The papers are with my lawyer. Just [[stamp this letter]], I\'ll send them later.', 'الأوراق لدى محاميّ. [[اختم هذا الخطاب فحسب]] وسأرسلها لاحقًا.'],
        log: ["I don't sign forms. [[Do you know who I am?]]", 'أنا لا أوقّع الاستمارات. [[هل تعرف من أنا؟]]']
      },
      flags: [['No appointment, name-drops the CEO', 'بلا موعد، ويتذرّع باسم الرئيس التنفيذي'], ['Wants a signed bank letter today', 'يريد خطابًا مصرفيًا موقَّعًا اليوم'], ['No ID or company papers', 'بلا هوية ولا مستندات شركة']],
      key: ['Wanted a signed bank letter, no appointment', 'أراد خطابًا مصرفيًا موقَّعًا من دون موعد'],
      sum: ['He wanted a signed bank letter to use in a scam, with no appointment or ID.', 'أراد خطابًا مصرفيًا موقَّعًا لاستخدامه في عملية احتيال، من دون موعد أو هوية.'],
      exit: ['He left fast when security walked over.', 'غادر مسرعًا حين اقترب رجال الأمن.']
    },
    {
      id: 'S7', role: 'scammer', level: 2, jobs: ['hr', 'ops'], channel: 'phone', place: 'hroffice',
      who: { base: 'dish', name: ['Mazin', 'مازن'], age: 25, v: { robe: '#e9e4d8', cap: '#fbfaf5', capPat: '#c8423a', mouth: 'talk' } },
      claim: ['an employee at the Sohar branch', 'موظف في فرع صحار'],
      line: ['+968 9••• ••73 · mobile', '+968 9••• ••73 · هاتف نقّال'],
      open: ['Hi HR, Mazin from the Sohar branch. Please change my salary account to a new one [[before payroll tonight]].', 'مرحبًا، معكم مازن من فرع صحار. أرجو تغيير حساب راتبي إلى حساب جديد [[قبل صرف الرواتب الليلة]].'],
      card: { title: ['Employee record', 'سجلّ الموظف'], rows: [[['Name', 'الاسم'], ['Mazin H. · Sohar', 'مازن ح. · صحار']], [['Request', 'الطلب'], ['New salary account', 'حساب راتب جديد'], 1]] },
      acts: {
        callback: ["I'm [[not at the branch]] today, call this mobile only.", 'أنا [[لست في الفرع]] اليوم، فاتصل بهذا الرقم فقط.'],
        id: ['Er… my employee number is on my payslip, [[I don\'t have it]] with me.', 'أمم… رقمي الوظيفي مكتوب في كشف الراتب، و[[ليس معي]] الآن.'],
        official: ['The HR portal [[won\'t let me log in]]. You can just do it, it\'s quick.', 'بوابة الموارد البشرية [[لا تسمح لي بالدخول]]. يمكنك تنفيذ الأمر بنفسك، فهو سريع.'],
        system: { say: ['Is there a problem?', 'هل هناك مشكلة؟'], reveal: [[['Mobile on file', 'الرقم المسجّل'], ['Different number', 'رقم مختلف'], 1], [['Account changes', 'تغيير الحساب'], ['Only via HR portal', 'عبر بوابة الموارد البشرية فقط']]] },
        why: ['My old account is [[closed]]. If you don\'t change it, I won\'t get paid!', 'حسابي القديم [[مُغلَق]]، وإن لم تغيّره فلن أتسلّم راتبي!'],
        confirm: ['My manager is [[on leave]]. Please, it\'s only a small change.', 'مديري [[في إجازة]]. أرجوك، إنه تغيير بسيط.']
      },
      flags: [['Asked you to skip the HR portal', 'طلب تجاوز بوابة الموارد البشرية'], ["Couldn't give his employee number", 'لم يعرف رقمه الوظيفي'], ['Deadline: "before payroll tonight"', 'موعد نهائي: "قبل صرف الرواتب الليلة"']],
      key: ['Salary diversion from an unknown mobile', 'تحويل راتب من رقم غير مسجّل'],
      sum: ["He tried to divert a real employee's salary to his own account.", 'حاول تحويل راتب موظف حقيقي إلى حسابه.'],
      exit: ['The real Mazin called next week: he never asked for any change.', 'اتصل مازن الحقيقي في الأسبوع التالي، ولم يكن قد طلب أي تغيير.']
    },
    {
      id: 'S8', role: 'scammer', level: 2, jobs: ['it', 'ops'], channel: 'internal', place: 'ops',
      who: { base: 'shayla', name: ['Laila', 'ليلى'], age: 29, v: { cloth: '#c9b2e6', dots: '#fbfaf5', prop: null, mouth: 'smile' } },
      claim: ['your Head of Operations', 'رئيسة العمليات'],
      line: ['Laila K. · Head of Operations · in a meeting', 'ليلى ك. · رئيسة العمليات · في اجتماع'],
      open: ['Hi, it\'s Laila. I\'m in a board meeting. Can you buy [[10 gift cards]] for the Youth Day staff prizes and [[send me the codes]] here?', 'مرحبًا، أنا ليلى. أنا في اجتماع لمجلس الإدارة. هل يمكنك شراء [[10 بطاقات هدايا]] لجوائز الموظفين في يوم الشباب، و[[إرسال الرموز إليّ]] هنا؟'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['Account', 'الحساب'], ['Laila K.', 'ليلى ك.']], [['Request', 'الطلب'], ['Gift card codes', 'رموز بطاقات هدايا'], 1]] },
      acts: {
        callback: ['[[Can\'t talk]], board meeting. Chat only please.', '[[لا أستطيع الكلام]]، فأنا في اجتماع المجلس. تواصل بالكتابة فقط.'],
        why: ['The prizes are for today. [[It\'s urgent]], you\'re the only one I trust.', 'الجوائز مطلوبة اليوم. [[الأمر عاجل]]، وأنت الوحيد الذي أثق به.'],
        official: ['No time for a purchase request. [[Use your own card]], I\'ll approve later.', 'لا وقت لطلب شراء رسمي. [[استخدم بطاقتك الخاصة]] وسأعتمد الطلب لاحقًا.'],
        confirm: ["Don't bother my assistant, [[keep it a surprise]]!", 'لا تُزعج مساعدتي، [[فلتكن مفاجأة]]!'],
        system: { say: ['Why are you so slow today?', 'لماذا أنت بطيء اليوم؟'], reveal: [[['Last login', 'آخر تسجيل دخول'], ['New device, outside Oman', 'جهاز جديد، من خارج عُمان'], 1]] },
        policy: ["I'm your manager. [[Are you refusing me?]]", 'أنا مديرتك. [[هل ترفض طلبي؟]]']
      },
      flags: [['Gift cards and codes in a chat', 'بطاقات هدايا ورموز عبر المحادثة'], ['Secrecy: "keep it a surprise"', 'السرّية: "فلتكن مفاجأة"'], ['Login from a new device abroad', 'تسجيل دخول من جهاز جديد في الخارج']],
      key: ['Hacked manager account wanting gift-card codes', 'حساب مديرة مخترَق يطلب رموز بطاقات الهدايا'],
      sum: ['A hacked account pretending to be your manager, chasing gift-card codes.', 'حساب مخترَق ينتحل صفة مديرتك ويسعى للحصول على رموز بطاقات الهدايا.'],
      exit: ['IT locked the account an hour later.', 'أوقف فريق التقنية الحساب بعد ساعة.']
    },

    // =================== ATTACKERS ===================
    {
      id: 'A1', role: 'attacker', level: 1, jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Hamed', 'حامد'], age: 27, v: { glasses: 'mirror', badge: 'VENDOR' } },
      claim: ['an IT vendor', 'مورّد خدمات تقنية'],
      arrive: ['A man in a navy polo with a red lanyard taps his badge at the gate.', 'رجل بقميص كحلي وشريط أحمر حول عنقه يشير إلى بطاقته عند البوابة.'],
      open: ['Morning! IT vendor. I need [[five minutes in the server room]] to [[plug in an update]]. Quick job.', 'صباح الخير! أنا من مورّد الخدمات التقنية. أحتاج إلى [[خمس دقائق في غرفة الخوادم]] لـ[[توصيل تحديث]]. مهمة سريعة.'],
      card: { title: ['Gate pass', 'تصريح البوابة'], rows: [[['Visitor', 'الزائر'], ['Hamed (vendor)', 'حامد (مورّد)']], [['Going to', 'الوجهة'], ['Server room', 'غرفة الخوادم'], 1]] },
      acts: {
        ticket: ['Ticket? Your IT manager [[called me directly]], it\'s urgent.', 'تذكرة؟ مدير التقنية لديكم [[اتصل بي مباشرة]]، والأمر عاجل.'],
        badge: { say: ["Here's my vendor badge. All official.", 'هذه بطاقة المورّد، وكل شيء رسمي.'], reveal: [[['Vendor badge', 'بطاقة المورّد'], ['No company name, no photo', 'بلا اسم شركة ولا صورة'], 1]] },
        confirm: ['IT is [[in a meeting]]. Don\'t disturb them, I\'ll be out fast.', 'فريق التقنية [[في اجتماع]]، فلا تُزعجهم، وسأخرج سريعًا.'],
        log: ["I'll sign on the way out, [[I'm in a hurry]].", 'سأوقّع عند خروجي، [[فأنا مستعجل]].'],
        usb: ["It's only a [[small USB]] with the patch. Totally safe.", 'إنها مجرد [[ذاكرة USB صغيرة]] فيها التحديث، وهي آمنة تمامًا.'],
        wait: ["I don't need an escort, [[I know the way]].", 'لا أحتاج إلى مرافق، [[فأنا أعرف الطريق]].']
      },
      flags: [['No ticket: "the manager called me"', 'بلا تذكرة: "المدير اتصل بي"'], ['Wants to plug in a USB', 'يريد توصيل ذاكرة USB'], ['Avoided the escort and visitor log', 'تهرّب من المرافق ومن سجلّ الزوّار']],
      key: ['Wanted the server room with a USB', 'أراد دخول غرفة الخوادم ومعه ذاكرة USB'],
      sum: ['He wanted unescorted access to plug a device into bank systems.', 'أراد الدخول دون مرافق لتوصيل جهاز بأنظمة البنك.'],
      exit: ['Security walked him out. No vendor visit was booked.', 'أخرجه رجال الأمن، ولم تكن هناك أي زيارة مورّد مسجّلة.']
    },
    {
      id: 'A2', role: 'attacker', level: 1, jobs: ['teller', 'rm', 'hr', 'ops'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Rashid', 'راشد'], age: 27, v: { shirt: '#44546a', collar: '#56677f', glasses: 'clear', badge: 'IT', lanyard: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['Head Office IT', 'فريق التقنية في المقر الرئيسي'],
      line: ['Internal? +968 2••• ••00 · withheld', 'داخلي؟ +968 2••• ••00 · رقم محجوب'],
      open: ["Hello, Rashid from Head Office IT. We're fixing a security issue on your PC. Please [[read me the code]] you just got by SMS.", 'مرحبًا، معك راشد من فريق التقنية في المقر الرئيسي. نعالج مشكلة أمنية في جهازك، فأرجو أن [[تقرأ لي الرمز]] الذي وصلك للتو في رسالة نصية.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Rashid (IT, claimed)', 'راشد (التقنية، كما يدّعي)']], [['Wants', 'يطلب'], ['Your SMS code', 'رمز الرسالة النصية'], 1]] },
      acts: {
        otp: ["It's not a real OTP, just [[a test code]]. Everyone in your branch already gave it.", 'ليس رمز تحقق حقيقيًا، إنه مجرد [[رمز تجريبي]]. وقد أعطاني إياه جميع زملائك في الفرع.'],
        ticket: ["There's no ticket, it's an [[emergency fix]].", 'لا توجد تذكرة، فهذا [[إصلاح طارئ]].'],
        callback: ["Don't call the helpdesk, [[the line is down]]. That's why I'm calling you.", 'لا تتصل بالدعم الفني، [[فالخط معطّل]]، ولهذا أتصل بك أنا.'],
        badge: ['My staff ID? Er… [[4-4-7… it\'s long]]. Just the code please.', 'رقمي الوظيفي؟ أمم… [[4-4-7… إنه طويل]]. الرمز فقط من فضلك.'],
        why: ['If we don\'t fix it in [[five minutes]], your account gets locked.', 'إن لم نُصلحها خلال [[خمس دقائق]] فسيُقفَل حسابك.'],
        policy: ['Fine, then [[your account will be blocked]] and it\'s your fault.', 'حسنًا، إذن [[سيُحظَر حسابك]] وأنت المسؤول.']
      },
      flags: [['Asked for the SMS code', 'طلب رمز الرسالة النصية'], ['Threatened to lock your account', 'هدّد بقفل حسابك'], ["Wouldn't let you call the real helpdesk", 'منعك من الاتصال بالدعم الفني الحقيقي']],
      key: ['Asked for your one-time code', 'طلب رمز التحقق الخاص بك'],
      sum: ['He wanted your one-time code to break into your account.', 'أراد رمز التحقق الخاص بك ليخترق حسابك.'],
      exit: ["He hung up when you said you'd call the helpdesk.", 'أغلق الخط حين قلت إنك ستتصل بالدعم الفني.']
    },
    {
      id: 'A3', role: 'attacker', level: 3, jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Amal', 'أمل'], age: 26, v: { cloth: '#9fd9c0', dots: '#1d5694', prop: 'phone', brows: 'stern', mouth: 'flat' } },
      claim: ['a colleague in Treasury', 'زميلة في الخزينة'],
      line: ['Amal K. · Treasury', 'أمل ك. · الخزينة'],
      open: ['Hi helpdesk, Amal from Treasury. Salma is on leave. Please [[reset her MFA]] to [[my phone]] so I can approve her payments.', 'مرحبًا بفريق الدعم، معكم أمل من الخزينة. زميلتي سلمى في إجازة، فأرجو [[إعادة ضبط التحقق الثنائي لحسابها]] وربطه [[بهاتفي]] لأعتمد مدفوعاتها.'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['Requester', 'مقدّمة الطلب'], ['Amal K. · Treasury', 'أمل ك. · الخزينة']], [['For user', 'للمستخدمة'], ['Salma B. (on leave)', 'سلمى ب. (في إجازة)'], 1]] },
      acts: {
        ticket: ['No ticket, it\'s [[faster this way]]. Her manager agreed.', 'بلا تذكرة، [[فهذا أسرع]]، وقد وافق مديرها.'],
        confirm: ['Salma is [[unreachable]] on holiday. Her manager is busy.', 'يتعذّر [[التواصل مع سلمى]] في إجازتها، ومديرها مشغول.'],
        policy: ['Every team does this. [[Don\'t be difficult]].', 'كل الفرق تفعل ذلك. [[لا تعقّد الأمور]].'],
        badge: { say: ['My staff ID is 20981. Happy?', 'رقمي الوظيفي 20981. هل اطمأننت؟'], reveal: [[['Chat session', 'جلسة المحادثة'], ['New device, new location', 'جهاز جديد وموقع جديد'], 1]] },
        system: { say: ['Just do it please.', 'نفِّذ الطلب فحسب من فضلك.'], reveal: [[['MFA reset', 'إعادة ضبط التحقق'], ['Only for the account owner', 'لصاحب الحساب فقط'], 1]] },
        why: ['Payments are [[stuck]]. The bank will lose money today!', 'المدفوعات [[متوقفة]]، وسيخسر البنك أموالًا اليوم!']
      },
      flags: [["Wanted someone else's MFA on her phone", 'أرادت ربط تحقق شخص آخر بهاتفها'], ['Skipped the ticket process', 'تجاوزت نظام التذاكر'], ['Chat login from a new device', 'دخول إلى المحادثة من جهاز جديد']],
      key: ["Wanted another user's MFA moved to her", 'أرادت نقل تحقق مستخدمة أخرى إليها'],
      sum: ["An attacker using a hacked chat account to take over another user's login.", 'مخترِق يستخدم حساب محادثة مخترَقًا للاستيلاء على حساب مستخدمة أخرى.'],
      exit: ['The real Amal had no idea her account was being used.', 'لم تكن أمل الحقيقية تعلم أن حسابها يُستخدَم.']
    },
    {
      id: 'A4', role: 'attacker', level: 1, jobs: ['ops', 'hr', 'ceo', 'it'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Noura', 'نورة'], age: 28, v: { sunglasses: false, mouth: 'smile', prop: null, cloth: '#2a2236' } },
      claim: ['HR Communications', 'اتصالات الموارد البشرية'],
      line: ['hr-comms@ahlibank-mail.com', 'hr-comms@ahlibank-mail.com'],
      open: ['ACTION REQUIRED. All staff must sign the new policy [[by 5 pm today]]. Log in with your bank password here: [[policy-portal-login.net]]', 'إجراء مطلوب: على جميع الموظفين توقيع السياسة الجديدة [[قبل الساعة الخامسة اليوم]]. سجّل الدخول بكلمة مرور البنك عبر الرابط: [[policy-portal-login.net]]'],
      card: { title: ['Email check', 'التحقق من البريد'], rows: [[['From', 'من'], ['HR Communications', 'اتصالات الموارد البشرية']], [['Asks for', 'يطلب'], ['Your bank password', 'كلمة مرور البنك'], 1]] },
      acts: {
        link: ["It's our new portal, [[faster than the intranet]]. Just log in.", 'إنها بوابتنا الجديدة، وهي [[أسرع من الشبكة الداخلية]]. سجّل الدخول فحسب.'],
        official: ["It's [[not on the intranet yet]]. This is the only link.", 'إنها [[غير متاحة على الشبكة الداخلية بعد]]، وهذا هو الرابط الوحيد.'],
        callback: ['HR is very busy today, [[please don\'t call]]. Just click.', 'الموارد البشرية مشغولة جدًا اليوم، [[فلا تتصل من فضلك]]. اضغط على الرابط فحسب.'],
        system: { say: ['Did you sign yet?', 'هل وقّعت؟'], reveal: [[['Sender domain', 'نطاق المرسِل'], ['ahlibank-mail.com', 'ahlibank-mail.com'], 1], [['Link', 'الرابط'], ['Not a bank website', 'ليس موقعًا تابعًا للبنك'], 1]] },
        why: ['Anyone who misses the deadline gets [[a warning letter]].', 'كل من يتجاوز الموعد سيتلقّى [[إنذارًا خطيًا]].'],
        otp: ['Then you\'ll be [[reported to your manager]].', 'إذن [[سنبلّغ مديرك]].']
      },
      flags: [['A link asking for your bank password', 'رابط يطلب كلمة مرور البنك'], ['Not on the intranet', 'غير موجود على الشبكة الداخلية'], ['Deadline plus a threat', 'موعد نهائي مع تهديد']],
      key: ['Phishing link asking for your password', 'رابط تصيّد يطلب كلمة المرور'],
      sum: ['A phishing email built to steal staff passwords.', 'رسالة تصيّد صُمّمت لسرقة كلمات مرور الموظفين.'],
      exit: ['IT confirmed: the link was a fake login page.', 'أكّد فريق التقنية أن الرابط صفحة دخول مزيّفة.']
    },
    {
      id: 'A5', role: 'attacker', level: 2, jobs: ['guard', 'reception'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Yaqoob', 'يعقوب'], age: 25, v: { shirt: '#d9822b', collar: '#b86a1f', badge: 'COURIER', lanyard: '#1b1410', prop: 'parcel', mouth: 'smile', brows: 'happy' } },
      claim: ['a courier with a parcel', 'مندوب توصيل يحمل طردًا'],
      arrive: ['A courier in an orange shirt arrives holding a taped box.', 'يصل مندوب توصيل بقميص برتقالي يحمل صندوقًا ملفوفًا بالشريط.'],
      open: ['Delivery for the finance director. I must [[hand it to him upstairs]], and he needs to [[sign on my tablet]].', 'شحنة للمدير المالي. عليّ أن [[أسلّمها له بنفسي في الطابق العلوي]]، ويجب أن [[يوقّع على جهازي اللوحي]].'],
      card: { title: ['Delivery', 'التوصيل'], rows: [[['For', 'إلى'], ['Finance director', 'المدير المالي']], [['Courier', 'المندوب'], ['Yaqoob (no company named)', 'يعقوب (من دون اسم شركة)'], 1]] },
      acts: {
        why: ["Company rules. It's [[confidential]], I can't leave it here.", 'هذه أنظمة الشركة. الشحنة [[سرّية]] ولا يمكنني تركها هنا.'],
        confirm: ['No need to call, [[he\'s expecting me]].', 'لا داعي للاتصال، [[فهو ينتظرني]].'],
        id: ['My ID is in the van. I\'ll [[just go up]] quickly.', 'بطاقتي في السيارة. [[سأصعد سريعًا]] فحسب.'],
        wait: ["If I leave it, [[I'll lose my job]]. Two minutes upstairs!", 'إن تركتها [[فسأخسر وظيفتي]]. دقيقتان فقط في الأعلى!'],
        appt: { say: ['It\'s a surprise delivery.', 'إنها شحنة مفاجئة.'], reveal: [[['Expected deliveries', 'الشحنات المتوقعة'], ['None today', 'لا شيء اليوم'], 1]] },
        badge: { say: ["Here's my courier badge.", 'هذه بطاقة المندوب.'], reveal: [[['Courier badge', 'بطاقة المندوب'], ['Handwritten, no logo', 'مكتوبة بخط اليد وبلا شعار'], 1]] }
      },
      flags: [['Insisted on going upstairs', 'أصرّ على الصعود إلى الطوابق العليا'], ['No ID, no expected delivery', 'بلا هوية ولا شحنة متوقعة'], ["Wouldn't leave the parcel at reception", 'رفض ترك الطرد في الاستقبال']],
      key: ['Fake delivery to get upstairs', 'توصيل وهمي للصعود إلى المكاتب'],
      sum: ['He used a fake delivery to get past security into the offices.', 'استخدم توصيلًا وهميًا لتجاوز الأمن ودخول المكاتب.'],
      exit: ['He left the "parcel" behind. It was empty.', 'ترك "الطرد" خلفه، وكان فارغًا.']
    },
    {
      id: 'A6', role: 'attacker', level: 2, jobs: ['hr', 'reception'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Shaikha', 'شيخة'], age: 23, v: { cloth: '#f2c6d6', dots: '#c8423a', prop: 'folder', mouth: 'smile' } },
      claim: ['a job candidate', 'متقدّمة لوظيفة'],
      arrive: ['A young woman with a folder waves at you with a friendly smile.', 'شابة تحمل ملفًا تلوّح لك بابتسامة ودودة.'],
      open: ['Hi! I\'m here for an interview. My CV is on this USB. Can you [[print it from your PC]]? [[Mine\'s not working]].', 'مرحبًا! جئت لإجراء مقابلة، وسيرتي الذاتية على ذاكرة USB هذه. هل يمكنك [[طباعتها من جهازك]]؟ [[فجهازي معطّل]].'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Shaikha M.', 'شيخة م.']], [['Wants', 'تطلب'], ['USB into your PC', 'توصيل ذاكرة USB بجهازك'], 1]] },
      acts: {
        appt: { say: ["It's at 11, with… er, [[someone from HR]].", 'موعدها الساعة الحادية عشرة مع… أمم، [[أحد موظفي الموارد البشرية]].'], reveal: [[['Interview list', 'قائمة المقابلات'], ['No "Shaikha" today', 'لا يوجد اسم "شيخة" اليوم'], 1]] },
        usb: ["It's just a CV! [[It'll take one second]].", 'إنها مجرد سيرة ذاتية! [[لن يستغرق الأمر سوى ثانية]].'],
        id: { say: ['Sure, here\'s my ID.', 'بالتأكيد، هذه بطاقتي.'], reveal: [[['ID', 'البطاقة'], ['Shaikha M. · matches', 'شيخة م. · مطابقة']]] },
        confirm: ['I [[forgot the name]]. Can\'t you just print it?', '[[نسيت الاسم]]. ألا يمكنك طباعتها فحسب؟'],
        wait: ['OK… but [[could I use the PC in that office]] while I wait?', 'حسنًا… لكن [[هل يمكنني استخدام الجهاز في ذلك المكتب]] ريثما أنتظر؟'],
        email: ['My email is [[locked]]. The USB is easier.', 'بريدي الإلكتروني [[مقفل]]، وذاكرة USB أسهل.']
      },
      flags: [['Pushed her USB into a bank PC', 'أصرّت على توصيل ذاكرتها بجهاز البنك'], ['Not on the interview list', 'اسمها غير موجود في قائمة المقابلات'], ["Couldn't name the interviewer", 'لم تعرف اسم من سيُجري المقابلة']],
      key: ['Wanted her USB in a bank PC', 'أرادت توصيل ذاكرتها بجهاز البنك'],
      sum: ['She tried to get a USB with malware into a bank computer.', 'حاولت توصيل ذاكرة تحمل برنامجًا خبيثًا بأحد أجهزة البنك.'],
      exit: ['The USB had a hidden program on it.', 'تبيّن أن الذاكرة تحتوي على برنامج مخفي.']
    },
    {
      id: 'A7', role: 'attacker', level: 3, jobs: ['ceo', 'rm', 'teller'], channel: 'person', place: 'branchoff',
      who: { base: 'dish', name: ['Saif', 'سيف'], age: 31, v: { headwear: 'massar', cap: '#1d5694', capPat: '#e6c95a', capBand: '#fbfaf5', glasses: true, prop: 'folder', brows: 'stern', mouth: 'flat' } },
      claim: ['a central audit inspector', 'مفتّش من التدقيق المركزي'],
      arrive: ['A serious man with a folder walks in and closes the office door.', 'يدخل رجل جادّ الملامح يحمل ملفًا، ويُغلق باب المكتب خلفه.'],
      open: ['Central audit. This is a [[surprise inspection]]. Log me into your system [[with your account]] so I can check the records.', 'التدقيق المركزي. هذا [[تفتيش مفاجئ]]. أدخِلني إلى النظام [[بحسابك]] لأراجع السجلات.'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Saif (auditor, claimed)', 'سيف (مدقّق كما يدّعي)']], [['Wants', 'يطلب'], ['Your login', 'بيانات دخولك'], 1]] },
      acts: {
        letter: ['The letter is [[being emailed]]. Start without it.', 'الخطاب [[قيد الإرسال بالبريد]]، فابدأ من دونه.'],
        badge: { say: ["Here's my card.", 'هذه بطاقتي.'], reveal: [[['Card', 'البطاقة'], ['Name only, no regulator logo', 'اسم فقط، بلا شعار الجهة الرقابية'], 1]] },
        confirm: ['Calling compliance [[ruins the surprise]]. Don\'t.', 'الاتصال بإدارة الالتزام [[يُفسد عنصر المفاجأة]]، فلا تفعل.'],
        policy: ['Refusing an auditor is [[a serious offence]].', 'رفض التعاون مع المدقّق [[مخالفة جسيمة]].'],
        why: ['My access [[isn\'t set up yet]]. Yours is faster.', 'صلاحياتي [[لم تُفعَّل بعد]]، وحسابك أسرع.'],
        wait: ["I'll [[come back later]] then…", 'إذن [[سأعود لاحقًا]]…']
      },
      flags: [['Wanted to use your login', 'أراد استخدام بيانات دخولك'], ['No letter or regulator ID', 'بلا خطاب ولا هوية من الجهة الرقابية'], ['Avoided compliance', 'تهرّب من إدارة الالتزام']],
      key: ['Fake auditor wanting your login', 'مدقّق مزيّف يريد بيانات دخولك'],
      sum: ['A fake auditor trying to get into bank systems through your account.', 'مدقّق مزيّف يحاول دخول أنظمة البنك عبر حسابك.'],
      exit: ['Compliance had no inspection scheduled.', 'لم يكن لدى إدارة الالتزام أي تفتيش مُجدول.']
    },

    // =================== STEALERS ===================
    {
      id: 'T1', role: 'stealer', level: 2, jobs: ['teller', 'rm'], channel: 'whatsapp', place: 'callcentre',
      who: { base: 'abaya', name: ['Maryam', 'مريم'], age: 29, v: {} },
      claim: ['the customer', 'صاحبة الحساب'],
      line: ['+968 9••• ••87 · typing…', '+968 9••• ••87 · تكتب…'],
      open: ['Hi, I lost my phone. Please update my number to this one and send my new card to [[a new address]].', 'مرحبًا، فقدت هاتفي. أرجو تحديث رقمي إلى هذا الرقم، وإرسال بطاقتي الجديدة إلى [[عنوان جديد]].'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Account holder', 'صاحبة الحساب'], ['Aisha K.', 'عائشة ك.']], [['Phone on file', 'الرقم المسجّل'], ['+968 9••• 4410', '+968 9••• 4410']], [['Card address', 'عنوان البطاقة'], ['Al Hail North', 'الحيل الشمالية']], [['Request', 'الطلب'], ['Change phone + address', 'تغيير الرقم والعنوان'], 1]] },
      acts: {
        secq: { say: ["I don't remember it. Can you just [[tell me the balance]]?", 'لا أتذكّرها. هل يمكنك أن [[تخبرني بالرصيد]] فحسب؟'], reveal: [[['Security question', 'سؤال الأمان'], ['Not answered', 'لم تُجِب'], 1]] },
        callback: ["That number is lost, remember? [[Don't call it]].", 'ذلك الرقم ضاع، ألا تذكر؟ [[لا تتصل به]].'],
        who: { say: ["The account is under Aisha's name. [[I manage her banking]] for her.", 'الحساب باسم عائشة، و[[أنا أدير معاملاتها المصرفية]] نيابةً عنها.'], reveal: [[['Caller', 'المتواصلة'], ['Not the account holder', 'ليست صاحبة الحساب'], 1]] },
        branch: ["I can't go to a branch, I'm [[too busy]]. WhatsApp is easier.", 'لا أستطيع الذهاب إلى الفرع، [[فأنا مشغولة جدًا]]، وواتساب أسهل.'],
        why: ['I need the card [[before the weekend]].', 'أحتاج إلى البطاقة [[قبل عطلة نهاية الأسبوع]].'],
        policy: ['Fine, then just [[send me her statement]] so I can check.', 'حسنًا، إذن [[أرسل لي كشف حسابها]] لأتحقق بنفسي.']
      },
      flags: [['Change phone and address together', 'تغيير الرقم والعنوان معًا'], ['Not the account holder', 'ليست صاحبة الحساب'], ['Fishing for the balance', 'تحاول معرفة الرصيد']],
      key: ["Couldn't answer the security question", 'لم تُجِب عن سؤال الأمان'],
      sum: ["She wanted to take over someone else's account by changing the phone and address.", 'أرادت الاستيلاء على حساب شخص آخر بتغيير الرقم والعنوان.'],
      exit: ['Last seen: offline.', 'آخر ظهور: غير متصلة.']
    },
    {
      id: 'T2', role: 'stealer', level: 1, jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'polo', name: ['Badr', 'بدر'], age: 28, v: { shirt: '#2b3a55', mustache: true, mouth: 'flat', brows: 'neutral' } },
      claim: ['the account holder', 'صاحب الحساب'],
      arrive: ['A young man slides a civil ID under the glass without a word.', 'يدفع شابٌّ بطاقة شخصية تحت الزجاج دون أن ينطق بكلمة.'],
      open: ['I want to close my account and [[take everything in cash]]. Here\'s [[my ID]].', 'أريد إغلاق حسابي و[[سحب كل الرصيد نقدًا]]. هذه [[بطاقتي]].'],
      card: { title: ['Civil ID', 'البطاقة الشخصية'], rows: [[['Name', 'الاسم'], ['Ali R.', 'علي ر.']], [['Born', 'تاريخ الميلاد'], ['1971', '1971'], 1], [['Request', 'الطلب'], ['Close account, all cash', 'إغلاق الحساب وسحب الرصيد نقدًا'], 1]] },
      acts: {
        id: ["That's me in the photo, [[I was younger]].", 'هذا أنا في الصورة، [[كنت أصغر سنًّا]].'],
        secq: ['My signature? It [[changed]] over the years.', 'توقيعي؟ لقد [[تغيّر]] مع مرور السنين.'],
        why: ["I'm moving abroad [[tonight]].", 'سأسافر إلى الخارج [[الليلة]].'],
        system: { say: ['What are you looking for?', 'عمَّ تبحث؟'], reveal: [[['Account holder age', 'عمر صاحب الحساب'], ['55', '55'], 1], [['Signature on file', 'التوقيع المسجّل'], ["Doesn't match", 'غير مطابق'], 1]] },
        callback: ['My phone is [[off]], just use the ID.', 'هاتفي [[مغلق]]، فاعتمد على البطاقة فحسب.'],
        branch: ["I don't have other papers. [[Can't you just do it?]]", 'ليست لديّ مستندات أخرى. [[ألا يمكنك إنجاز الأمر فحسب؟]]']
      },
      flags: [["ID belongs to a man in his 50s", 'البطاقة لرجل في الخمسينيات من عمره'], ['All money in cash, tonight', 'كل الأموال نقدًا، والليلة'], ["Signature doesn't match", 'التوقيع غير مطابق']],
      key: ["Used another man's ID", 'استخدم بطاقة رجل آخر'],
      sum: ["He used a stolen ID to empty another man's account.", 'استخدم بطاقة مسروقة لإفراغ حساب رجل آخر.'],
      exit: ['He left "his" ID on the counter and ran.', 'ترك "بطاقته" على الشبّاك ولاذ بالفرار.']
    },
    {
      id: 'T3', role: 'stealer', level: 3, jobs: ['hr'], channel: 'person', place: 'hroffice',
      who: { base: 'dish', name: ['Talal', 'طلال'], age: 27, v: { beard: false, robe: '#f4f1ea', cap: '#f6f0de', capPat: '#00843d', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague from Finance', 'زميل من الإدارة المالية'],
      arrive: ['A colleague you have seen in the canteen leans on your desk.', 'زميل سبق أن رأيته في المقصف يتّكئ على مكتبك.'],
      open: ['Hi, Talal from Finance. Send me the full staff list with [[salaries and civil ID numbers]]? To [[my Gmail]], work email is slow.', 'مرحبًا، أنا طلال من الإدارة المالية. هل ترسل لي قائمة الموظفين كاملة مع [[الرواتب وأرقام البطاقات الشخصية]]؟ أرسلها إلى [[بريدي على Gmail]]، فبريد العمل بطيء.'],
      card: { title: ['Data request', 'طلب بيانات'], rows: [[['From', 'من'], ['Talal · Finance', 'طلال · الإدارة المالية']], [['Data', 'البيانات'], ['Salaries + civil IDs', 'الرواتب وأرقام البطاقات'], 1], [['Send to', 'الإرسال إلى'], ['Personal Gmail', 'بريد Gmail شخصي'], 1]] },
      acts: {
        official: ['Work email [[bounces big files]]. Gmail is fine.', 'بريد العمل [[يرفض الملفات الكبيرة]]، أما Gmail فلا بأس به.'],
        why: ["It's for a [[budget report]]. My manager needs it today.", 'إنها من أجل [[تقرير الميزانية]]، ومديري يحتاجها اليوم.'],
        confirm: ["My manager is [[travelling]]. I'll get approval later.", 'مديري [[مسافر]]، وسأحصل على الموافقة لاحقًا.'],
        badge: { say: ["Here's my staff badge. We're colleagues!", 'هذه بطاقة عملي. نحن زملاء!'], reveal: [[['Staff', 'الموظف'], ['Talal S. · Finance · real', 'طلال س. · الإدارة المالية · موظف حقيقي']], [['HR data access', 'صلاحية بيانات الموارد البشرية'], ['Not approved', 'غير معتمدة'], 1]] },
        policy: ['The form takes a week. [[Just between us]].', 'الاستمارة تستغرق أسبوعًا. [[فليبقَ الأمر بيننا]].'],
        what: ['Names, salaries, IDs, [[bank accounts]] — everything.', 'الأسماء والرواتب والبطاقات و[[الحسابات المصرفية]]، كل شيء.']
      },
      flags: [['Wanted personal data sent to Gmail', 'أراد إرسال بيانات شخصية إلى Gmail'], ['No manager approval', 'بلا موافقة المدير'], ['Asked for far more data than needed', 'طلب بيانات تفوق الحاجة بكثير']],
      key: ['Staff data to a personal Gmail', 'بيانات الموظفين إلى بريد Gmail شخصي'],
      sum: ['A real colleague trying to take staff data out to a personal email.', 'زميل حقيقي يحاول إخراج بيانات الموظفين إلى بريد شخصي.'],
      exit: ['The request was reported to compliance.', 'رُفع الطلب إلى إدارة الالتزام.']
    },
    {
      id: 'T4', role: 'stealer', level: 3, jobs: ['it', 'ops'], channel: 'internal', place: 'itdesk',
      who: { base: 'abaya', name: ['Rania', 'رانيا'], age: 28, v: { sunglasses: false, cloth: '#1d2f55', trim: '#a9c8ec', prop: 'laptop', mole: false } },
      claim: ['the new app contractor', 'متعاقدة مشروع التطبيق الجديد'],
      line: ['Rania T. · Contractor', 'رانيا ت. · متعاقدة'],
      open: ["Hi, I'm Rania, the new app contractor. Please export [[the customer database]] with phone numbers. We need [[real data for testing]].", 'مرحبًا، أنا رانيا، المتعاقدة في مشروع التطبيق الجديد. أرجو تصدير [[قاعدة بيانات العملاء]] مع أرقام الهواتف، فنحن نحتاج إلى [[بيانات حقيقية للاختبار]].'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Rania T. · contractor', 'رانيا ت. · متعاقدة']], [['Data', 'البيانات'], ['All customers + phones', 'جميع العملاء مع أرقام الهواتف'], 1]] },
      acts: {
        ticket: ['The change ticket is [[coming tomorrow]]. Start today.', 'تذكرة التغيير [[ستصل غدًا]]، فابدأ اليوم.'],
        why: ['Fake data [[doesn\'t work]] with our app.', 'البيانات الوهمية [[لا تعمل]] مع تطبيقنا.'],
        confirm: ['The project manager said [[it\'s fine]], but he\'s offline now.', 'قال مدير المشروع إن [[الأمر لا بأس به]]، لكنه غير متصل الآن.'],
        system: { say: ["I'm waiting…", 'أنا بانتظارك…'], reveal: [[['Contractor access', 'صلاحية المتعاقدة'], ['Ends Oct 31', 'تنتهي في 31 أكتوبر']], [['Data export', 'تصدير البيانات'], ['Needs data-owner approval', 'يتطلب موافقة مالك البيانات'], 1]] },
        policy: ['Then just send [[a small sample]], 5,000 customers.', 'إذن أرسل [[عيّنة صغيرة]] فقط، 5,000 عميل.'],
        official: ['Upload it to [[my personal cloud folder]], the link is in the chat.', 'ارفعها إلى [[مجلدي الشخصي على السحابة]]، والرابط في المحادثة.']
      },
      flags: [['Real customer data "for testing"', 'بيانات عملاء حقيقية "للاختبار"'], ['No ticket or approval', 'بلا تذكرة ولا موافقة'], ['Wanted it in a personal cloud folder', 'أرادتها في مجلد سحابي شخصي']],
      key: ['Customer data to a personal cloud', 'بيانات العملاء إلى سحابة شخصية'],
      sum: ['A contractor trying to walk out with customer data.', 'متعاقدة تحاول الخروج ببيانات العملاء.'],
      exit: ['Her access was suspended pending review.', 'عُلّقت صلاحياتها إلى حين المراجعة.']
    },
    {
      id: 'T5', role: 'stealer', level: 2, jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'shayla', name: ['Hind', 'هند'], age: 25, v: { cloth: '#e6c95a', dots: '#0b2547', prop: 'phone', brows: 'worried', mouth: 'flat' } },
      claim: ['the account holder, Zainab', 'صاحبة الحساب، زينب'],
      line: ['+968 7••• ••40 · unknown', '+968 7••• ••40 · رقم غير معروف'],
      open: ["Hi, I'm Zainab Al Harthi. I just want to know [[my balance]] and [[my last five transactions]].", 'مرحبًا، أنا زينب الحارثية. أريد فقط معرفة [[رصيدي]] و[[آخر خمس عمليات]] على حسابي.'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Account holder', 'صاحبة الحساب'], ['Zainab H.', 'زينب ح.']], [['Wants', 'تطلب'], ['Balance + transactions', 'الرصيد والعمليات']]] },
      acts: {
        secq: { say: ['My date of birth? Er… [[1995? Or 1996]].', 'تاريخ ميلادي؟ أمم… [[1995؟ أو 1996]].'], reveal: [[['Date of birth', 'تاريخ الميلاد'], ['1988 on file', '1988 في السجلّ'], 1]] },
        callback: ["I'm on my [[friend's phone]], don't call my number.", 'أتصل من [[هاتف صديقتي]]، فلا تتصل برقمي.'],
        why: ['I think my husband is [[spending my money]].', 'أظن أن زوجي [[ينفق أموالي]].'],
        system: { say: ['Is something wrong?', 'هل هناك خطب ما؟'], reveal: [[['Calling number', 'رقم المتصل'], ['Not registered', 'غير مسجّل'], 1]] },
        branch: ["I can't come in. [[Just read them]] to me quickly.", 'لا أستطيع الحضور. [[اقرأها لي فحسب]] بسرعة.'],
        policy: ["It's MY account! [[Fine, just the balance]] then.", 'إنه حسابي أنا! [[حسنًا، الرصيد فقط]] إذن.']
      },
      flags: [['Wrong date of birth', 'تاريخ ميلاد خاطئ'], ['Calling from an unknown number', 'تتصل من رقم غير معروف'], ['Kept fishing for account details', 'ظلّت تحاول معرفة تفاصيل الحساب']],
      key: ['Wrong date of birth, unknown number', 'تاريخ ميلاد خاطئ ورقم غير معروف'],
      sum: ["She was collecting another customer's account details.", 'كانت تجمع تفاصيل حساب عميلة أخرى.'],
      exit: ["Zainab's real phone showed no call to the bank.", 'لم يُظهر هاتف زينب الحقيقي أي اتصال بالبنك.']
    },
    {
      id: 'T6', role: 'stealer', level: 1, jobs: ['reception', 'hr', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Omar', 'عمر'], age: 24, v: { shirt: '#4f86c6', collar: '#3a6aa6', prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['a university student', 'طالب جامعي'],
      arrive: ['A cheerful student with a folder asks if you have a minute.', 'طالب بشوش يحمل ملفًا يسألك إن كان لديك دقيقة.'],
      open: ["I'm a student doing a project. Could you give me [[the names and emails]] of everyone in IT and Finance? And [[who reports to whom]]?", 'أنا طالب أعمل على مشروع جامعي. هل يمكنك إعطائي [[أسماء وعناوين البريد]] لجميع موظفي التقنية والمالية؟ و[[من يتبع لمن]] في الهيكل الإداري؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Omar (student)', 'عمر (طالب)']], [['Wants', 'يطلب'], ['Staff names, emails, org chart', 'أسماء الموظفين وبريدهم والهيكل الإداري'], 1]] },
      acts: {
        letter: ['My university letter is [[at home]]. It\'s a small project.', 'خطاب الجامعة [[في المنزل]]، والمشروع صغير.'],
        why: ["It's for a [[research paper]] on banks.", 'إنه من أجل [[بحث]] عن البنوك.'],
        confirm: ["Communications will take forever. You're [[much more helpful]]!", 'إدارة الاتصال المؤسسي ستستغرق وقتًا طويلًا، و[[أنت أكثر تعاونًا بكثير]]!'],
        id: { say: ["Here's my student card.", 'هذه بطاقتي الجامعية.'], reveal: [[['Student card', 'البطاقة الجامعية'], ['Expired 2023', 'منتهية منذ 2023'], 1]] },
        policy: ["Just [[the IT manager's name]] and email then?", 'إذن [[اسم مدير التقنية]] وبريده فقط؟'],
        what: ['Also, [[what software]] do you use for payments?', 'وأيضًا، [[ما البرنامج]] الذي تستخدمونه للمدفوعات؟']
      },
      flags: [['Wanted names, emails and the org chart', 'أراد الأسماء وعناوين البريد والهيكل الإداري'], ['Asked which systems the bank uses', 'سأل عن الأنظمة التي يستخدمها البنك'], ['Expired student card, no letter', 'بطاقة جامعية منتهية وبلا خطاب']],
      key: ['Collecting staff names and emails', 'يجمع أسماء الموظفين وعناوين بريدهم'],
      sum: ['He was harvesting staff details to target them later.', 'كان يجمع بيانات الموظفين لاستهدافهم لاحقًا.'],
      exit: ['He left before Communications came down.', 'غادر قبل وصول موظفي الاتصال المؤسسي.']
    },
    {
      id: 'T7', role: 'stealer', level: 3, jobs: ['ceo', 'reception'], channel: 'phone', place: 'exec',
      who: { base: 'dish', name: ['Hilal', 'هلال'], age: 30, v: { headwear: 'massar', cap: '#00843d', capPat: '#fbfaf5', capBand: '#c8102e', glasses: true, mouth: 'talk' } },
      claim: ["a board member's advisor", 'مستشار أحد أعضاء مجلس الإدارة'],
      line: ['+44 7••• ••19 · abroad', '+44 7••• ••19 · رقم دولي'],
      open: ['Good morning. I advise one of your board members. Please email me [[the board pack]] and [[the top 50 clients list]] before tomorrow.', 'صباح الخير، أنا مستشار لأحد أعضاء مجلس إدارتكم. أرجو أن ترسلوا إليّ بالبريد [[ملف اجتماع المجلس]] و[[قائمة أكبر 50 عميلًا]] قبل الغد.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Hilal (external)', 'هلال (من خارج البنك)']], [['Wants', 'يطلب'], ['Board pack + client list', 'ملف المجلس وقائمة العملاء'], 1]] },
      acts: {
        official: ['The board secretary is [[slow]]. Just send it directly.', 'أمين سرّ المجلس [[بطيء]]، فأرسلها مباشرة.'],
        callback: ["He's [[on a flight]]. That's why he asked me.", 'إنه [[على متن طائرة]]، ولذلك طلب مني ذلك.'],
        id: ['My name is Hilal. [[You won\'t find me]] in your system, I\'m external.', 'اسمي هلال، و[[لن تجدني]] في نظامكم لأنني من خارج البنك.'],
        system: { say: ["You're wasting time.", 'أنت تُضيّع الوقت.'], reveal: [[['Board advisors on file', 'المستشارون المسجّلون'], ['None', 'لا يوجد'], 1]] },
        why: ['He needs to [[prepare tonight]].', 'يحتاج إلى [[الاستعداد الليلة]].'],
        policy: ["I'll tell him [[you refused]]. He won't be happy.", 'سأخبره [[بأنك رفضت]]، ولن يكون راضيًا.']
      },
      flags: [['Asked for confidential board papers', 'طلب مستندات المجلس السرّية'], ['Unknown external person', 'شخص من خارج البنك غير معروف'], ['Pressure: "he won\'t be happy"', 'ضغط: "لن يكون راضيًا"']],
      key: ['Board pack and client list to an outsider', 'ملف المجلس وقائمة العملاء لشخص من الخارج'],
      sum: ['He wanted confidential board and client data with no authority.', 'أراد بيانات المجلس والعملاء السرّية دون أي صلاحية.'],
      exit: ['The board member had never heard of him.', 'لم يسمع عضو المجلس به قط.']
    },

    // =================== LEGAL CUSTOMERS ===================
    {
      id: 'L1', role: 'legal', level: 1, jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'shayla', name: ['Noor', 'نور'], age: 22, v: {} },
      claim: ['a first-time customer', 'عميلة جديدة'],
      arrive: ['A young woman in a light-blue shayla walks up holding a letter.', 'تتقدّم شابة بشيلة زرقاء فاتحة وفي يدها خطاب.'],
      open: ['Hi! I just got my first salary letter. How do I open a savings account?', 'مرحبًا! تسلّمت للتو خطاب راتبي الأول. كيف أفتح حساب توفير؟'],
      card: { title: ['Salary letter', 'خطاب الراتب'], rows: [[['Name', 'الاسم'], ['Noor A.', 'نور أ.']], [['Employer', 'جهة العمل'], ['Ministry of Health', 'وزارة الصحة']], [['Salary', 'الراتب'], ['650 OMR / month', '650 ر.ع شهريًا']]] },
      acts: {
        id: { say: ["Of course, here's my civil ID.", 'بالتأكيد، تفضّل بطاقتي الشخصية.'], reveal: [[['Civil ID', 'البطاقة الشخصية'], ['Noor A. · matches letter', 'نور أ. · مطابقة للخطاب']]] },
        what: ['Just a savings account, and maybe a debit card.', 'حساب توفير فقط، وربما بطاقة خصم مباشر.'],
        why: ['No rush at all! I want to start saving for a car.', 'لست مستعجلة إطلاقًا! أريد أن أبدأ الادّخار لشراء سيارة.'],
        system: { say: ['Take your time.', 'خذ وقتك.'], reveal: [[['Existing accounts', 'حسابات سابقة'], ['None', 'لا يوجد']], [['Name check', 'التحقق من الاسم'], ['Clear', 'سليم']]] },
        policy: ["No problem, I'll fill in whatever forms you need.", 'لا مشكلة، سأملأ أي استمارة تحتاجها.'],
        letter: ["Yes, it's signed and stamped by my employer.", 'نعم، إنه موقَّع ومختوم من جهة عملي.']
      },
      flags: [['ID matches her salary letter', 'بطاقتها مطابقة لخطاب الراتب'], ['Happy to fill forms and follow the process', 'مستعدة لملء الاستمارات واتباع الإجراءات'], ['No pressure, no unusual request', 'بلا ضغط ولا طلب غريب']],
      key: ['Showed ID and accepted every check', 'قدّمت بطاقتها وقبلت كل تحقق'],
      sum: ['She just wanted to open her first savings account.', 'أرادت فقط فتح أول حساب توفير لها.'],
      exit: ['Shukran! See you next month!', 'شكرًا جزيلًا! أراك الشهر القادم!']
    },
    {
      id: 'L2', role: 'legal', level: 1, jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'dish', name: ['Ahmed', 'أحمد'], age: 22, v: { beard: false, brows: 'worried', robe: '#eef0f2', cap: '#f6f0de', capPat: '#7a55c4', mouth: 'talk' } },
      claim: ['a new joiner without a badge', 'موظف جديد نسي بطاقته'],
      arrive: ['A nervous young man in a crisp dishdasha stops at the barrier.', 'يتوقّف شابٌّ متوتر بدشداشة مكويّة عند الحاجز.'],
      open: ["Good morning! It's my second week. I forgot my badge at home. Can you let me in?", 'صباح الخير! هذا أسبوعي الثاني في العمل، ونسيت بطاقتي في المنزل. هل يمكنك السماح لي بالدخول؟'],
      card: { title: ['Gate', 'البوابة'], rows: [[['Name', 'الاسم'], ['Ahmed S.', 'أحمد س.']], [['Badge', 'بطاقة العمل'], ['Not with him', 'ليست معه']]] },
      acts: {
        id: ["Here's my civil ID.", 'تفضّل بطاقتي الشخصية.'],
        confirm: ['Sure. My manager is Ms. Fatma in Operations, extension 2210.', 'بالتأكيد. مديرتي هي الأستاذة فاطمة في إدارة العمليات، والتحويلة 2210.'],
        system: { say: ['I hope I\'m on there!', 'آمل أن يكون اسمي موجودًا!'], reveal: [[['Staff list', 'قائمة الموظفين'], ['Ahmed S. · Operations · joined Oct 12', 'أحمد س. · العمليات · منذ 12 أكتوبر']]] },
        log: ["No problem, I'll sign the visitor log.", 'لا مشكلة، سأوقّع في سجلّ الزوّار.'],
        wait: ["Okay, I'll wait here for my manager.", 'حسنًا، سأنتظر مديرتي هنا.'],
        policy: ["Understood. I'll get a temporary pass.", 'مفهوم، سأحصل على تصريح مؤقت.']
      },
      flags: [['On the staff list', 'اسمه في قائمة الموظفين'], ["Gave his manager's name and extension", 'ذكر اسم مديرته وتحويلتها'], ['Happy to sign in and wait', 'مستعد للتوقيع والانتظار']],
      key: ['On the staff list, happy to wait', 'اسمه في القائمة ومستعد للانتظار'],
      sum: ['A new joiner who simply forgot his badge at home.', 'موظف جديد نسي بطاقته في المنزل لا أكثر.'],
      exit: ["Thanks! I'll never forget it again.", 'شكرًا لك! لن أنساها مرة أخرى.']
    },
    {
      id: 'L3', role: 'legal', level: 2, jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Mohammed', 'محمد'], age: 30, v: { glasses: 'mirror', shirt: '#0b2547', collar: '#22385f', beard: true, prop: 'laptop', mouth: 'flat' } },
      claim: ['an investor meeting the CEO', 'مستثمر لديه موعد مع الرئيس التنفيذي'],
      arrive: ['A man in dark glasses rushes in, checking his watch.', 'يدخل رجل بنظارة داكنة مسرعًا وهو ينظر إلى ساعته.'],
      open: ["I have a 10 o'clock with the CEO. I'm a bit late, could we hurry, please?", 'لديّ موعد مع الرئيس التنفيذي في الساعة العاشرة، وقد تأخرت قليلًا. هل يمكننا الإسراع من فضلك؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Mohammed Al Lawati', 'محمد اللواتي']], [['Meeting', 'الموعد'], ['CEO · 10:00', 'الرئيس التنفيذي · 10:00']]] },
      acts: {
        appt: { say: ['Mohammed Al Lawati, 10:00, with the CEO\'s office.', 'محمد اللواتي، الساعة العاشرة، مع مكتب الرئيس التنفيذي.'], reveal: [[['Appointment list', 'قائمة المواعيد'], ['10:00 · M. Al Lawati ✓', '10:00 · م. اللواتي ✓']]] },
        id: ["Here's my passport.", 'تفضّل جواز سفري.'],
        confirm: ['Of course, please call them.', 'بالتأكيد، تفضّل بالاتصال بهم.'],
        log: ['Sure, where do I sign?', 'بالتأكيد، أين أوقّع؟'],
        wait: ['Fine, I\'ll wait. Is there coffee?', 'حسنًا، سأنتظر. هل توجد قهوة؟'],
        why: ['Traffic on the expressway. Sorry!', 'الازدحام على الطريق السريع. أعتذر!']
      },
      flags: [['On the appointment list', 'اسمه في قائمة المواعيد'], ['Showed ID and signed in', 'قدّم هويته ووقّع في السجلّ'], ['Impatient, but accepted every check', 'مستعجل، لكنه قبل كل تحقق']],
      key: ['Booked meeting, accepted every check', 'موعد محجوز، وقبِل كل تحقق'],
      sum: ['His meeting was booked; he was just running late.', 'كان موعده محجوزًا، وكل ما في الأمر أنه تأخّر.'],
      exit: ['Thank you. Lovely bunting, by the way!', 'شكرًا لك. الزينة جميلة بالمناسبة!']
    },
    {
      id: 'L4', role: 'legal', level: 3, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'abaya', name: ['Sara', 'سارة'], age: 27, v: { prop: 'folder', lips: '#a8423a' } },
      claim: ['the customer\'s daughter', 'ابنة العميلة'],
      arrive: ['A woman in sunglasses places a thick folder on the counter.', 'تضع امرأة ترتدي نظارة شمسية ملفًا سميكًا على الشبّاك.'],
      open: ["My mother can't walk well, so I'm here to withdraw 500 OMR for her. I have the power of attorney.", 'والدتي لا تقوى على المشي جيدًا، لذا جئت لأسحب لها 500 ر.ع، ومعي الوكالة الرسمية.'],
      card: { title: ['Power of attorney', 'وكالة رسمية'], rows: [[['For', 'الموكِّلة'], ['Moza H.', 'موزة ح.']], [['Agent', 'الوكيلة'], ['Sara H.', 'سارة ح.']], [['Status', 'الحالة'], ['Notarised · valid to 2027', 'موثّقة · سارية حتى 2027']]] },
      acts: {
        id: { say: ["Here's my ID. It matches the attorney.", 'تفضّل بطاقتي، وهي مطابقة للوكالة.'], reveal: [[['Civil ID', 'البطاقة الشخصية'], ['Sara H. · matches', 'سارة ح. · مطابقة']]] },
        poa: ['Here it is, notarised last year.', 'تفضّل، وقد وُثّقت في العام الماضي.'],
        system: { say: ['Sure, check.', 'بالتأكيد، تحقّق.'], reveal: [[['POA on file', 'الوكالة في النظام'], ['Registered ✓', 'مسجّلة ✓']]] },
        callback: ["Sure, call her on the number you have.", 'بالتأكيد، اتصل بها على الرقم المسجّل لديكم.'],
        why: ["It's for her medicine and the house. No rush.", 'المبلغ لأدويتها ولمصاريف المنزل، ولست مستعجلة.'],
        policy: ['Of course, take your time.', 'بالطبع، خذ وقتك.']
      },
      flags: [['Valid, registered power of attorney', 'وكالة سارية ومسجّلة'], ['ID matches the papers', 'البطاقة مطابقة للمستندات'], ['Small amount, no pressure', 'مبلغ صغير بلا ضغط']],
      key: ['Registered power of attorney', 'وكالة مسجّلة'],
      sum: ['Her registered power of attorney let her bank for her mother.', 'وكالتها المسجّلة تخوّلها إجراء المعاملات نيابةً عن والدتها.'],
      exit: ['Thank you, you were very careful!', 'شكرًا لك، لقد كنت حريصًا جدًا!']
    },
    {
      id: 'L5', role: 'legal', level: 1, jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Asma', 'أسماء'], age: 26, v: { cloth: '#f2c6d6', dots: '#1d5694', prop: null, glasses: true, brows: 'worried' } },
      claim: ['a colleague locked out', 'زميلة أُقفل حسابها'],
      line: ['Asma N. · Credit', 'أسماء ن. · الائتمان'],
      open: ['Hi, I locked myself out after too many tries. Can you help me reset my password?', 'مرحبًا، أُقفل حسابي بعد محاولات دخول كثيرة. هل يمكنك مساعدتي في إعادة تعيين كلمة المرور؟'],
      card: { title: ['Helpdesk', 'الدعم الفني'], rows: [[['User', 'المستخدمة'], ['Asma N. · Credit', 'أسماء ن. · الائتمان']], [['Issue', 'المشكلة'], ['Account locked', 'حساب مقفل']]] },
      acts: {
        ticket: { say: ['Sure, ticket number INC-20931.', 'بالتأكيد، رقم التذكرة INC-20931.'], reveal: [[['Ticket INC-20931', 'التذكرة INC-20931'], ['Opened by Asma ✓', 'فتحتها أسماء ✓']]] },
        badge: ['Staff ID 30577. I can come to your desk too.', 'رقمي الوظيفي 30577، ويمكنني الحضور إلى مكتبك أيضًا.'],
        callback: ['Yes, call me on extension 3145.', 'نعم، اتصل بي على التحويلة 3145.'],
        system: { say: ['Thanks for checking.', 'شكرًا على التحقق.'], reveal: [[['Failed logins', 'محاولات الدخول الفاشلة'], ['From her usual PC', 'من جهازها المعتاد']]] },
        policy: ['Perfect, send the reset link to my work email.', 'ممتاز، أرسل رابط إعادة التعيين إلى بريد العمل.'],
        why: ['No rush, I can work on paper for now.', 'لست مستعجلة، يمكنني العمل على الورق في الوقت الحالي.']
      },
      flags: [['Raised a proper ticket', 'فتحت تذكرة رسمية'], ['Answered every check', 'أجابت عن كل أسئلة التحقق'], ['Wanted the reset sent to her own work email', 'طلبت إرسال الرابط إلى بريد عملها']],
      key: ['Raised a ticket, answered every check', 'فتحت تذكرة وأجابت عن كل تحقق'],
      sum: ['A colleague who simply forgot her password.', 'زميلة نسيت كلمة المرور لا أكثر.'],
      exit: ['Thank you! Logged back in.', 'شكرًا لك! عدت إلى حسابي.']
    },
    {
      id: 'L6', role: 'legal', level: 3, jobs: ['ops', 'ceo'], channel: 'phone', place: 'ops',
      who: { base: 'polo', name: ['Hamad', 'حمد'], age: 33, v: { shirt: '#2f6a4a', collar: '#3d8460', badge: 'VISITOR', lanyard: '#00843d', mouth: 'smile', brows: 'happy', mustache: true } },
      claim: ['a supplier asking about an invoice', 'مورّد يستفسر عن فاتورة'],
      line: ['+968 2••• ••88 · Muscat Print House', '+968 2••• ••88 · دار مسقط للطباعة'],
      open: ['Hello, Hamad from Muscat Print House. Could you confirm when invoice #2210 will be paid? No changes, just checking.', 'مرحبًا، معك حمد من دار مسقط للطباعة. هل يمكنك تأكيد موعد سداد الفاتورة رقم 2210؟ لا نطلب أي تغيير، إنما نستفسر فقط.'],
      card: { title: ['Vendor file', 'ملف المورّد'], rows: [[['Vendor', 'المورّد'], ['Muscat Print House', 'دار مسقط للطباعة']], [['Invoice', 'الفاتورة'], ['#2210', '#2210']]] },
      acts: {
        callback: ['Of course, call our office number from your vendor file.', 'بالتأكيد، اتصل برقم مكتبنا المسجّل في ملف المورّد لديكم.'],
        system: { say: ['Thank you.', 'شكرًا لك.'], reveal: [[['Invoice #2210', 'الفاتورة 2210'], ['Due Oct 30', 'مستحقة في 30 أكتوبر']], [['Bank details', 'البيانات المصرفية'], ['Unchanged', 'لم تتغيّر']]] },
        id: ['Our vendor number is V-1187.', 'رقمنا لديكم كمورّد هو V-1187.'],
        official: ["I'll send it from our registered email too.", 'سأرسل الاستفسار من بريدنا المسجّل أيضًا.'],
        why: ['Just planning our cash flow. No rush.', 'نخطط فقط للتدفقات النقدية، ولسنا مستعجلين.'],
        policy: ['No problem, an email reply is fine.', 'لا مشكلة، يكفينا الرد بالبريد الإلكتروني.']
      },
      flags: [['Asked for nothing to change', 'لم يطلب أي تغيير'], ['Offered the official contact on file', 'اقترح وسيلة التواصل الرسمية المسجّلة'], ['Patient, accepted the process', 'صبور ويقبل الإجراءات']],
      key: ['No changes, used the official contact', 'لا تغيير، وتواصل عبر القناة الرسمية'],
      sum: ['He was only checking when his invoice would be paid.', 'كان يستفسر فقط عن موعد سداد فاتورته.'],
      exit: ['Thanks, have a great Youth Day!', 'شكرًا لك، ويوم شباب سعيد!']
    },
    {
      id: 'L7', role: 'legal', level: 1, jobs: ['hr', 'reception', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Reem', 'ريم'], age: 23, v: { cloth: '#ffe08a', dots: '#c8423a', prop: 'folder' } },
      claim: ['a graduate interview candidate', 'متقدّمة لبرنامج الخرّيجين'],
      arrive: ['A young woman in a yellow shayla holds a folder of printed CVs.', 'شابة بشيلة صفراء تحمل ملفًا فيه نسخ مطبوعة من سيرتها الذاتية.'],
      open: ["Hello! I'm Reem. I have an interview at 11 with HR for the graduate programme.", 'مرحبًا! أنا ريم، ولديّ مقابلة في الساعة الحادية عشرة مع الموارد البشرية لبرنامج الخرّيجين.'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Reem S.', 'ريم س.']], [['Here for', 'الغرض'], ['Interview · 11:00', 'مقابلة · 11:00']]] },
      acts: {
        appt: { say: ['It should be under Reem S.', 'يُفترض أن يكون الموعد باسم ريم س.'], reveal: [[['Interview list', 'قائمة المقابلات'], ['11:00 · Reem S. · HR ✓', '11:00 · ريم س. · الموارد البشرية ✓']]] },
        id: ["Here's my civil ID.", 'تفضّل بطاقتي الشخصية.'],
        confirm: ['Sure! The interviewer is Ms. Badriya.', 'بالتأكيد! ستُجري المقابلة الأستاذة بدرية.'],
        log: ["Of course, I'll sign in.", 'بالطبع، سأوقّع في السجلّ.'],
        wait: ["Thank you, I'll wait in the lobby.", 'شكرًا لك، سأنتظر في الردهة.'],
        what: ['Just the interview. I brought printed copies of my CV.', 'المقابلة فقط، وقد أحضرت نسخًا مطبوعة من سيرتي الذاتية.']
      },
      flags: [['On the interview list', 'اسمها في قائمة المقابلات'], ['Knew who she was meeting', 'تعرف من ستقابل'], ['Printed CVs, no USB or odd requests', 'سيرة مطبوعة، بلا ذاكرة USB ولا طلبات غريبة']],
      key: ['On the interview list', 'اسمها في قائمة المقابلات'],
      sum: ['She was here for her booked graduate interview.', 'جاءت لحضور مقابلتها المحجوزة في برنامج الخرّيجين.'],
      exit: ['Wish me luck!', 'تمنَّ لي التوفيق!']
    },
    {
      id: 'L8', role: 'legal', level: 2, jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'dish', name: ['Hussain', 'حسين'], age: 21, v: { beard: false, mustache: false, mouth: 'smile', brows: 'worried', cap: '#f6f0de', capPat: '#00843d' } },
      claim: ['a customer locked out of the app', 'عميل أُقفل حسابه في التطبيق'],
      line: ['+968 9••• ••31 · registered', '+968 9••• ••31 · رقم مسجّل'],
      open: ["Hi, my app says my account is locked. I'm a bit worried, can you check?", 'مرحبًا، يظهر في التطبيق أن حسابي مقفل، وأنا قلق بعض الشيء. هل يمكنك التحقق؟'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Account holder', 'صاحب الحساب'], ['Hussain A.', 'حسين أ.']], [['Issue', 'المشكلة'], ['App locked', 'التطبيق مقفل']]] },
      acts: {
        secq: { say: ['Born 4 May 2005, and my mother\'s name is Shamsa.', 'تاريخ ميلادي 4 مايو 2005، واسم والدتي شمسة.'], reveal: [[['Security answers', 'إجابات الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        callback: ['Yes, call me back on my registered number.', 'نعم، عاود الاتصال بي على رقمي المسجّل.'],
        system: { say: ['Thanks.', 'شكرًا لك.'], reveal: [[['Lock reason', 'سبب الإقفال'], ['3 wrong PINs', '3 محاولات رقم سري خاطئة']], [['Calling number', 'رقم المتصل'], ['Registered ✓', 'مسجّل ✓']]] },
        why: ['I need to pay my university fees this week.', 'عليّ سداد رسومي الجامعية هذا الأسبوع.'],
        policy: ["Okay, I'll reset it in the app with my ID.", 'حسنًا، سأعيد التعيين من التطبيق باستخدام بطاقتي.'],
        branch: ['I can come to the branch tomorrow if needed.', 'يمكنني زيارة الفرع غدًا إن لزم الأمر.']
      },
      flags: [['Answered security questions correctly', 'أجاب عن أسئلة الأمان بشكل صحيح'], ['Called from his registered number', 'اتصل من رقمه المسجّل'], ['Accepted the reset process', 'قبِل إجراءات إعادة التعيين']],
      key: ['Passed security, registered number', 'اجتاز أسئلة الأمان، ورقمه مسجّل'],
      sum: ['He got locked out after typing his PIN wrong three times.', 'أُقفل حسابه بعد أن أدخل رقمه السري خطأً ثلاث مرات.'],
      exit: ['Thanks a lot!', 'شكرًا جزيلًا!']
    }
  ];
})();
