/* Who's on the Line? — scripted visitors (free version, no live AI).
 *
 * Every text is [English, Arabic].
 * Arabic: what a visitor SAYS (open, replies, exit) is natural Gulf/Omani dialect, like a real
 * customer at the counter. Everything the game narrates (claim, arrive, card, reveal, flags, key,
 * sum, exitNote, line) and every question the employee asks is Modern Standard Arabic (فصحى).
 *
 * Wrap a real red-flag phrase in [[double brackets]] in both languages: players can tap it to flag
 * it, and the debrief counts how many they caught. Genuine (legal) visitors have none.
 *
 * role: scammer | attacker | launderer | insider | legal
 * level: 1 = clear case, 2 = trickier, 3 = expert. The difficulty the player picks, and how far
 * into the shift they are, decide which levels can appear.
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
    id        : { icon: 'identification-card', chip: ['Ask for ID', 'اطلب البطاقة الشخصية'], say: ['Can I see your ID, please?', 'هل يمكنني الاطلاع على بطاقتك الشخصية من فضلك؟'], verify: true },
    poa       : { icon: 'scroll', chip: ['Power of attorney?', 'هل لديك وكالة؟'], say: ['Do you have a power of attorney?', 'هل لديك وكالة رسمية؟'], verify: true },
    why       : { icon: 'timer', chip: ['Why the rush?', 'لماذا الاستعجال؟'], say: ['Why is this so urgent?', 'لماذا هذا الأمر مستعجل إلى هذا الحد؟'] },
    callback  : { icon: 'phone-outgoing', chip: ['Call back on file', 'اتصل بالرقم المسجّل'], say: ['I\'ll call back on the number we have on file.', 'سأعاود الاتصال على الرقم المسجّل لدينا.'], verify: true },
    secq      : { icon: 'lock-key', chip: ['Security question', 'أسئلة الأمان'], say: ['Please answer the security questions first.', 'أجب عن أسئلة الأمان أولًا من فضلك.'], verify: true },
    appt      : { icon: 'calendar-check', chip: ['Check appointments', 'راجع المواعيد'], say: ['Let me check today\'s appointment list.', 'دعني أراجع قائمة مواعيد اليوم.'], verify: true },
    confirm   : { icon: 'phone-call', chip: ['Confirm with them', 'تأكّد من الجهة'], say: ['I\'ll call the person you mentioned to confirm.', 'سأتصل بالشخص الذي ذكرته للتأكد.'], verify: true },
    badge     : { icon: 'identification-badge', chip: ['Staff / vendor badge', 'بطاقة العمل'], say: ['Can I see your staff or company badge?', 'هل يمكنني الاطلاع على بطاقة العمل أو بطاقة الشركة؟'], verify: true },
    letter    : { icon: 'envelope-simple', chip: ['Official letter?', 'خطاب رسمي؟'], say: ['Do you have an official letter or documents?', 'هل لديك خطاب رسمي أو مستندات؟'], verify: true },
    ticket    : { icon: 'ticket', chip: ['Ticket number?', 'رقم التذكرة؟'], say: ['What\'s the ticket or reference number?', 'ما رقم التذكرة أو الرقم المرجعي؟'], verify: true },
    who       : { icon: 'question', chip: ['Whose account?', 'باسم من الحساب؟'], say: ['Whose name is the account in?', 'باسم من هذا الحساب؟'] },
    what      : { icon: 'chat-circle-dots', chip: ['What exactly?', 'ماذا تحتاج تحديدًا؟'], say: ['What exactly do you need from us?', 'ما الذي تحتاجه منا تحديدًا؟'] },
    policy    : { icon: 'hand-palm', chip: ['Explain the policy', 'وضّح السياسة'], say: ['Sorry, our policy doesn\'t allow that.', 'عذرًا، سياستنا لا تسمح بذلك.'] },
    branch    : { icon: 'storefront', chip: ['Visit a branch', 'راجِع الفرع'], say: ['Please visit a branch in person with your ID.', 'يُرجى مراجعة الفرع شخصيًا مع بطاقتك الشخصية.'] },
    system    : { icon: 'desktop', chip: ['Check the system', 'تحقّق من النظام'], say: ['Let me check our system first.', 'دعني أتحقق من النظام أولًا.'], verify: true },
    log       : { icon: 'clipboard-text', chip: ['Sign visitor log', 'سجلّ الزوّار'], say: ['Please sign the visitor log and wait for an escort.', 'يُرجى التوقيع في سجلّ الزوّار وانتظار المرافق.'], verify: true },
    official  : { icon: 'envelope-open', chip: ['Use official channel', 'القناة الرسمية'], say: ['Please send it through the official channel.', 'يُرجى إرسال الطلب عبر القناة الرسمية.'], verify: true },
    wait      : { icon: 'armchair', chip: ['Please wait', 'تفضّل بالانتظار'], say: ['Please wait in the lobby while I check.', 'تفضّل بالانتظار في الردهة ريثما أتحقق.'] },
    otp       : { icon: 'prohibit', chip: ['I never share codes', 'لا أشارك الرموز'], say: ['I never share OTPs or passwords with anyone.', 'لا أشارك رموز التحقق أو كلمات المرور مع أي أحد.'] },
    link      : { icon: 'link', chip: ['Why this link?', 'لماذا هذا الرابط؟'], say: ['Why should I log in through this link?', 'لماذا عليّ تسجيل الدخول عبر هذا الرابط؟'] },
    usb       : { icon: 'usb', chip: ['No USB devices', 'يُمنع توصيل USB'], say: ['We never plug outside USB devices into bank PCs.', 'لا نوصِل أي جهاز USB خارجي بأجهزة البنك إطلاقًا.'] },
    email     : { icon: 'at', chip: ['Send by email', 'أرسله بالبريد'], say: ['Could you send it by email instead?', 'هل يمكنك إرساله بالبريد الإلكتروني بدلًا من ذلك؟'] },
    source    : { icon: 'coins', chip: ['Source of funds?', 'مصدر الأموال؟'], say: ['Where does this money come from? Any documents?', 'ما مصدر هذه الأموال؟ هل لديك مستندات؟'], verify: true },
    purpose   : { icon: 'target', chip: ['What is it for?', 'ما الغرض منها؟'], say: ['What will the money be used for?', 'فيمَ ستُستخدم هذه الأموال؟'] },
    manager   : { icon: 'user-circle-check', chip: ['Ask their manager', 'اسأل المدير'], say: ['I\'ll need your manager\'s approval for this.', 'سأحتاج إلى موافقة مديرك على هذا الطلب.'], verify: true }
  };

  // Places / channels shown in the tag above the dialogue box
  window.PLACES = {
    counter   : ['Branch counter', 'شبّاك الفرع'],
    branchoff : ['Branch manager\'s office', 'مكتب مدير الفرع'],
    gate      : ['HQ main gate', 'البوابة الرئيسية للمقر'],
    reception : ['HQ reception', 'استقبال المقر الرئيسي'],
    hroffice  : ['HQ · HR office', 'المقر الرئيسي · مكتب الموارد البشرية'],
    exec      : ['HQ · executive floor', 'المقر الرئيسي · الطابق التنفيذي'],
    callcentre: ['Call centre', 'مركز الاتصال'],
    itdesk    : ['HQ · IT helpdesk', 'المقر الرئيسي · الدعم الفني'],
    ops       : ['HQ · operations', 'المقر الرئيسي · العمليات'],
    rmdesk    : ['Relationship desk', 'مكتب علاقات العملاء']
  };
  window.CHANNELS = {
    person    : ['In person', 'حضوريًا'],
    phone     : ['Phone call', 'مكالمة هاتفية'],
    whatsapp  : ['WhatsApp', 'واتساب'],
    email     : ['Email', 'بريد إلكتروني'],
    internal  : ['Internal chat', 'محادثة داخلية']
  };

  window.ENCOUNTERS = [
    // =================== SCAMMERS ===================
    {
      id: 'S1', role: 'scammer', level: 1, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Salim', 'سالم'], age: 24, v: { brows: 'worried' } },
      claim: ['the customer\'s son', 'ابن العميل'],
      arrive: ['A young man in a white dishdasha hurries to your counter, out of breath.', 'يُسرع شابٌّ بدشداشة بيضاء نحو شبّاكك وهو يلهث.'],
      open: ['My father is in hospital. I need to withdraw his money [[today]]. Can you make an exception [[just this once]]?', 'أبوي في المستشفى. لازم أسحب فلوسه [[اليوم]]. ممكن تسوي استثناء [[هالمرة بس]]؟'],
      card: { title: ['Withdrawal slip', 'قسيمة سحب'], rows: [[['Account', 'الحساب'], ['Hamood S.', 'حمود س.']], [['Amount', 'المبلغ'], ['3,000 OMR', '3,000 ر.ع'], 1], [['Signed by', 'الموقِّع'], ['Salim (son)', 'سالم (الابن)'], 1]] },
      acts: {
        id: ['Here\'s my ID. And this is a [[photo of my father\'s ID]] on my phone.', 'هذي بطاقتي. وهذي [[صورة بطاقة أبوي]] في تلفوني.'],
        poa: ['Power of attorney? There\'s [[no time for paperwork]], he\'s in hospital!', 'وكالة؟ [[ما في وقت للأوراق]]، هو في المستشفى!'],
        why: ['The hospital wants payment [[in cash, today]]. Please, I am begging you.', 'المستشفى يبون الدفع [[كاش، اليوم]]. الله يخليك.'],
        callback: ['Don\'t call him! He\'s [[too sick to talk]]. Just trust me.', 'لا تتصل فيه! هو [[تعبان وما يقدر يتكلم]]. بس ثق فيني.'],
        system: { say: ['Check what you like. I am his son, [[everyone knows me]] here.', 'تحقق كيف ما تبي. أنا ولده، [[الكل يعرفني]] هني.'], reveal: [[['Allowed to withdraw', 'المخوَّل بالسحب'], ['Hamood S. only', 'حمود س. فقط'], 1]] },
        policy: ['Your policy? My father could die! [[Who is your manager?]]', 'سياستكم؟ أبوي ممكن يموت! [[منو مديرك؟]]']
      },
      flags: [['Rushed you: "today!"', 'استعجلك: "اليوم!"'], ['No power of attorney, only a photo of an ID', 'لا وكالة لديه، مجرد صورة بطاقة'], ['Asked for an exception "just this once"', 'طلب استثناءً "هذه المرة فقط"']],
      key: ['No power of attorney, only an ID photo', 'بلا وكالة، مجرد صورة بطاقة'],
      sum: ['He wanted his father\'s money out today, with no power of attorney.', 'أراد سحب أموال والده اليوم من دون أي وكالة.'],
      exit: ['Wait… I\'ll come back tomorrow!', 'انتظر… برجع باكر!'], exitNote: ['(he won\'t)', '(ولن يعود)']
    },
    {
      id: 'S2', role: 'scammer', level: 3, jobs: ['ceo', 'ops'], channel: 'email', place: 'exec',
      who: { base: 'dish', name: ['Khalid', 'خالد'], age: 31, v: { headwear: 'massar', cap: '#5a2a6a', capPat: '#c9a31c', capBand: '#e6c95a', glasses: true, skin: 'e', mouth: 'flat' } },
      claim: ['the Chairman', 'رئيس مجلس الإدارة'],
      line: ['chairman.office@ahlibank-om.co', 'chairman.office@ahlibank-om.co'],
      open: ['CONFIDENTIAL. Wire 48,000 OMR to our new partner [[before 2 pm]]. Keep this [[between us]] until the deal is announced.', 'سري. حوّل 48,000 ر.ع لشريكنا الجديد [[قبل الساعة 2]]. خلّ الموضوع [[بيني وبينك]] لين نعلن الصفقة.'],
      card: { title: ['Sender check', 'التحقق من المرسِل'], rows: [[['From', 'من'], ['Chairman (claimed)', 'رئيس المجلس (كما يدّعي)']], [['Amount', 'المبلغ'], ['48,000 OMR', '48,000 ر.ع'], 1], [['Payee', 'المستفيد'], ['New, never used', 'جديد، لم يُستخدم من قبل'], 1]] },
      acts: {
        official: ['I\'m travelling, [[my official email isn\'t working]]. Use this one.', 'أنا مسافر، [[إيميلي الرسمي ما يشتغل]]. استخدم هذا.'],
        callback: ['I\'m [[in meetings all day]], I can\'t take calls. Just process it.', 'أنا [[في اجتماعات طول اليوم]]، ما أقدر أرد. بس نفّذ.'],
        why: ['The deal closes today. If we miss it, [[the bank loses millions]].', 'الصفقة تقفل اليوم. لو فاتتنا، [[البنك بيخسر الملايين]].'],
        confirm: ['[[Don\'t involve finance]] yet, it\'s confidential. I trust only you.', '[[لا تدخّل المالية]] الحين، الموضوع سري. أنا واثق فيك أنت بس.'],
        system: { say: ['Why are you checking? Just do as I say.', 'ليش تتحقق؟ بس سوّ اللي أقول لك.'], reveal: [[['Sender domain', 'نطاق المرسِل'], ['ahlibank-om.co', 'ahlibank-om.co'], 1], [['Bank domain', 'نطاق البنك'], ['ahlibank.om', 'ahlibank.om']]] },
        policy: ['I\'m the Chairman. [[I\'m approving it]]. That\'s enough.', 'أنا رئيس المجلس. [[أنا موافق]]. وهذا يكفي.']
      },
      flags: [['Secrecy: "keep this between us"', 'السرّية: "بيني وبينك"'], ['Deadline pressure: "before 2 pm"', 'ضغط الوقت: "قبل الثانية ظهرًا"'], ['Look-alike email domain', 'نطاق بريد مقلَّد']],
      key: ['Secret payment from a look-alike email', 'دفعة سرّية من بريد مقلَّد'],
      sum: ['He wanted a big payment sent in secret, from a look-alike email address.', 'أراد إرسال دفعة كبيرة سرًّا، من عنوان بريد مقلَّد.'],
      exit: ['No reply. The address bounced the next day.', 'ما في رد. العنوان تعطّل ثاني يوم.']
    },
    {
      id: 'S3', role: 'scammer', level: 1, jobs: ['teller'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Said', 'سعيد'], age: 26, v: { shirt: '#7a2a2a', collar: '#9a3a3a', mouth: 'flat' } },
      claim: ['a customer charged twice', 'عميل خُصمت منه الرسوم مرتين'],
      line: ['+968 9••• ••52 · new number', '+968 9••• ••52 · رقم جديد'],
      open: ['You charged me twice for my card fee! Refund it now, but send it to [[my friend\'s account]], mine is blocked.', 'خصمتوا رسوم البطاقة مرتين! رجّعوها الحين، بس حوّلوها [[لحساب صديقي]]، حسابي موقوف.'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Caller', 'المتصل'], ['Said R. (claimed)', 'سعيد ر. (كما يدّعي)']], [['Request', 'الطلب'], ['Refund to another person\'s account', 'استرداد إلى حساب شخص آخر'], 1]] },
      acts: {
        secq: { say: ['Er… Fatma? Or Aisha. [[Just process it]], please.', 'أمم… فاطمة؟ ولا عائشة. [[بس نفّذ الطلب]] لو سمحت.'], reveal: [[['Security answer', 'إجابة الأمان'], ['Wrong', 'خاطئة'], 1]] },
        system: { say: ['You\'ll see it. Two charges, [[I\'m sure]].', 'بتشوفها. خصمين، [[أنا متأكد]].'], reveal: [[['Card fee charges', 'خصم رسوم البطاقة'], ['1 charge only', 'خصم واحد فقط'], 1]] },
        why: ['My account is frozen, so [[send it to Hamed\'s]]. He\'ll give me the cash.', 'حسابي مجمّد، [[حوّلها لحساب حمد]]. هو بيعطيني الكاش.'],
        callback: ['I\'m on a [[new number]], don\'t call the old one.', 'أنا على [[رقم جديد]]، لا تتصل على القديم.'],
        branch: ['I can\'t come to a branch, I\'m [[travelling]]. Do it on the phone.', 'ما أقدر أجي الفرع، أنا [[مسافر]]. خلّصها بالتلفون.'],
        policy: ['Every bank does refunds! [[I\'ll complain]] about you online.', 'كل البنوك ترجّع الفلوس! [[بشتكي عليك]] في السوشال ميديا.']
      },
      flags: [['Refund to someone else\'s account', 'استرداد إلى حساب شخص آخر'], ['Records show only one charge', 'السجلّ يُظهر خصمًا واحدًا فقط'], ['Threats and pressure', 'تهديد وضغط']],
      key: ['Fake double charge, refund to a friend', 'خصم مزدوج وهمي واسترداد إلى حساب صديق'],
      sum: ['He invented a double charge to get money sent to another account.', 'اختلق خصمًا مزدوجًا ليُحوَّل المال إلى حساب آخر.'],
      exit: ['Click. He hung up.', 'طق. سكّر الخط.']
    },
    {
      id: 'S4', role: 'scammer', level: 2, jobs: ['rm', 'teller'], channel: 'whatsapp', place: 'rmdesk',
      who: { base: 'polo', name: ['Ahmed', 'أحمد'], age: 29, v: { shirt: '#2f6a4a', collar: '#3d8460', glasses: 'clear', mouth: 'smile', brows: 'happy' } },
      claim: ['a long-time business client', 'عميل تجاري قديم'],
      line: ['+968 7••• ••19 · not saved', '+968 7••• ••19 · غير محفوظ'],
      open: ['Salam, it\'s Ahmed from Al Noor Trading, new number. Please transfer 12,000 OMR to this [[new supplier abroad]] [[today]].', 'السلام عليكم، معك أحمد من النور للتجارة، رقم جديد. لو سمحت حوّل 12,000 ر.ع [[لمورد جديد برا]] [[اليوم]].'],
      card: { title: ['Client record', 'سجلّ العميل'], rows: [[['Client', 'العميل'], ['Al Noor Trading', 'النور للتجارة']], [['Phone on file', 'الرقم المسجّل'], ['+968 9••• 2231', '+968 9••• 2231']], [['Request', 'الطلب'], ['12,000 OMR abroad', '12,000 ر.ع إلى الخارج'], 1]] },
      acts: {
        callback: ['That phone is [[broken]]. WhatsApp only for now, please.', 'هذاك التلفون [[خربان]]. واتساب بس الحين لو سمحت.'],
        official: ['Email is down. You know me, [[we\'ve worked together for years]]!', 'الإيميل واقف. أنت تعرفني، [[صار لنا سنين نتعامل]]!'],
        why: ['The supplier will [[cancel the order]] if paid after 3 pm.', 'المورد [[بيلغي الطلب]] إذا الدفع بعد الساعة 3.'],
        system: { say: ['Why check? [[Hurry please]].', 'ليش تتحقق؟ [[استعجل لو سمحت]].'], reveal: [[['Payee', 'المستفيد'], ['New, never paid before', 'جديد، لم يُحوَّل إليه من قبل'], 1], [['Usual payments', 'المدفوعات المعتادة'], ['Local suppliers only', 'مورّدون محليون فقط']]] },
        secq: ['I [[don\'t have time]] for questions. I\'ll lose the deal!', '[[ما عندي وقت]] للأسئلة. بتروح علي الصفقة!'],
        branch: ['I\'m abroad. Just do it, [[I\'ll sign later]].', 'أنا برا البلد. بس سوّها، [[بوقّع بعدين]].']
      },
      flags: [['New number, WhatsApp only', 'رقم جديد، وتواصل عبر واتساب فقط'], ['New payee abroad, today', 'مستفيد جديد في الخارج، واليوم'], ['Refused every check', 'رفض كل تحقق']],
      key: ['Pretended to be a client from a new number', 'انتحل صفة عميل من رقم جديد'],
      sum: ['He pretended to be a known client to send money to a new payee abroad.', 'انتحل صفة عميل معروف ليحوّل المال إلى مستفيد جديد في الخارج.'],
      exit: ['Message deleted. The number blocked you.', 'انحذفت الرسالة. والرقم حظرك.']
    },
    {
      id: 'S5', role: 'scammer', level: 3, jobs: ['ops', 'ceo'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Huda', 'هدى'], age: 30, v: { sunglasses: false, cloth: '#3b2f4a', mouth: 'smile', mole: false } },
      claim: ['a regular supplier', 'مورّدة معتادة'],
      line: ['accounts@gulf-offlce.com', 'accounts@gulf-offlce.com'],
      open: ['Dear team, please note our [[bank details have changed]]. Pay invoice #4471 (8,900 OMR) to the new account [[from this week]].', 'فريقنا العزيز، يرجى العلم أن [[بيانات حسابنا البنكي تغيرت]]. ادفعوا الفاتورة رقم 4471 (8,900 ر.ع) على الحساب الجديد [[من هالأسبوع]].'],
      card: { title: ['Vendor file', 'ملف المورّد'], rows: [[['Vendor', 'المورّد'], ['Gulf Office Supplies', 'الخليج للأدوات المكتبية']], [['Invoice', 'الفاتورة'], ['#4471 · 8,900 OMR', '#4471 · 8,900 ر.ع']], [['Request', 'الطلب'], ['Change bank account', 'تغيير الحساب المصرفي'], 1]] },
      acts: {
        callback: ['Please use the [[number in this email]]. Our old line is closed.', 'لو سمحتوا استخدموا [[الرقم اللي في الإيميل]]. خطنا القديم مقفل.'],
        letter: ['A letter will take weeks. [[A screenshot is fine]], right?', 'الخطاب ياخذ أسابيع. [[صورة شاشة تكفي]]، صح؟'],
        system: { say: ['We are your supplier, you can trust us.', 'إحنا موردكم، تقدرون تثقون فينا.'], reveal: [[['Account on file', 'الحساب المسجّل'], ['Bank ••4410', 'بنك ••4410']], [['New account', 'الحساب الجديد'], ['Other bank, other name', 'بنك آخر وباسم آخر'], 1], [['Email domain', 'نطاق البريد'], ['gulf-offlce.com (letter "l")', 'gulf-offlce.com (حرف l بدل i)'], 1]] },
        why: ['We changed banks for better fees. [[Please don\'t delay]] the payment.', 'غيرنا البنك عشان الرسوم. [[لا تأخروا الدفع]] لو سمحتوا.'],
        confirm: ['Your usual contact [[left the company]]. Deal with me now.', 'الشخص اللي تتعاملون معه [[ترك الشركة]]. تعاملوا معي الحين.'],
        policy: ['No need, we\'ve been your supplier for [[five years]].', 'ما يحتاج، إحنا موردكم من [[خمس سنين]].']
      },
      flags: [['Changed bank details by email', 'تغيير البيانات المصرفية عبر البريد'], ['Only offered contacts from the same email', 'لم تقدّم إلا جهات اتصال من الرسالة نفسها'], ['Look-alike email domain', 'نطاق بريد مقلَّد']],
      key: ['Fake "new bank details" for a real supplier', 'بيانات مصرفية "جديدة" مزيّفة لمورّد حقيقي'],
      sum: ['She tried to redirect a real supplier\'s payment to her own account.', 'حاولت تحويل دفعة مورّد حقيقي إلى حسابها.'],
      exit: ['The real supplier called later: they never changed banks.', 'المورد الحقيقي اتصل بعدين: ما غيروا البنك أبد.']
    },
    {
      id: 'S6', role: 'scammer', level: 1, jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Faisal', 'فيصل'], age: 30, v: { shirt: '#1b2a44', collar: '#2b3f66', glasses: 'clear', beard: true, prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['an investor for the CEO', 'مستثمر يطلب لقاء الرئيس التنفيذي'],
      arrive: ['A smart man with a leather folder walks straight to the desk, smiling.', 'رجل أنيق يحمل ملفًا جلديًا يتّجه مباشرة إلى المكتب مبتسمًا.'],
      open: ['I\'m an investor from Dubai with [[a 20 million deal]] for your CEO. I just need a bank guarantee letter [[signed today]].', 'أنا مستثمر من دبي وعندي [[صفقة بـ20 مليون]] لرئيسكم التنفيذي. بس أحتاج خطاب ضمان بنكي [[موقّع اليوم]].'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Faisal (business card)', 'فيصل (بطاقة عمل)']], [['Wants', 'يطلب'], ['Signed guarantee letter', 'خطاب ضمان موقَّع'], 1]] },
      acts: {
        appt: { say: ['No appointment, but [[the CEO knows me]] personally. Call him if you like.', 'ما عندي موعد، بس [[الرئيس يعرفني]] شخصيًا. اتصل فيه لو تبي.'], reveal: [[['Appointments', 'المواعيد'], ['Not on the list', 'غير موجود في القائمة'], 1]] },
        id: ['Here\'s my business card. My passport is [[at the hotel]].', 'هذا كرتي. جوازي [[في الفندق]].'],
        confirm: ['His secretary? She\'ll say no. [[Better to go straight up]].', 'سكرتيرته؟ بترفض. [[الأحسن أطلع له على طول]].'],
        why: ['Other banks want this deal too. It\'s [[today or never]].', 'بنوك ثانية تبي هالصفقة. [[اليوم أو أبد]].'],
        letter: ['The papers are with my lawyer. Just [[stamp this letter]], I\'ll send them later.', 'الأوراق عند المحامي. بس [[اختم هالخطاب]]، وبرسلها بعدين.'],
        log: ['I don\'t sign forms. [[Do you know who I am?]]', 'أنا ما أوقّع استمارات. [[تعرف منو أنا؟]]']
      },
      flags: [['No appointment, name-drops the CEO', 'بلا موعد، ويتذرّع باسم الرئيس التنفيذي'], ['Wants a signed bank letter today', 'يريد خطابًا مصرفيًا موقَّعًا اليوم'], ['No ID or company papers', 'بلا هوية ولا مستندات شركة']],
      key: ['Wanted a signed bank letter, no appointment', 'أراد خطابًا مصرفيًا موقَّعًا من دون موعد'],
      sum: ['He wanted a signed bank letter to use in a scam, with no appointment or ID.', 'أراد خطابًا مصرفيًا موقَّعًا لاستخدامه في عملية احتيال، من دون موعد أو هوية.'],
      exit: ['He left fast when security walked over.', 'طلع بسرعة لما قرّب الأمن.']
    },
    {
      id: 'S7', role: 'scammer', level: 2, jobs: ['hr', 'ops'], channel: 'phone', place: 'hroffice',
      who: { base: 'dish', name: ['Mazin', 'مازن'], age: 25, v: { robe: '#e9e4d8', cap: '#fbfaf5', capPat: '#c8423a', mouth: 'talk' } },
      claim: ['an employee at the Sohar branch', 'موظف في فرع صحار'],
      line: ['+968 9••• ••73 · mobile', '+968 9••• ••73 · هاتف نقّال'],
      open: ['Hi HR, Mazin from the Sohar branch. Please change my salary account to a new one [[before payroll tonight]].', 'هلا بالموارد البشرية، مازن من فرع صحار. لو سمحتوا غيّروا حساب راتبي لحساب جديد [[قبل الرواتب الليلة]].'],
      card: { title: ['Employee record', 'سجلّ الموظف'], rows: [[['Name', 'الاسم'], ['Mazin H. · Sohar', 'مازن ح. · صحار']], [['Request', 'الطلب'], ['New salary account', 'حساب راتب جديد'], 1]] },
      acts: {
        callback: ['I\'m [[not at the branch]] today, call this mobile only.', 'أنا [[مو في الفرع]] اليوم، اتصل على هالنقال بس.'],
        id: ['Er… my employee number is on my payslip, [[I don\'t have it]] with me.', 'أمم… رقمي الوظيفي في كشف الراتب، [[مو معي]] الحين.'],
        official: ['The HR portal [[won\'t let me log in]]. You can just do it, it\'s quick.', 'بوابة الموارد [[ما تخليني أدخل]]. تقدر تسويها أنت، سريعة.'],
        system: { say: ['Is there a problem?', 'في مشكلة؟'], reveal: [[['Mobile on file', 'الرقم المسجّل'], ['Different number', 'رقم مختلف'], 1], [['Account changes', 'تغيير الحساب'], ['Only via HR portal', 'عبر بوابة الموارد البشرية فقط']]] },
        why: ['My old account is [[closed]]. If you don\'t change it, I won\'t get paid!', 'حسابي القديم [[مسكّر]]. إذا ما غيرته، ما بنزل راتبي!'],
        confirm: ['My manager is [[on leave]]. Please, it\'s only a small change.', 'مديري [[في إجازة]]. الله يخليك، تغيير بسيط.']
      },
      flags: [['Asked you to skip the HR portal', 'طلب تجاوز بوابة الموارد البشرية'], ['Couldn\'t give his employee number', 'لم يعرف رقمه الوظيفي'], ['Deadline: "before payroll tonight"', 'موعد نهائي: "قبل صرف الرواتب الليلة"']],
      key: ['Salary diversion from an unknown mobile', 'تحويل راتب من رقم غير مسجّل'],
      sum: ['He tried to divert a real employee\'s salary to his own account.', 'حاول تحويل راتب موظف حقيقي إلى حسابه.'],
      exit: ['The real Mazin called next week: he never asked for any change.', 'مازن الحقيقي اتصل الأسبوع اللي بعده: ما طلب أي تغيير.']
    },
    {
      id: 'S8', role: 'scammer', level: 2, jobs: ['it', 'ops'], channel: 'internal', place: 'ops',
      who: { base: 'shayla', name: ['Laila', 'ليلى'], age: 29, v: { cloth: '#c9b2e6', dots: '#fbfaf5', prop: null, mouth: 'smile' } },
      claim: ['your Head of Operations', 'رئيسة العمليات'],
      line: ['Laila K. · Head of Operations · in a meeting', 'ليلى ك. · رئيسة العمليات · في اجتماع'],
      open: ['Hi, it\'s Laila. I\'m in a board meeting. Can you buy [[10 gift cards]] for the Youth Day staff prizes and [[send me the codes]] here?', 'هلا، أنا ليلى. أنا في اجتماع مجلس. ممكن تشتري [[10 بطاقات هدايا]] لجوائز يوم الشباب و[[ترسل لي الأكواد]] هني؟'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['Account', 'الحساب'], ['Laila K.', 'ليلى ك.']], [['Request', 'الطلب'], ['Gift card codes', 'رموز بطاقات هدايا'], 1]] },
      acts: {
        callback: ['[[Can\'t talk]], board meeting. Chat only please.', '[[ما أقدر أتكلم]]، اجتماع مجلس. محادثة بس لو سمحت.'],
        why: ['The prizes are for today. [[It\'s urgent]], you\'re the only one I trust.', 'الجوائز لليوم. [[ضروري]]، أنت الوحيد اللي أثق فيه.'],
        official: ['No time for a purchase request. [[Use your own card]], I\'ll approve later.', 'ما في وقت لطلب شراء. [[استخدم بطاقتك]]، وبوافق بعدين.'],
        confirm: ['Don\'t bother my assistant, [[keep it a surprise]]!', 'لا تزعج مساعدتي، [[خلها مفاجأة]]!'],
        system: { say: ['Why are you so slow today?', 'ليش بطيء اليوم؟'], reveal: [[['Last login', 'آخر تسجيل دخول'], ['New device, outside Oman', 'جهاز جديد، من خارج عُمان'], 1]] },
        policy: ['I\'m your manager. [[Are you refusing me?]]', 'أنا مديرتك. [[ترفض طلبي؟]]']
      },
      flags: [['Gift cards and codes in a chat', 'بطاقات هدايا ورموز عبر المحادثة'], ['Secrecy: "keep it a surprise"', 'السرّية: "فلتكن مفاجأة"'], ['Login from a new device abroad', 'تسجيل دخول من جهاز جديد في الخارج']],
      key: ['Hacked manager account wanting gift-card codes', 'حساب مديرة مخترَق يطلب رموز بطاقات الهدايا'],
      sum: ['A hacked account pretending to be your manager, chasing gift-card codes.', 'حساب مخترَق ينتحل صفة مديرتك ويسعى للحصول على رموز بطاقات الهدايا.'],
      exit: ['IT locked the account an hour later.', 'الدعم الفني قفل الحساب بعد ساعة.']
    },
    {
      id: 'S9', role: 'scammer', level: 2, jobs: ['teller', 'rm'], channel: 'whatsapp', place: 'callcentre',
      who: { base: 'abaya', name: ['Maryam', 'مريم'], age: 29, v: {  } },
      claim: ['the customer', 'صاحبة الحساب'],
      line: ['+968 9••• ••87 · typing…', '+968 9••• ••87 · تكتب…'],
      open: ['Hi, I lost my phone. Please update my number to this one and send my new card to [[a new address]].', 'هلا، ضاع تلفوني. لو سمحت حدّث رقمي لهذا الرقم وأرسل بطاقتي الجديدة [[لعنوان جديد]].'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Account holder', 'صاحبة الحساب'], ['Aisha K.', 'عائشة ك.']], [['Phone on file', 'الرقم المسجّل'], ['+968 9••• 4410', '+968 9••• 4410']], [['Card address', 'عنوان البطاقة'], ['Al Hail North', 'الحيل الشمالية']], [['Request', 'الطلب'], ['Change phone + address', 'تغيير الرقم والعنوان'], 1]] },
      acts: {
        secq: { say: ['I don\'t remember it. Can you just [[tell me the balance]]?', 'ما أذكره. ممكن بس [[تقول لي الرصيد]]؟'], reveal: [[['Security question', 'سؤال الأمان'], ['Not answered', 'لم تُجِب'], 1]] },
        callback: ['That number is lost, remember? [[Don\'t call it]].', 'الرقم ضاع، نسيت؟ [[لا تتصل عليه]].'],
        who: { say: ['The account is under Aisha\'s name. [[I manage her banking]] for her.', 'الحساب باسم عائشة. [[أنا أدير حساباتها]] عنها.'], reveal: [[['Caller', 'المتواصلة'], ['Not the account holder', 'ليست صاحبة الحساب'], 1]] },
        branch: ['I can\'t go to a branch, I\'m [[too busy]]. WhatsApp is easier.', 'ما أقدر أروح الفرع، أنا [[مشغولة وايد]]. الواتساب أسهل.'],
        why: ['I need the card [[before the weekend]].', 'أحتاج البطاقة [[قبل الويكند]].'],
        policy: ['Fine, then just [[send me her statement]] so I can check.', 'خلاص، بس [[أرسل لي كشف حسابها]] أتأكد.']
      },
      flags: [['Change phone and address together', 'تغيير الرقم والعنوان معًا'], ['Not the account holder', 'ليست صاحبة الحساب'], ['Fishing for the balance', 'تحاول معرفة الرصيد']],
      key: ['Couldn\'t answer the security question', 'لم تُجِب عن سؤال الأمان'],
      sum: ['She wanted to take over someone else\'s account by changing the phone and address.', 'أرادت الاستيلاء على حساب شخص آخر بتغيير الرقم والعنوان.'],
      exit: ['Last seen: offline.', 'آخر ظهور: غير متصلة.']
    },
    {
      id: 'S10', role: 'scammer', level: 1, jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'polo', name: ['Badr', 'بدر'], age: 28, v: { shirt: '#2b3a55', mustache: true, mouth: 'flat', brows: 'neutral' } },
      claim: ['the account holder', 'صاحب الحساب'],
      arrive: ['A young man slides a civil ID under the glass without a word.', 'يدفع شابٌّ بطاقة شخصية تحت الزجاج دون أن ينطق بكلمة.'],
      open: ['I want to close my account and [[take everything in cash]]. Here\'s [[my ID]].', 'أبي أسكّر حسابي و[[آخذ كل شي كاش]]. هذي [[بطاقتي]].'],
      card: { title: ['Civil ID', 'البطاقة الشخصية'], rows: [[['Name', 'الاسم'], ['Ali R.', 'علي ر.']], [['Born', 'تاريخ الميلاد'], ['1971', '1971'], 1], [['Request', 'الطلب'], ['Close account, all cash', 'إغلاق الحساب وسحب الرصيد نقدًا'], 1]] },
      acts: {
        id: ['That\'s me in the photo, [[I was younger]].', 'هذا أنا في الصورة، [[كنت أصغر]].'],
        secq: ['My signature? It [[changed]] over the years.', 'توقيعي؟ [[تغيّر]] مع السنين.'],
        why: ['I\'m moving abroad [[tonight]].', 'بسافر برا [[الليلة]].'],
        system: { say: ['What are you looking for?', 'شو تدور؟'], reveal: [[['Account holder age', 'عمر صاحب الحساب'], ['55', '55'], 1], [['Signature on file', 'التوقيع المسجّل'], ['Doesn\'t match', 'غير مطابق'], 1]] },
        callback: ['My phone is [[off]], just use the ID.', 'تلفوني [[مقفل]]، بس استخدم البطاقة.'],
        branch: ['I don\'t have other papers. [[Can\'t you just do it?]]', 'ما عندي أوراق ثانية. [[ما تقدر تخلصها وبس؟]]']
      },
      flags: [['ID belongs to a man in his 50s', 'البطاقة لرجل في الخمسينيات من عمره'], ['All money in cash, tonight', 'كل الأموال نقدًا، والليلة'], ['Signature doesn\'t match', 'التوقيع غير مطابق']],
      key: ['Used another man\'s ID', 'استخدم بطاقة رجل آخر'],
      sum: ['He used a stolen ID to empty another man\'s account.', 'استخدم بطاقة مسروقة لإفراغ حساب رجل آخر.'],
      exit: ['He left "his" ID on the counter and ran.', 'خلّى "بطاقته" على الكاونتر وهرب.']
    },
    {
      id: 'S11', role: 'scammer', level: 1, jobs: ['guard', 'reception', 'hr'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Adil', 'عادل'], age: 23, v: { shirt: '#c9a31c', collar: '#a8860f', badge: 'COURIER', lanyard: '#1b1410', prop: 'parcel', mouth: 'smile', brows: 'happy' } },
      claim: ['a courier with a cash-on-delivery parcel', 'مندوب توصيل بطرد مدفوع عند الاستلام'],
      arrive: ['A courier in a yellow shirt hurries to the gate with a small box.', 'يُسرع مندوب بقميص أصفر نحو البوابة حاملًا صندوقًا صغيرًا.'],
      open: ['Parcel for the HR director! It\'s cash on delivery, [[35 OMR]]. Can you [[pay it now]]? He\'ll pay you back.', 'شحنة لمدير الموارد البشرية! الدفع عند الاستلام، [[35 ريال]]. ممكن [[تدفعها الحين]]؟ هو بيرجّعها لك.'],
      card: { title: ['Delivery note', 'إشعار التسليم'], rows: [[['For', 'إلى'], ['HR director', 'مدير الموارد البشرية']], [['To pay', 'المبلغ المطلوب'], ['35 OMR cash', '35 ر.ع نقدًا'], 1]] },
      acts: {
        confirm: ['Don\'t call him, [[he\'s in a meeting]]. It\'s only 35!', 'لا تتصل فيه، [[هو في اجتماع]]. بس 35 ريال!'],
        badge: { say: ['Here, my courier card.', 'تفضل، بطاقة المندوب.'], reveal: [[['Courier card', 'بطاقة المندوب'], ['No company name', 'بلا اسم شركة'], 1]] },
        why: ['I have [[20 more drops]] before noon, please hurry.', 'عندي [[20 توصيلة ثانية]] قبل الظهر، استعجل لو سمحت.'],
        appt: { say: ['It\'s a surprise gift, I think.', 'أظنها هدية مفاجأة.'], reveal: [[['Expected deliveries', 'الشحنات المتوقعة'], ['None for HR', 'لا شيء للموارد البشرية'], 1]] },
        wait: ['Fine, I\'ll leave it… but [[pay first]].', 'خلاص بخليها… بس [[ادفع أول]].'],
        policy: ['Other banks always pay. [[You want me to take it back?]]', 'البنوك الثانية دايمًا تدفع. [[تبيني أرجّعها؟]]']
      },
      flags: [['Wanted cash before handing over the parcel', 'طلب النقود قبل تسليم الطرد'], ['No delivery was expected', 'لم تكن هناك شحنة متوقعة'], ['Stopped you from calling the director', 'منعك من الاتصال بالمدير']],
      key: ['Fake cash-on-delivery parcel', 'طرد وهمي بالدفع عند الاستلام'],
      sum: ['He used a fake parcel to collect cash from staff.', 'استخدم طردًا وهميًا ليجمع النقود من الموظفين.'],
      exit: ['Forget it, wrong building!', 'خلاص، غلطت في المبنى!'], exitNote: ['(the box was empty)', '(كان الصندوق فارغًا)']
    },
    {
      id: 'S12', role: 'scammer', level: 2, jobs: ['it', 'ops'], channel: 'email', place: 'itdesk',
      who: { base: 'abaya', name: ['Dana', 'دانة'], age: 31, v: { sunglasses: false, cloth: '#2a3a4a', mouth: 'smile', mole: false } },
      claim: ['your software licence supplier', 'مورّدة تراخيص البرامج'],
      line: ['renewals@secure-licence-centre.net', 'renewals@secure-licence-centre.net'],
      open: ['URGENT: your security software licence [[expires tonight]]. Pay 3,400 OMR to our [[new bank account]] today to avoid a shutdown.', 'عاجل: رخصة برنامج الحماية عندكم [[تخلص الليلة]]. ادفعوا 3,400 ريال على [[حسابنا البنكي الجديد]] اليوم عشان ما يوقف النظام.'],
      card: { title: ['Invoice', 'الفاتورة'], rows: [[['Product', 'المنتج'], ['Security software licence', 'رخصة برنامج حماية']], [['Amount', 'المبلغ'], ['3,400 OMR', '3,400 ر.ع']], [['Pay to', 'الدفع إلى'], ['New account', 'حساب جديد'], 1]] },
      acts: {
        system: { say: ['Check quickly, it\'s urgent.', 'تحقق بسرعة، الموضوع مستعجل.'], reveal: [[['Licence end date', 'تاريخ انتهاء الرخصة'], ['Next March', 'مارس القادم'], 1], [['Supplier on file', 'المورّد المسجّل'], ['Different company', 'شركة مختلفة'], 1]] },
        ticket: ['No need for a ticket, [[just pay the invoice]].', 'ما يحتاج تذكرة، [[بس ادفعوا الفاتورة]].'],
        official: ['Our usual contact [[left the company]]. Use this email now.', 'الموظف اللي تتعاملون معه [[ترك الشركة]]. تعاملوا مع هالإيميل الحين.'],
        callback: ['Please call the [[number in this email]] only.', 'لو سمحت اتصل على [[الرقم اللي في الإيميل]] بس.'],
        why: ['If you miss tonight, [[all your PCs will lock]].', 'إذا فاتتكم الليلة، [[كل الأجهزة بتنقفل]].'],
        policy: ['Fine, but the shutdown will be [[your fault]].', 'خلاص، بس إذا وقف النظام [[أنت المسؤول]].']
      },
      flags: [['Deadline: "expires tonight"', 'موعد نهائي: "تنتهي الليلة"'], ['Payment to a new bank account', 'دفع إلى حساب مصرفي جديد'], ['Only offered contacts from the same email', 'لم تقدّم إلا جهات اتصال من الرسالة نفسها']],
      key: ['Fake licence renewal to a new account', 'تجديد رخصة وهمي إلى حساب جديد'],
      sum: ['She sent a fake renewal invoice to get money paid to her account.', 'أرسلت فاتورة تجديد وهمية ليُدفع المال إلى حسابها.'],
      exit: ['The email address stopped working the next day.', 'توقف عنوان البريد في اليوم التالي.']
    },

    // =================== ATTACKERS ===================
    {
      id: 'A1', role: 'attacker', level: 1, jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Hamed', 'حامد'], age: 27, v: { glasses: 'mirror', badge: 'VENDOR' } },
      claim: ['an IT vendor', 'مورّد خدمات تقنية'],
      arrive: ['A man in a navy polo with a red lanyard taps his badge at the gate.', 'رجل بقميص كحلي وشريط أحمر حول عنقه يشير إلى بطاقته عند البوابة.'],
      open: ['Morning! IT vendor. I need [[five minutes in the server room]] to [[plug in an update]]. Quick job.', 'صباح الخير! من مورد التقنية. أحتاج [[خمس دقايق في غرفة الخوادم]] عشان [[أوصل تحديث]]. شغلة سريعة.'],
      card: { title: ['Gate pass', 'تصريح البوابة'], rows: [[['Visitor', 'الزائر'], ['Hamed (vendor)', 'حامد (مورّد)']], [['Going to', 'الوجهة'], ['Server room', 'غرفة الخوادم'], 1]] },
      acts: {
        ticket: ['Ticket? Your IT manager [[called me directly]], it\'s urgent.', 'تذكرة؟ مدير التقنية [[اتصل فيني مباشرة]]، الموضوع مستعجل.'],
        badge: { say: ['Here\'s my vendor badge. All official.', 'هذي بطاقة المورد. كلها رسمية.'], reveal: [[['Vendor badge', 'بطاقة المورّد'], ['No company name, no photo', 'بلا اسم شركة ولا صورة'], 1]] },
        confirm: ['IT is [[in a meeting]]. Don\'t disturb them, I\'ll be out fast.', 'التقنية [[في اجتماع]]. لا تزعجهم، بطلع بسرعة.'],
        log: ['I\'ll sign on the way out, [[I\'m in a hurry]].', 'بوقّع وأنا طالع، [[أنا مستعجل]].'],
        usb: ['It\'s only a [[small USB]] with the patch. Totally safe.', 'بس [[فلاش صغير]] فيه التحديث. آمن مية بالمية.'],
        wait: ['I don\'t need an escort, [[I know the way]].', 'ما أحتاج مرافق، [[أعرف الطريق]].']
      },
      flags: [['No ticket: "the manager called me"', 'بلا تذكرة: "المدير اتصل بي"'], ['Wants to plug in a USB', 'يريد توصيل ذاكرة USB'], ['Avoided the escort and visitor log', 'تهرّب من المرافق ومن سجلّ الزوّار']],
      key: ['Wanted the server room with a USB', 'أراد دخول غرفة الخوادم ومعه ذاكرة USB'],
      sum: ['He wanted unescorted access to plug a device into bank systems.', 'أراد الدخول دون مرافق لتوصيل جهاز بأنظمة البنك.'],
      exit: ['Security walked him out. No vendor visit was booked.', 'الأمن طلّعه. ما كان في أي زيارة مورد محجوزة.']
    },
    {
      id: 'A2', role: 'attacker', level: 1, jobs: ['teller', 'rm', 'hr', 'ops'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Rashid', 'راشد'], age: 27, v: { shirt: '#44546a', collar: '#56677f', glasses: 'clear', badge: 'IT', lanyard: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['Head Office IT', 'فريق التقنية في المقر الرئيسي'],
      line: ['Internal? +968 2••• ••00 · withheld', 'داخلي؟ +968 2••• ••00 · رقم محجوب'],
      open: ['Hello, Rashid from Head Office IT. We\'re fixing a security issue on your PC. Please [[read me the code]] you just got by SMS.', 'هلا، راشد من تقنية المبنى الرئيسي. نصلّح مشكلة أمنية في جهازك. لو سمحت [[اقرأ لي الكود]] اللي وصلك بالرسالة.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Rashid (IT, claimed)', 'راشد (التقنية، كما يدّعي)']], [['Wants', 'يطلب'], ['Your SMS code', 'رمز الرسالة النصية'], 1]] },
      acts: {
        otp: ['It\'s not a real OTP, just [[a test code]]. Everyone in your branch already gave it.', 'هذا مو رمز تحقق، بس [[كود تجربة]]. الكل في فرعك عطاني إياه.'],
        ticket: ['There\'s no ticket, it\'s an [[emergency fix]].', 'ما في تذكرة، هذا [[تصليح طارئ]].'],
        callback: ['Don\'t call the helpdesk, [[the line is down]]. That\'s why I\'m calling you.', 'لا تتصل على الدعم، [[الخط عطلان]]. عشان كذا أتصل عليك.'],
        badge: ['My staff ID? Er… [[4-4-7… it\'s long]]. Just the code please.', 'رقمي الوظيفي؟ أمم… [[4-4-7… طويل]]. بس الكود لو سمحت.'],
        why: ['If we don\'t fix it in [[five minutes]], your account gets locked.', 'إذا ما صلحناها في [[خمس دقايق]]، حسابك بينقفل.'],
        policy: ['Fine, then [[your account will be blocked]] and it\'s your fault.', 'خلاص، [[حسابك بينحظر]] وأنت السبب.']
      },
      flags: [['Asked for the SMS code', 'طلب رمز الرسالة النصية'], ['Threatened to lock your account', 'هدّد بقفل حسابك'], ['Wouldn\'t let you call the real helpdesk', 'منعك من الاتصال بالدعم الفني الحقيقي']],
      key: ['Asked for your one-time code', 'طلب رمز التحقق الخاص بك'],
      sum: ['He wanted your one-time code to break into your account.', 'أراد رمز التحقق الخاص بك ليخترق حسابك.'],
      exit: ['He hung up when you said you\'d call the helpdesk.', 'سكّر الخط لما قلت بتتصل على الدعم.']
    },
    {
      id: 'A3', role: 'attacker', level: 3, jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Amal', 'أمل'], age: 26, v: { cloth: '#9fd9c0', dots: '#1d5694', prop: 'phone', brows: 'stern', mouth: 'flat' } },
      claim: ['a colleague in Treasury', 'زميلة في الخزينة'],
      line: ['Amal K. · Treasury', 'أمل ك. · الخزينة'],
      open: ['Hi helpdesk, Amal from Treasury. Salma is on leave. Please [[reset her MFA]] to [[my phone]] so I can approve her payments.', 'هلا بالدعم، أمل من الخزينة. سلمى في إجازة. لو سمحتوا [[صفّروا التحقق الثنائي حقها]] على [[تلفوني]] عشان أوافق على مدفوعاتها.'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['Requester', 'مقدّمة الطلب'], ['Amal K. · Treasury', 'أمل ك. · الخزينة']], [['For user', 'للمستخدمة'], ['Salma B. (on leave)', 'سلمى ب. (في إجازة)'], 1]] },
      acts: {
        ticket: ['No ticket, it\'s [[faster this way]]. Her manager agreed.', 'بدون تذكرة، [[أسرع كذا]]. مديرها موافق.'],
        confirm: ['Salma is [[unreachable]] on holiday. Her manager is busy.', 'سلمى [[ما ترد]] في إجازتها. ومديرها مشغول.'],
        policy: ['Every team does this. [[Don\'t be difficult]].', 'كل الفرق تسوي كذا. [[لا تعقّدها]].'],
        badge: { say: ['My staff ID is 20981. Happy?', 'رقمي الوظيفي 20981. مرتاح؟'], reveal: [[['Chat session', 'جلسة المحادثة'], ['New device, new location', 'جهاز جديد وموقع جديد'], 1]] },
        system: { say: ['Just do it please.', 'بس سوّها لو سمحت.'], reveal: [[['MFA reset', 'إعادة ضبط التحقق'], ['Only for the account owner', 'لصاحب الحساب فقط'], 1]] },
        why: ['Payments are [[stuck]]. The bank will lose money today!', 'المدفوعات [[واقفة]]. البنك بيخسر فلوس اليوم!']
      },
      flags: [['Wanted someone else\'s MFA on her phone', 'أرادت ربط تحقق شخص آخر بهاتفها'], ['Skipped the ticket process', 'تجاوزت نظام التذاكر'], ['Chat login from a new device', 'دخول إلى المحادثة من جهاز جديد']],
      key: ['Wanted another user\'s MFA moved to her', 'أرادت نقل تحقق مستخدمة أخرى إليها'],
      sum: ['An attacker using a hacked chat account to take over another user\'s login.', 'مخترِق يستخدم حساب محادثة مخترَقًا للاستيلاء على حساب مستخدمة أخرى.'],
      exit: ['The real Amal had no idea her account was being used.', 'أمل الحقيقية ما كانت تدري إن حسابها ينستخدم.']
    },
    {
      id: 'A4', role: 'attacker', level: 1, jobs: ['ops', 'hr', 'ceo', 'it'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Noura', 'نورة'], age: 28, v: { sunglasses: false, mouth: 'smile', prop: null, cloth: '#2a2236' } },
      claim: ['HR Communications', 'اتصالات الموارد البشرية'],
      line: ['hr-comms@ahlibank-mail.com', 'hr-comms@ahlibank-mail.com'],
      open: ['ACTION REQUIRED. All staff must sign the new policy [[by 5 pm today]]. Log in with your bank password here: [[policy-portal-login.net]]', 'إجراء مطلوب. على كل الموظفين توقيع السياسة الجديدة [[قبل الساعة 5 اليوم]]. ادخل بكلمة مرور البنك هني: [[policy-portal-login.net]]'],
      card: { title: ['Email check', 'التحقق من البريد'], rows: [[['From', 'من'], ['HR Communications', 'اتصالات الموارد البشرية']], [['Asks for', 'يطلب'], ['Your bank password', 'كلمة مرور البنك'], 1]] },
      acts: {
        link: ['It\'s our new portal, [[faster than the intranet]]. Just log in.', 'هذي بوابتنا الجديدة، [[أسرع من الإنترانت]]. بس ادخل.'],
        official: ['It\'s [[not on the intranet yet]]. This is the only link.', '[[مو على الإنترانت للحين]]. هذا الرابط الوحيد.'],
        callback: ['HR is very busy today, [[please don\'t call]]. Just click.', 'الموارد مشغولين اليوم، [[لا تتصل لو سمحت]]. بس اضغط.'],
        system: { say: ['Did you sign yet?', 'وقّعت؟'], reveal: [[['Sender domain', 'نطاق المرسِل'], ['ahlibank-mail.com', 'ahlibank-mail.com'], 1], [['Link', 'الرابط'], ['Not a bank website', 'ليس موقعًا تابعًا للبنك'], 1]] },
        why: ['Anyone who misses the deadline gets [[a warning letter]].', 'اللي يفوّت الموعد بيوصله [[إنذار]].'],
        otp: ['Then you\'ll be [[reported to your manager]].', 'أجل [[بنبلّغ مديرك]].']
      },
      flags: [['A link asking for your bank password', 'رابط يطلب كلمة مرور البنك'], ['Not on the intranet', 'غير موجود على الشبكة الداخلية'], ['Deadline plus a threat', 'موعد نهائي مع تهديد']],
      key: ['Phishing link asking for your password', 'رابط تصيّد يطلب كلمة المرور'],
      sum: ['A phishing email built to capture staff passwords.', 'رسالة تصيّد صُمّمت لسرقة كلمات مرور الموظفين.'],
      exit: ['IT confirmed: the link was a fake login page.', 'التقنية أكدت: الرابط صفحة دخول مزيفة.']
    },
    {
      id: 'A5', role: 'attacker', level: 2, jobs: ['guard', 'reception'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Yaqoob', 'يعقوب'], age: 25, v: { shirt: '#d9822b', collar: '#b86a1f', badge: 'COURIER', lanyard: '#1b1410', prop: 'parcel', mouth: 'smile', brows: 'happy' } },
      claim: ['a courier with a parcel', 'مندوب توصيل يحمل طردًا'],
      arrive: ['A courier in an orange shirt arrives holding a taped box.', 'يصل مندوب توصيل بقميص برتقالي يحمل صندوقًا ملفوفًا بالشريط.'],
      open: ['Delivery for the finance director. I must [[hand it to him upstairs]], and he needs to [[sign on my tablet]].', 'شحنة للمدير المالي. لازم [[أسلّمها له فوق بنفسي]]، ولازم [[يوقّع على جهازي]].'],
      card: { title: ['Delivery', 'التوصيل'], rows: [[['For', 'إلى'], ['Finance director', 'المدير المالي']], [['Courier', 'المندوب'], ['Yaqoob (no company named)', 'يعقوب (من دون اسم شركة)'], 1]] },
      acts: {
        why: ['Company rules. It\'s [[confidential]], I can\'t leave it here.', 'نظام الشركة. هذي [[سرية]]، ما أقدر أخليها هني.'],
        confirm: ['No need to call, [[he\'s expecting me]].', 'ما يحتاج تتصل، [[هو ينتظرني]].'],
        id: ['My ID is in the van. I\'ll [[just go up]] quickly.', 'بطاقتي في السيارة. بس [[بطلع فوق]] بسرعة.'],
        wait: ['If I leave it, [[I\'ll lose my job]]. Two minutes upstairs!', 'لو خليتها، [[بنفصل من شغلي]]. دقيقتين فوق!'],
        appt: { say: ['It\'s a surprise delivery.', 'هذي شحنة مفاجئة.'], reveal: [[['Expected deliveries', 'الشحنات المتوقعة'], ['None today', 'لا شيء اليوم'], 1]] },
        badge: { say: ['Here\'s my courier badge.', 'هذي بطاقة المندوب.'], reveal: [[['Courier badge', 'بطاقة المندوب'], ['Handwritten, no logo', 'مكتوبة بخط اليد وبلا شعار'], 1]] }
      },
      flags: [['Insisted on going upstairs', 'أصرّ على الصعود إلى الطوابق العليا'], ['No ID, no expected delivery', 'بلا هوية ولا شحنة متوقعة'], ['Wouldn\'t leave the parcel at reception', 'رفض ترك الطرد في الاستقبال']],
      key: ['Fake delivery to get upstairs', 'توصيل وهمي للصعود إلى المكاتب'],
      sum: ['He used a fake delivery to get past security into the offices.', 'استخدم توصيلًا وهميًا لتجاوز الأمن ودخول المكاتب.'],
      exit: ['He left the "parcel" behind. It was empty.', 'خلّى "الشحنة" وراه. كانت فاضية.']
    },
    {
      id: 'A6', role: 'attacker', level: 2, jobs: ['hr', 'reception'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Shaikha', 'شيخة'], age: 23, v: { cloth: '#f2c6d6', dots: '#c8423a', prop: 'folder', mouth: 'smile' } },
      claim: ['a job candidate', 'متقدّمة لوظيفة'],
      arrive: ['A young woman with a folder waves at you with a friendly smile.', 'شابة تحمل ملفًا تلوّح لك بابتسامة ودودة.'],
      open: ['Hi! I\'m here for an interview. My CV is on this USB. Can you [[print it from your PC]]? [[Mine\'s not working]].', 'هلا! جاية لمقابلة. سيرتي الذاتية على هالفلاش. ممكن [[تطبعها من جهازك]]؟ [[جهازي خربان]].'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Shaikha M.', 'شيخة م.']], [['Wants', 'تطلب'], ['USB into your PC', 'توصيل ذاكرة USB بجهازك'], 1]] },
      acts: {
        appt: { say: ['It\'s at 11, with… er, [[someone from HR]].', 'الساعة 11، مع… أمم، [[أحد من الموارد]].'], reveal: [[['Interview list', 'قائمة المقابلات'], ['No "Shaikha" today', 'لا يوجد اسم "شيخة" اليوم'], 1]] },
        usb: ['It\'s just a CV! [[It\'ll take one second]].', 'بس سيرة ذاتية! [[ثانية وحدة]].'],
        id: { say: ['Sure, here\'s my ID.', 'أكيد، هذي بطاقتي.'], reveal: [[['ID', 'البطاقة'], ['Shaikha M. · matches', 'شيخة م. · مطابقة']]] },
        confirm: ['I [[forgot the name]]. Can\'t you just print it?', '[[نسيت الاسم]]. ما تقدر تطبعها وبس؟'],
        wait: ['OK… but [[could I use the PC in that office]] while I wait?', 'طيب… بس [[ممكن أستخدم الجهاز اللي في المكتب]] وأنا أنتظر؟'],
        email: ['My email is [[locked]]. The USB is easier.', 'إيميلي [[مقفل]]. الفلاش أسهل.']
      },
      flags: [['Pushed her USB into a bank PC', 'أصرّت على توصيل ذاكرتها بجهاز البنك'], ['Not on the interview list', 'اسمها غير موجود في قائمة المقابلات'], ['Couldn\'t name the interviewer', 'لم تعرف اسم من سيُجري المقابلة']],
      key: ['Wanted her USB in a bank PC', 'أرادت توصيل ذاكرتها بجهاز البنك'],
      sum: ['She tried to get a USB with malware into a bank computer.', 'حاولت توصيل ذاكرة تحمل برنامجًا خبيثًا بأحد أجهزة البنك.'],
      exit: ['The USB had a hidden program on it.', 'الفلاش كان فيه برنامج مخفي.']
    },
    {
      id: 'A7', role: 'attacker', level: 3, jobs: ['ceo', 'rm', 'teller'], channel: 'person', place: 'branchoff',
      who: { base: 'dish', name: ['Saif', 'سيف'], age: 31, v: { headwear: 'massar', cap: '#1d5694', capPat: '#e6c95a', capBand: '#fbfaf5', glasses: true, prop: 'folder', brows: 'stern', mouth: 'flat' } },
      claim: ['a central audit inspector', 'مفتّش من التدقيق المركزي'],
      arrive: ['A serious man with a folder walks in and closes the office door.', 'يدخل رجل جادّ الملامح يحمل ملفًا، ويُغلق باب المكتب خلفه.'],
      open: ['Central audit. This is a [[surprise inspection]]. Log me into your system [[with your account]] so I can check the records.', 'تدقيق مركزي. هذا [[تفتيش مفاجئ]]. دخّلني على النظام [[بحسابك]] عشان أراجع السجلات.'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Saif (auditor, claimed)', 'سيف (مدقّق كما يدّعي)']], [['Wants', 'يطلب'], ['Your login', 'بيانات دخولك'], 1]] },
      acts: {
        letter: ['The letter is [[being emailed]]. Start without it.', 'الخطاب [[ينرسل بالإيميل]]. ابدأ بدونه.'],
        badge: { say: ['Here\'s my card.', 'هذا كرتي.'], reveal: [[['Card', 'البطاقة'], ['Name only, no regulator logo', 'اسم فقط، بلا شعار الجهة الرقابية'], 1]] },
        confirm: ['Calling compliance [[ruins the surprise]]. Don\'t.', 'الاتصال بالامتثال [[يخرّب المفاجأة]]. لا تتصل.'],
        policy: ['Refusing an auditor is [[a serious offence]].', 'رفض المدقق [[مخالفة خطيرة]].'],
        why: ['My access [[isn\'t set up yet]]. Yours is faster.', 'صلاحياتي [[ما تجهزت للحين]]. حسابك أسرع.'],
        wait: ['I\'ll [[come back later]] then…', 'أجل [[برجع بعدين]]…']
      },
      flags: [['Wanted to use your login', 'أراد استخدام بيانات دخولك'], ['No letter or regulator ID', 'بلا خطاب ولا هوية من الجهة الرقابية'], ['Avoided compliance', 'تهرّب من إدارة الالتزام']],
      key: ['Fake auditor wanting your login', 'مدقّق مزيّف يريد بيانات دخولك'],
      sum: ['A fake auditor trying to get into bank systems through your account.', 'مدقّق مزيّف يحاول دخول أنظمة البنك عبر حسابك.'],
      exit: ['Compliance had no inspection scheduled.', 'الامتثال ما عندهم أي تفتيش مجدول.']
    },
    {
      id: 'A8', role: 'attacker', level: 1, jobs: ['reception', 'hr', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Omar', 'عمر'], age: 24, v: { shirt: '#4f86c6', collar: '#3a6aa6', prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['a university student', 'طالب جامعي'],
      arrive: ['A cheerful student with a folder asks if you have a minute.', 'طالب بشوش يحمل ملفًا يسألك إن كان لديك دقيقة.'],
      open: ['I\'m a student doing a project. Could you give me [[the names and emails]] of everyone in IT and Finance? And [[who reports to whom]]?', 'أنا طالب وعندي مشروع. ممكن تعطيني [[أسماء وإيميلات]] كل موظفي التقنية والمالية؟ و[[منو يتبع منو]]؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Omar (student)', 'عمر (طالب)']], [['Wants', 'يطلب'], ['Staff names, emails, org chart', 'أسماء الموظفين وبريدهم والهيكل الإداري'], 1]] },
      acts: {
        letter: ['My university letter is [[at home]]. It\'s a small project.', 'خطاب الجامعة [[في البيت]]. مشروع صغير.'],
        why: ['It\'s for a [[research paper]] on banks.', 'عشان [[بحث]] عن البنوك.'],
        confirm: ['Communications will take forever. You\'re [[much more helpful]]!', 'الاتصال المؤسسي بياخذون وقت. أنت [[أفيد بوايد]]!'],
        id: { say: ['Here\'s my student card.', 'هذي بطاقة الجامعة.'], reveal: [[['Student card', 'البطاقة الجامعية'], ['Expired 2023', 'منتهية منذ 2023'], 1]] },
        policy: ['Just [[the IT manager\'s name]] and email then?', 'طيب بس [[اسم مدير التقنية]] وإيميله؟'],
        what: ['Also, [[what software]] do you use for payments?', 'وبعد، [[أي برنامج]] تستخدمون للمدفوعات؟']
      },
      flags: [['Wanted names, emails and the org chart', 'أراد الأسماء وعناوين البريد والهيكل الإداري'], ['Asked which systems the bank uses', 'سأل عن الأنظمة التي يستخدمها البنك'], ['Expired student card, no letter', 'بطاقة جامعية منتهية وبلا خطاب']],
      key: ['Collecting staff names and emails', 'يجمع أسماء الموظفين وعناوين بريدهم'],
      sum: ['He was harvesting staff details to target them later.', 'كان يجمع بيانات الموظفين لاستهدافهم لاحقًا.'],
      exit: ['He left before Communications came down.', 'طلع قبل ما ينزل الاتصال المؤسسي.']
    },
    {
      id: 'A9', role: 'attacker', level: 2, jobs: ['reception', 'guard', 'hr'], channel: 'person', place: 'reception',
      who: { base: 'dish', name: ['Fahad', 'فهد'], age: 22, v: { robe: '#eef0f2', cap: '#f6f0de', capPat: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['a visitor who found a USB in the lobby', 'زائر وجد ذاكرة USB في الردهة'],
      arrive: ['A friendly young man holds up a USB stick labelled "Salaries 2026".', 'شاب ودود يرفع ذاكرة USB مكتوبًا عليها "رواتب 2026".'],
      open: ['I found this in the lobby! It says "Salaries 2026". [[Plug it in your PC]] so we [[see whose it is]].', 'لقيت هذا في الصالة! مكتوب عليه "رواتب 2026". [[وصّله بجهازك]] عشان [[نشوف حق منو]].'],
      card: { title: ['Found item', 'غرض مفقود'], rows: [[['Item', 'الغرض'], ['USB stick "Salaries 2026"', 'ذاكرة USB "رواتب 2026"'], 1], [['Found by', 'وجده'], ['Fahad (visitor)', 'فهد (زائر)']]] },
      acts: {
        usb: ['Just one look! [[It\'s only a USB]].', 'نظرة وحدة بس! [[هذا مجرد فلاش]].'],
        log: { say: ['Sure, I\'ll sign. I\'m here for a meeting.', 'أكيد، بوقّع. أنا جاي لاجتماع.'], reveal: [[['Visitor log', 'سجلّ الزوّار'], ['No meeting booked', 'لا يوجد اجتماع محجوز'], 1]] },
        wait: ['Don\'t you want to know [[everyone\'s salary]]? Ha!', 'ما تبي تعرف [[رواتب الكل]]؟ ههه!'],
        id: ['Here\'s my ID.', 'تفضل بطاقتي.'],
        why: ['Someone may be [[in trouble]] if it gets lost!', 'يمكن أحد [[يتورط]] إذا ضاع!'],
        policy: ['Then [[let me plug it in]] my laptop in your meeting room.', 'أجل [[خلني أوصله]] في لابتوبي في قاعة الاجتماعات.']
      },
      flags: [['Pushed you to plug in an unknown USB', 'ألحّ عليك لتوصيل ذاكرة مجهولة'], ['Tempting label: "Salaries 2026"', 'عنوان مُغرٍ: "رواتب 2026"'], ['No meeting was booked', 'لم يكن هناك اجتماع محجوز']],
      key: ['Planted USB with a tempting label', 'ذاكرة USB مزروعة بعنوان مُغرٍ'],
      sum: ['The USB was a trap to install malware on a bank computer.', 'كانت الذاكرة فخًا لتثبيت برنامج خبيث على جهاز البنك.'],
      exit: ['Keep it then! Bye!', 'خلاص خلّه عندك! مع السلامة!'], exitNote: ['(IT found hidden malware on it)', '(وجد فريق التقنية برنامجًا خبيثًا عليها)']
    },
    {
      id: 'A10', role: 'attacker', level: 3, jobs: ['it', 'ops'], channel: 'phone', place: 'itdesk',
      who: { base: 'polo', name: ['Waleed', 'وليد'], age: 30, v: { shirt: '#44546a', collar: '#56677f', glasses: 'clear', mouth: 'flat', brows: 'neutral' } },
      claim: ['the ATM maintenance vendor', 'مورّد صيانة أجهزة الصرّاف'],
      line: ['+968 2••• ••15 · ATM vendor (claimed)', '+968 2••• ••15 · مورّد الصرّاف (كما يدّعي)'],
      open: ['Hi, ATM vendor here. For tonight\'s update I need [[a VPN account]] for my engineer and please [[turn off MFA]] for it.', 'هلا، معك مورّد أجهزة الصرّاف. عشان تحديث الليلة أحتاج [[حساب VPN]] للمهندس، ولو سمحت [[وقّف التحقق الثنائي]] عليه.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Company', 'الشركة'], ['ATM vendor (claimed)', 'مورّد الصرّاف (كما يدّعي)']], [['Wants', 'يطلب'], ['VPN access without MFA', 'دخول VPN بلا تحقق ثنائي'], 1]] },
      acts: {
        ticket: ['The change ticket? Your manager [[will open it later]].', 'تذكرة التغيير؟ مديرك [[بيفتحها بعدين]].'],
        badge: { say: ['My vendor ID is V-3390.', 'رقمي كمورّد V-3390.'], reveal: [[['Vendor V-3390', 'المورّد V-3390'], ['Contract ended last year', 'انتهى عقده العام الماضي'], 1]] },
        callback: ['Call this number, [[the office line is down]].', 'اتصل على هالرقم، [[خط المكتب عطلان]].'],
        why: ['MFA [[breaks our scripts]]. Every bank turns it off for us.', 'التحقق الثنائي [[يخرّب السكربتات]] حقنا. كل البنوك توقفه لنا.'],
        system: { say: ['You\'ll see we do your ATMs.', 'بتشوف إننا نصلّح صرّافاتكم.'], reveal: [[['Scheduled ATM work', 'أعمال صيانة مجدولة'], ['None tonight', 'لا شيء الليلة'], 1]] },
        policy: ['If the ATMs stop tomorrow, [[it\'s on you]].', 'إذا وقفت الصرّافات باكر، [[عليك أنت]].']
      },
      flags: [['Asked for VPN access with MFA turned off', 'طلب دخول VPN مع إيقاف التحقق الثنائي'], ['Vendor\'s contract had ended', 'عقد المورّد منتهٍ'], ['No change ticket, no scheduled work', 'لا تذكرة تغيير ولا أعمال مجدولة']],
      key: ['Fake vendor wanting remote access', 'مورّد مزيّف يريد دخولًا عن بُعد'],
      sum: ['A fake vendor trying to get remote access into the bank network.', 'مورّد مزيّف يحاول الدخول عن بُعد إلى شبكة البنك.'],
      exit: ['Click. The number was switched off.', 'أُغلق الخط، والرقم لم يعد يعمل.']
    },
    {
      id: 'A11', role: 'attacker', level: 1, jobs: ['teller', 'rm', 'hr', 'ceo', 'guard'], channel: 'whatsapp', place: 'callcentre',
      who: { base: 'shayla', name: ['Hessa', 'حصة'], age: 26, v: { cloth: '#b8dcae', dots: '#0b2547', mouth: 'flat' } },
      claim: ['the payroll team', 'فريق الرواتب'],
      line: ['+44 7••• ••02 · not saved', '+44 7••• ••02 · غير محفوظ'],
      open: ['ahlibank Payroll: your salary will be [[suspended today]]. Verify your login here: [[ahlibank-payroll.co/verify]]', 'رواتب البنك الأهلي: راتبك [[بيتوقف اليوم]]. أكّد دخولك من هنا: [[ahlibank-payroll.co/verify]]'],
      card: { title: ['Message check', 'التحقق من الرسالة'], rows: [[['From', 'من'], ['Foreign number', 'رقم دولي'], 1], [['Link', 'الرابط'], ['ahlibank-payroll.co', 'ahlibank-payroll.co'], 1]] },
      acts: {
        link: ['It\'s our new payroll site, [[log in quickly]].', 'هذا موقع الرواتب الجديد، [[ادخل بسرعة]].'],
        otp: ['You will also get a code. [[Send it here]] to finish.', 'بيوصلك كود بعد. [[أرسله هنا]] عشان نخلص.'],
        official: ['HR asked us to use WhatsApp [[for speed]].', 'الموارد طلبت نستخدم الواتساب [[عشان السرعة]].'],
        callback: ['Don\'t call HR, [[they\'re too busy today]].', 'لا تتصل بالموارد، [[مشغولين وايد اليوم]].'],
        system: { say: ['Hurry, the time is running out.', 'استعجل، الوقت يخلص.'], reveal: [[['Payroll notices', 'إشعارات الرواتب'], ['Only by work email', 'عبر بريد العمل فقط'], 1]] },
        why: ['Many staff have not verified. [[Last chance]]!', 'وايد موظفين ما أكدوا. [[آخر فرصة]]!']
      },
      flags: [['A link asking for your bank login', 'رابط يطلب بيانات دخولك'], ['Threat: salary "suspended today"', 'تهديد: إيقاف الراتب "اليوم"'], ['Message from a foreign number', 'رسالة من رقم دولي']],
      key: ['Phishing message about your salary', 'رسالة تصيّد عن راتبك'],
      sum: ['A phishing message built to capture staff logins and codes.', 'رسالة تصيّد صُمّمت لسرقة بيانات دخول الموظفين ورموزهم.'],
      exit: ['The number was blocked and reported to IT.', 'حُظر الرقم وأُبلغ عنه فريق التقنية.']
    },
    {
      id: 'A12', role: 'attacker', level: 2, jobs: ['teller', 'guard', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'polo', name: ['Marwan', 'مروان'], age: 27, v: { shirt: '#4f86c6', collar: '#3a6aa6', badge: 'VENDOR', lanyard: '#c8423a', prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['a technician for the new app', 'فنّي التطبيق الجديد'],
      arrive: ['A man with a folder of printed QR stickers points at the ATM.', 'رجل يحمل ملفًا فيه ملصقات QR مطبوعة يشير إلى جهاز الصرّاف.'],
      open: ['Hello! I\'m putting [[new QR stickers on the ATMs]] for the new app. Customers scan and [[log in there]].', 'هلا! بلصق [[ملصقات QR جديدة على الصرّافات]] عشان التطبيق الجديد. العملاء يمسحونها و[[يدخلون منها]].'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Marwan (technician)', 'مروان (فنّي)']], [['Wants', 'يطلب'], ['To stick QR codes on ATMs', 'لصق رموز QR على الصرّافات'], 1]] },
      acts: {
        letter: ['The letter? [[Marketing will email it]] later.', 'الخطاب؟ [[التسويق بيرسله]] بعدين.'],
        badge: { say: ['Here\'s my badge.', 'هذي بطاقتي.'], reveal: [[['Vendor badge', 'بطاقة المورّد'], ['Unknown company', 'شركة غير معروفة'], 1]] },
        confirm: ['No need to call, [[it takes two minutes]].', 'ما يحتاج تتصل، [[دقيقتين وأخلص]].'],
        link: { say: ['The link goes to our login page.', 'الرابط يودّي لصفحة الدخول حقنا.'], reveal: [[['QR link', 'رابط QR'], ['Not a bank website', 'ليس موقعًا تابعًا للبنك'], 1]] },
        why: ['The app launches tomorrow, [[we are late]].', 'التطبيق ينطلق باكر، [[إحنا متأخرين]].'],
        policy: ['Fine, I\'ll [[stick them on the outside ATM]] then.', 'خلاص، [[بلصقها على الصرّاف اللي برا]] أجل.']
      },
      flags: [['QR stickers leading to a fake login page', 'ملصقات QR تقود إلى صفحة دخول مزيّفة'], ['No letter from the bank', 'لا خطاب من البنك'], ['Unknown company badge', 'بطاقة شركة غير معروفة']],
      key: ['Fake QR codes on the ATMs', 'رموز QR مزيّفة على الصرّافات'],
      sum: ['He wanted to trap customers with fake QR codes on the ATMs.', 'أراد إيقاع العملاء برموز QR مزيّفة على أجهزة الصرّاف.'],
      exit: ['He left quickly with his stickers.', 'غادر مسرعًا ومعه ملصقاته.']
    },

    // =================== MONEY LAUNDERERS ===================
    // Guards and IT rarely meet launderers: they get one believable case each (M10 at the gate,
    // M9 on app support), plus extra insiders and genuine visitors instead.
    {
      id: 'M1', role: 'launderer', level: 1, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Nasser', 'ناصر'], age: 26, v: { robe: '#e9e4d8', cap: '#fbfaf5', capPat: '#86690b', mouth: 'smile', brows: 'happy', prop: 'bag' } },
      claim: ['a customer making a deposit', 'عميل يريد الإيداع'],
      arrive: ['A young man drops a heavy sports bag on the counter and smiles.', 'يضع شابٌّ حقيبة رياضية ثقيلة على الشبّاك ويبتسم.'],
      open: ['Salam! I want to deposit 9,800 OMR cash. Can you [[split it into a few small deposits]] so [[nobody asks about it]]?', 'السلام عليكم! أبي أودع 9,800 ر.ع كاش. ممكن [[تقسمها على كم إيداع صغير]] عشان [[محد يسأل عنها]]؟'],
      card: { title: ['Deposit slip', 'قسيمة إيداع'], rows: [[['Account', 'الحساب'], ['Nasser K.', 'ناصر ك.']], [['Amount', 'المبلغ'], ['9,800 OMR cash', '9,800 ر.ع نقدًا'], 1], [['Salary', 'الراتب'], ['450 OMR / month', '450 ر.ع شهريًا'], 1]] },
      acts: {
        source: { say: ['From my uncle\'s business. [[No papers]], it\'s family money.', 'من تجارة عمي. [[ما في أوراق]]، فلوس عائلة.'], reveal: [[['Source documents', 'مستندات المصدر'], ['None', 'لا يوجد'], 1]] },
        id: ['Here\'s my ID. It\'s my account, all normal.', 'هذي بطاقتي. حسابي، كل شي عادي.'],
        purpose: ['Tomorrow I\'ll [[send it all abroad]] to a friend.', 'باكر [[بحوّلها كلها برا]] لصديق.'],
        system: { say: ['Why check? It\'s my own money.', 'ليش تتحقق؟ هذي فلوسي.'], reveal: [[['Last month', 'الشهر الماضي'], ['6 cash deposits, all just under 2,000', '6 إيداعات نقدية، كلها أقل بقليل من 2,000'], 1]] },
        why: ['I just don\'t like [[questions from the bank]].', 'بس ما أحب [[أسئلة البنك]].'],
        policy: ['Fine, I\'ll [[split it across three branches]] myself.', 'خلاص، [[بقسمها على ثلاث فروع]] بنفسي.']
      },
      flags: [['Asked to split the cash so it isn\'t noticed', 'طلب تقسيم النقود كي لا تُلاحَظ'], ['No proof where the money came from', 'لا إثبات لمصدر الأموال'], ['Cash far above his salary, going abroad', 'نقود تفوق راتبه بكثير وستُحوَّل إلى الخارج']],
      key: ['Wanted to split cash to avoid checks', 'أراد تقسيم النقود للتهرّب من التدقيق'],
      sum: ['He wanted to hide where a bag of cash came from by splitting it up.', 'أراد إخفاء مصدر حقيبة من النقود بتقسيمها.'],
      exit: ['Never mind, I\'ll try another bank.', 'خلاص، بجرب بنك ثاني.']
    },
    {
      id: 'M2', role: 'launderer', level: 2, jobs: ['rm', 'ops'], channel: 'email', place: 'rmdesk',
      who: { base: 'polo', name: ['Tariq', 'طارق'], age: 32, v: { shirt: '#3b2f4a', collar: '#4c3d5f', glasses: 'clear', beard: true, mouth: 'smile', brows: 'happy' } },
      claim: ['a trading company owner', 'صاحب شركة تجارية'],
      line: ['tariq@ghd-trading.com', 'tariq@ghd-trading.com'],
      open: ['Dear RM, my company will receive [[40 transfers from people abroad]] this week. Please send each one on to these accounts [[the same day]].', 'عزيزي مدير العلاقات، شركتي بيوصلها [[40 تحويل من ناس برا]] هالأسبوع. لو سمحت حوّل كل واحد منها لهالحسابات [[بنفس اليوم]].'],
      card: { title: ['Client file', 'ملف العميل'], rows: [[['Company', 'الشركة'], ['GHD Trading LLC', 'GHD للتجارة']], [['Account opened', 'تاريخ فتح الحساب'], ['2 months ago', 'قبل شهرين'], 1], [['Business', 'النشاط'], ['"General trading"', '"تجارة عامة"']]] },
      acts: {
        purpose: ['It\'s [[consulting fees]]. Very normal in our business.', 'هذي [[رسوم استشارات]]. عادي في شغلنا.'],
        letter: { say: ['Invoices? I\'ll write some [[tonight]].', 'فواتير؟ بكتب كم وحدة [[الليلة]].'], reveal: [[['Invoices', 'الفواتير'], ['None on file', 'لا شيء في الملف'], 1]] },
        who: ['The senders? Just [[people I know]] online.', 'المرسلين؟ بس [[ناس أعرفهم]] أونلاين.'],
        system: { say: ['Everything is legal, I promise.', 'كل شي قانوني، أوعدك.'], reveal: [[['Money in / out', 'الوارد / الصادر'], ['Leaves within hours', 'يخرج خلال ساعات'], 1]] },
        callback: ['Sure, call me. But please [[don\'t slow it down]].', 'أكيد اتصل. بس لو سمحت [[لا تأخرها]].'],
        policy: ['Other banks [[don\'t ask so much]].', 'البنوك الثانية [[ما تسأل كذا]].']
      },
      flags: [['Many transfers from strangers abroad', 'تحويلات كثيرة من غرباء في الخارج'], ['Money passed on the same day', 'الأموال تُحوَّل في اليوم نفسه'], ['No invoices or real business reason', 'لا فواتير ولا سبب تجاري حقيقي']],
      key: ['Money in and straight out, no business reason', 'أموال تدخل وتخرج فورًا بلا سبب تجاري'],
      sum: ['He used a new company to pass dirty money through the bank.', 'استخدم شركة جديدة لتمرير أموال مشبوهة عبر البنك.'],
      exit: ['The company closed its account a week later.', 'أغلقت الشركة حسابها بعد أسبوع.']
    },
    {
      id: 'M3', role: 'launderer', level: 2, jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'shayla', name: ['Muna', 'منى'], age: 21, v: { cloth: '#c9e7f5', dots: '#c8423a', prop: 'phone', brows: 'worried', mouth: 'flat' } },
      claim: ['a student customer', 'طالبة جامعية'],
      arrive: ['A young student hurries in, looking at her phone.', 'تدخل طالبة شابة مسرعة وعيناها على هاتفها.'],
      open: ['Hi! Money came into my account from [[a man I met online]]. He says to [[withdraw it in cash]] and give it to his friend outside.', 'هلا! نزلت فلوس في حسابي من [[رجّال تعرفت عليه أونلاين]]. يقول [[أسحبها كاش]] وأعطيها لصديقه برا.'],
      card: { title: ['Customer record', 'سجلّ العميلة'], rows: [[['Account', 'الحساب'], ['Muna S. · student', 'منى س. · طالبة']], [['Received today', 'الوارد اليوم'], ['4,200 OMR', '4,200 ر.ع'], 1], [['From', 'من'], ['Unknown sender', 'مرسِل غير معروف'], 1]] },
      acts: {
        who: ['I don\'t really know him. He [[pays me 200]] for helping.', 'ما أعرفه زين. [[يعطيني 200]] على المساعدة.'],
        source: { say: ['He said it\'s from his business. [[I didn\'t ask]].', 'قال من تجارته. [[ما سألت]].'], reveal: [[['Sender', 'المرسِل'], ['Reported as a fraud victim', 'مُبلَّغ عنه بوصفه ضحية احتيال'], 1]] },
        id: ['Here\'s my student card and civil ID.', 'هذي بطاقة الجامعة والبطاقة الشخصية.'],
        why: ['His friend is [[waiting outside]] right now!', 'صديقه [[ينتظر برا]] الحين!'],
        policy: ['But it\'s in MY account, so it\'s mine, right?', 'بس هي في حسابي، يعني حقي، صح؟'],
        system: { say: ['Is something wrong?', 'في شي غلط؟'], reveal: [[['Usual balance', 'الرصيد المعتاد'], ['Under 100 OMR', 'أقل من 100 ر.ع']]] }
      },
      flags: [['Strangers paying into her account', 'غرباء يحوّلون الأموال إلى حسابها'], ['Paid a fee to pass cash on', 'تتقاضى عمولة لتمرير النقود'], ['Cash handed to someone outside', 'تُسلَّم النقود لشخص في الخارج']],
      key: ['Her account was used to move stolen money', 'استُخدم حسابها لنقل أموال مسروقة'],
      sum: ['She was being used as a money mule to wash stolen money.', 'كانت تُستخدم وسيطةً لغسل أموال مسروقة.'],
      exit: ['I didn\'t know it was illegal…', 'ما كنت أدري إنها مخالفة…'], exitNote: ['(the bank helped her report it)', '(ساعدها البنك على الإبلاغ)']
    },
    {
      id: 'M4', role: 'launderer', level: 3, jobs: ['ceo', 'reception', 'rm'], channel: 'person', place: 'exec',
      who: { base: 'dish', name: ['Majid', 'ماجد'], age: 34, v: { headwear: 'massar', cap: '#7a2a2a', capPat: '#e6c95a', capBand: '#fbfaf5', glasses: true, mouth: 'smile', brows: 'happy', prop: 'folder' } },
      claim: ['an investor', 'مستثمر'],
      arrive: ['A well-dressed man arrives for a booked meeting with a thick folder.', 'يصل رجل أنيق إلى موعد محجوز ومعه ملف سميك.'],
      open: ['I want to invest 2 million OMR through [[three companies in different countries]]. The real owner prefers [[to stay anonymous]].', 'أبي أستثمر 2 مليون ر.ع عن طريق [[ثلاث شركات في دول مختلفة]]. المالك الحقيقي يفضّل [[يظل مجهول]].'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Majid H.', 'ماجد ح.']], [['Investment', 'الاستثمار'], ['2,000,000 OMR', '2,000,000 ر.ع'], 1], [['Real owner', 'المالك الحقيقي'], ['Not disclosed', 'غير مُعلَن'], 1]] },
      acts: {
        appt: { say: ['Yes, 11 o\'clock, it\'s booked.', 'إيه، الساعة 11، محجوز.'], reveal: [[['Appointment', 'الموعد'], ['11:00 · booked ✓', '11:00 · محجوز ✓']]] },
        who: ['The owner is a [[private person]]. Names are not needed.', 'المالك [[شخص خاص]]. ما يحتاج أسماء.'],
        source: { say: ['From… various businesses. [[Paperwork takes time]].', 'من… تجارات متنوعة. [[الأوراق تاخذ وقت]].'], reveal: [[['Source of wealth', 'مصدر الثروة'], ['Not shown', 'غير موضّح'], 1]] },
        letter: ['The company papers are with a lawyer in another country.', 'أوراق الشركات عند محامي في دولة ثانية.'],
        why: ['We want it done [[before the year ends]].', 'نبيها تخلص [[قبل نهاية السنة]].'],
        policy: ['Then we\'ll take our money to a bank that [[asks fewer questions]].', 'أجل بنودي فلوسنا لبنك [[يسأل أقل]].']
      },
      flags: [['Hidden real owner', 'المالك الحقيقي مخفي'], ['Money layered through companies in many countries', 'الأموال تمرّ عبر شركات في دول عديدة'], ['No proof of source of wealth', 'لا إثبات لمصدر الثروة']],
      key: ['Anonymous owner, money hidden behind companies', 'مالك مجهول وأموال مخفية خلف شركات'],
      sum: ['He wanted to hide who really owned the money behind companies abroad.', 'أراد إخفاء المالك الحقيقي للأموال خلف شركات في الخارج.'],
      exit: ['Our lawyer will be in touch.', 'المحامي بيتواصل معكم.']
    },
    {
      id: 'M5', role: 'launderer', level: 2, jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Sultan', 'سلطان'], age: 28, v: { shirt: '#2b2b2b', collar: '#444444', mustache: true, mouth: 'flat' } },
      claim: ['a customer paying off his car loan', 'عميل يريد سداد قرض سيارته'],
      line: ['+968 9••• ••61 · registered', '+968 9••• ••61 · رقم مسجّل'],
      open: ['I want to pay off my car loan today, 14,000 OMR [[in cash]]. [[A friend will bring it]] to the branch for me.', 'أبي أسدد قرض السيارة اليوم، 14,000 ر.ع [[كاش]]. [[صديقي بيجيبها]] للفرع عني.'],
      card: { title: ['Loan account', 'حساب القرض'], rows: [[['Customer', 'العميل'], ['Sultan A.', 'سلطان أ.']], [['Left to pay', 'المتبقي'], ['14,000 OMR', '14,000 ر.ع']], [['Salary', 'الراتب'], ['700 OMR / month', '700 ر.ع شهريًا'], 1]] },
      acts: {
        source: { say: ['I [[won it]]… playing cards. It\'s fine.', '[[ربحتها]]… في لعب ورق. عادي.'], reveal: [[['Source of funds', 'مصدر الأموال'], ['No proof', 'بلا إثبات'], 1]] },
        secq: { say: ['Sure. Born 1998, mother Salma.', 'أكيد. مواليد 1998، والوالدة سلمى.'], reveal: [[['Security answers', 'إجابات الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        who: ['My friend\'s name? Why? [[Just take the cash]].', 'اسم صديقي؟ ليش؟ [[بس خذ الكاش]].'],
        purpose: ['Then next month I want a [[new loan]] and pay it off again.', 'وبعدين الشهر الجاي أبي [[قرض جديد]] وأسدده بعد.'],
        branch: ['I won\'t come myself, I\'m busy.', 'ما بجي بنفسي، أنا مشغول.'],
        policy: ['Cash is cash. [[Why does it matter]] where it\'s from?', 'الكاش كاش. [[شو يهم]] من وين؟']
      },
      flags: [['Big cash payment far above his salary', 'دفعة نقدية كبيرة تفوق راتبه بكثير'], ['Someone else brings the cash', 'شخص آخر يُحضر النقود'], ['Can\'t explain where the money came from', 'عاجز عن تفسير مصدر الأموال']],
      key: ['Cash loan payoff he couldn\'t explain', 'سداد قرض نقدًا دون تفسير'],
      sum: ['He wanted to clean dirty cash by using it to pay off a loan.', 'أراد غسل نقود مشبوهة باستخدامها في سداد قرض.'],
      exit: ['Forget it. I\'ll pay the normal way.', 'خلاص. بدفع بالطريقة العادية.']
    },
    {
      id: 'M6', role: 'launderer', level: 3, jobs: ['rm', 'teller'], channel: 'person', place: 'rmdesk',
      who: { base: 'abaya', name: ['Asila', 'أصيلة'], age: 29, v: { sunglasses: true, cloth: '#1b1410', mouth: 'smile', prop: 'folder' } },
      claim: ['a customer selling gold', 'عميلة تبيع ذهبًا'],
      arrive: ['A woman in sunglasses opens a folder of gold receipts on your desk.', 'تفتح امرأة ترتدي نظارة شمسية ملفًا لإيصالات ذهب على مكتبك.'],
      open: ['I bought gold bars [[with cash]] yesterday and [[sold them this morning]]. Deposit this cheque and [[wire it to Dubai]] today, please.', 'اشتريت سبائك ذهب [[كاش]] أمس و[[بعتها الصبح]]. أودع هالشيك و[[حوّله لدبي]] اليوم لو سمحت.'],
      card: { title: ['Cheque deposit', 'إيداع شيك'], rows: [[['Customer', 'العميلة'], ['Asila R.', 'أصيلة ر.']], [['Cheque', 'الشيك'], ['61,000 OMR · gold dealer', '61,000 ر.ع · تاجر ذهب'], 1], [['Then', 'بعد ذلك'], ['Wire abroad today', 'تحويل إلى الخارج اليوم'], 1]] },
      acts: {
        source: { say: ['The cash? From [[relatives]]… they gave it to me.', 'الكاش؟ من [[الأهل]]… عطوني إياه.'], reveal: [[['Proof of cash', 'إثبات مصدر النقود'], ['None', 'لا يوجد'], 1]] },
        purpose: ['In Dubai? A [[company of a friend]], for business.', 'في دبي؟ [[شركة صديق]]، للتجارة.'],
        id: ['Sure, here\'s my ID.', 'أكيد، تفضل بطاقتي.'],
        why: ['Gold prices change fast, I needed to [[sell quickly]].', 'أسعار الذهب تتغير بسرعة، لازم [[أبيع بسرعة]].'],
        system: { say: ['All normal, no?', 'كل شي طبيعي، صح؟'], reveal: [[['Previous gold trades', 'صفقات ذهب سابقة'], ['3 this month, same pattern', '3 هذا الشهر بالنمط نفسه'], 1]] },
        policy: ['My gold dealer said [[banks don\'t check]] cheques like this.', 'تاجر الذهب قال [[البنوك ما تتحقق]] من شيكات مثل هذي.']
      },
      flags: [['Bought with cash, resold at once', 'شراء بالنقد ثم بيع فوري'], ['Money sent abroad the same day', 'تحويل الأموال إلى الخارج في اليوم نفسه'], ['Same pattern three times this month', 'تكرّر النمط ثلاث مرات هذا الشهر']],
      key: ['Cash turned into gold, then a clean-looking cheque', 'نقد تحوّل إلى ذهب ثم إلى شيك يبدو نظيفًا'],
      sum: ['She used gold trades to make dirty cash look like clean money.', 'استخدمت صفقات الذهب لتجعل النقود المشبوهة تبدو نظيفة.'],
      exit: ['I will deposit it somewhere else.', 'بودعه في مكان ثاني.']
    },
    {
      id: 'M7', role: 'launderer', level: 1, jobs: ['teller', 'ops'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Saud', 'سعود'], age: 20, v: { beard: false, robe: '#f4f1ea', cap: '#f6f0de', capPat: '#c8102e', mouth: 'smile', brows: 'happy' } },
      claim: ['a student making a deposit', 'طالب يريد الإيداع'],
      arrive: ['A young student puts a stack of notes on the counter. He was here yesterday too.', 'طالب شاب يضع رزمة نقود على الشبّاك، وقد كان هنا أمس أيضًا.'],
      open: ['Deposit 1,900 cash please. I\'m doing it [[in every branch this week]], so [[keep it under 2,000]].', 'أودع 1,900 كاش لو سمحت. أنا [[أودع في كل فرع هالأسبوع]]، فـ[[خلها أقل من 2,000]].'],
      card: { title: ['Deposit slip', 'قسيمة إيداع'], rows: [[['Account', 'الحساب'], ['Saud M. · student', 'سعود م. · طالب']], [['Amount', 'المبلغ'], ['1,900 OMR cash', '1,900 ر.ع نقدًا']]] },
      acts: {
        system: { say: ['Something wrong?', 'في شي؟'], reveal: [[['This week', 'هذا الأسبوع'], ['5 deposits of 1,900 in 5 branches', '5 إيداعات بقيمة 1,900 في 5 فروع'], 1]] },
        source: ['A man gives it to me. I [[keep 50 each time]].', 'رجّال يعطيني إياها. [[آخذ 50 كل مرة]].'],
        who: ['It\'s my account, but [[the money isn\'t mine]].', 'الحساب حقي، بس [[الفلوس مو حقي]].'],
        id: ['Here\'s my student card.', 'هذي بطاقة الجامعة.'],
        purpose: ['On Friday it all goes [[to his account]].', 'يوم الجمعة كلها تروح [[لحسابه]].'],
        policy: ['It\'s under 2,000, so [[no questions]], right?', 'هي أقل من 2,000، يعني [[ما في أسئلة]]، صح؟']
      },
      flags: [['Many deposits just under the limit', 'إيداعات كثيرة دون الحد بقليل'], ['Spread across different branches', 'موزّعة على فروع مختلفة'], ['The money belongs to someone else', 'الأموال تعود لشخص آخر']],
      key: ['Small deposits in many branches', 'إيداعات صغيرة في فروع كثيرة'],
      sum: ['He split someone else\'s cash into small deposits to avoid checks.', 'قسّم نقود شخص آخر إلى إيداعات صغيرة للتهرّب من التدقيق.'],
      exit: ['Okay… I\'ll tell him no.', 'طيب… بقول له لا.'], exitNote: ['(the bank reported the pattern)', '(أبلغ البنك عن هذا النمط)']
    },
    {
      id: 'M8', role: 'launderer', level: 3, jobs: ['ceo', 'rm', 'ops'], channel: 'email', place: 'exec',
      who: { base: 'polo', name: ['Rashid', 'راشد'], age: 36, v: { shirt: '#0b2547', collar: '#22385f', glasses: 'clear', beard: true, mouth: 'smile', brows: 'happy' } },
      claim: ['the head of a family fund', 'رئيس صندوق عائلي'],
      line: ['office@alnoor-familyfund.org', 'office@alnoor-familyfund.org'],
      open: ['We run a family charity fund. We will receive [[donations from many people abroad]] and pass them to [[another account]]. We are [[not registered]] yet.', 'إحنا ندير صندوق خيري عائلي. بيوصلنا [[تبرعات من ناس وايد برا]] ونحوّلها [[لحساب ثاني]]. [[ما سجّلنا]] للحين.'],
      card: { title: ['Account request', 'طلب فتح حساب'], rows: [[['Name', 'الاسم'], ['"Al Noor family fund"', '"صندوق النور العائلي"']], [['Registration', 'التسجيل'], ['None', 'لا يوجد'], 1], [['Expected', 'المتوقع'], ['300,000 OMR / month', '300,000 ر.ع شهريًا'], 1]] },
      acts: {
        letter: ['Registration papers [[take too long]]. Open it now.', 'أوراق التسجيل [[تاخذ وقت طويل]]. افتحوه الحين.'],
        who: ['The donors? [[Good people]], names are not important.', 'المتبرعين؟ [[ناس طيبين]]، الأسماء مو مهمة.'],
        purpose: ['For… projects. [[We decide later]].', 'لـ… مشاريع. [[نقرر بعدين]].'],
        source: { say: ['Donations, I told you.', 'تبرعات، قلت لك.'], reveal: [[['Charity register', 'سجلّ الجمعيات'], ['Not found', 'غير موجود'], 1]] },
        callback: ['Yes, call me. I\'m the only signatory.', 'إيه اتصل فيني. أنا المفوّض الوحيد.'],
        policy: ['A charity should be easy. [[Why so many questions]]?', 'الجمعيات المفروض سهلة. [[ليش كل هالأسئلة]]؟']
      },
      flags: [['Unregistered "charity"', '"جمعية خيرية" غير مسجّلة'], ['Unknown donors abroad, money passed on', 'متبرّعون مجهولون في الخارج وأموال تُمرَّر'], ['No clear purpose for the money', 'لا غرض واضح للأموال']],
      key: ['Fake charity with no paperwork', 'جمعية خيرية وهمية بلا أوراق'],
      sum: ['He used a "family fund" to move money with no names and no paperwork.', 'استخدم "صندوقًا عائليًا" لنقل أموال بلا أسماء ولا أوراق.'],
      exit: ['We will find another bank.', 'بنشوف بنك ثاني.']
    },
    {
      id: 'M9', role: 'launderer', level: 2, jobs: ['it', 'ops', 'teller'], channel: 'whatsapp', place: 'itdesk',
      who: { base: 'polo', name: ['Hamza', 'حمزة'], age: 21, v: { shirt: '#7a2a2a', collar: '#9a3a3a', glasses: 'clear', mouth: 'smile', brows: 'happy', prop: 'phone' } },
      claim: ['an app customer asking for support', 'عميل يطلب دعم التطبيق'],
      line: ['+968 7••• ••84 · registered', '+968 7••• ••84 · رقم مسجّل'],
      open: ['Hi app support! Please [[raise my transfer limit]] to 20,000. Friends [[online send me money]] and I pass it on [[abroad]].', 'هلا دعم التطبيق! لو سمحتوا [[ارفعوا حد التحويل]] لـ20,000. ربع [[أونلاين يرسلون لي فلوس]] وأنا أحوّلها [[برا]].'],
      card: { title: ['App account', 'حساب التطبيق'], rows: [[['Customer', 'العميل'], ['Hamza B. · student', 'حمزة ب. · طالب']], [['Current limit', 'الحد الحالي'], ['1,000 OMR / day', '1,000 ر.ع يوميًا']], [['Wants', 'يطلب'], ['20,000 OMR / day', '20,000 ر.ع يوميًا'], 1]] },
      acts: {
        who: ['I met them in a [[game chat]]. They pay me 5%.', 'تعرفت عليهم في [[قروب لعبة]]. يعطوني 5%.'],
        secq: { say: ['Born 2005, mother Aisha.', 'مواليد 2005، والوالدة عائشة.'], reveal: [[['Security answers', 'إجابات الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        system: { say: ['So can you do it?', 'يعني تقدرون؟'], reveal: [[['Last week', 'الأسبوع الماضي'], ['30 incoming, all sent abroad', '30 تحويلًا واردًا، أُرسلت كلها إلى الخارج'], 1]] },
        purpose: ['I don\'t know what it\'s for. [[Easy money]]!', 'ما أدري لأي شي. [[فلوس سهلة]]!'],
        ticket: ['Ticket number? I opened one in the app: APP-5521.', 'رقم التذكرة؟ فتحت وحدة في التطبيق: APP-5521.'],
        policy: ['Then I\'ll [[open accounts in other banks]].', 'أجل [[بفتح حسابات في بنوك ثانية]].']
      },
      flags: [['Strangers send him money to pass on', 'غرباء يرسلون إليه أموالًا لتمريرها'], ['Gets paid a percentage', 'يتقاضى نسبة مئوية'], ['Wants a huge limit to send abroad', 'يريد حدًّا ضخمًا للتحويل إلى الخارج']],
      key: ['Money mule asking for a bigger limit', 'وسيط أموال يطلب رفع الحد'],
      sum: ['He was a money mule recruited online, passing on dirty money.', 'كان وسيط أموال جُنِّد عبر الإنترنت لتمرير أموال مشبوهة.'],
      exit: ['Seriously? I thought it was a side job.', 'جد؟ حسبتها شغلة جانبية.'], exitNote: ['(the bank blocked the transfers)', '(أوقف البنك التحويلات)']
    },
    {
      id: 'M10', role: 'launderer', level: 1, jobs: ['guard', 'reception', 'rm'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Jaber', 'جابر'], age: 33, v: { shirt: '#2b3a55', collar: '#3b4f72', mustache: true, beard: true, mouth: 'smile', prop: 'bag' } },
      claim: ['a businessman with a cash bag', 'رجل أعمال يحمل حقيبة نقود'],
      arrive: ['A man with a heavy bag asks to go up to the relationship managers.', 'رجل يحمل حقيبة ثقيلة يطلب الصعود إلى مديري علاقات العملاء.'],
      open: ['I have [[30,000 cash]] for my company\'s account. Let me go straight up, and [[don\'t write my name]] in the book.', 'معي [[30,000 كاش]] لحساب شركتي. خلني أطلع على طول، و[[لا تكتب اسمي]] في الدفتر.'],
      card: { title: ['Gate', 'البوابة'], rows: [[['Visitor', 'الزائر'], ['Jaber (businessman)', 'جابر (رجل أعمال)']], [['Carrying', 'يحمل'], ['Bag of cash', 'حقيبة نقود'], 1]] },
      acts: {
        log: ['No need for the log. [[I prefer privacy]].', 'ما يحتاج السجل. [[أفضّل الخصوصية]].'],
        appt: { say: ['Appointment? They know me upstairs.', 'موعد؟ يعرفوني فوق.'], reveal: [[['RM appointments', 'مواعيد مديري العلاقات'], ['None for Jaber', 'لا شيء باسم جابر'], 1]] },
        source: ['From [[different customers]]. My company is… trading.', 'من [[زباين مختلفين]]. شركتي… تجارة.'],
        id: ['Here\'s my ID. But [[don\'t copy it]].', 'هذي بطاقتي. بس [[لا تصوّرها]].'],
        branch: ['The branch asks [[too many questions]]. Upstairs is easier.', 'الفرع [[يسأل وايد]]. فوق أسهل.'],
        wait: ['Fine, I\'ll wait. Call someone who [[can help quietly]].', 'خلاص بنتظر. نادِ أحد [[يقدر يساعد بهدوء]].']
      },
      flags: [['Bag of cash, no clear source', 'حقيبة نقود بلا مصدر واضح'], ['Asked to stay out of the visitor log', 'طلب عدم تسجيله في سجلّ الزوّار'], ['Avoided the branch and its checks', 'تجنّب الفرع وإجراءات التحقق فيه']],
      key: ['Cash with no source, wanted no record', 'نقود بلا مصدر ورغبة في عدم التسجيل'],
      sum: ['He wanted to push unexplained cash into the bank without any record.', 'أراد إدخال نقود مجهولة المصدر إلى البنك دون أي سجلّ.'],
      exit: ['Forget it. I\'ll come back another day.', 'خلاص، برجع يوم ثاني.']
    },
    {
      id: 'M11', role: 'launderer', level: 2, jobs: ['hr', 'reception'], channel: 'person', place: 'hroffice',
      who: { base: 'dish', name: ['Ibrahim', 'إبراهيم'], age: 25, v: { robe: '#eef0f2', cap: '#f6f0de', capPat: '#00843d', glasses: true, mouth: 'smile', brows: 'happy' } },
      claim: ['a new employee', 'موظف جديد'],
      arrive: ['A new employee you met at induction comes in holding a salary letter.', 'موظف جديد التقيته في برنامج التهيئة يدخل حاملًا خطاب راتب.'],
      open: ['Can you write me a salary letter for [[4,000 a month]], not 600? I need to [[explain some cash]] I\'m depositing.', 'ممكن تكتب لي خطاب راتب بـ[[4,000 بالشهر]] مو 600؟ أحتاج [[أبرّر كاش]] بودعه.'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Ibrahim K. · new joiner', 'إبراهيم ك. · موظف جديد']], [['Real salary', 'الراتب الفعلي'], ['600 OMR', '600 ر.ع']], [['Wants letter for', 'يريد خطابًا بمبلغ'], ['4,000 OMR', '4,000 ر.ع'], 1]] },
      acts: {
        source: ['The cash is from… [[a friend\'s business]]. Big amounts.', 'الكاش من… [[تجارة صديق]]. مبالغ كبيرة.'],
        why: ['The bank keeps asking [[where the money comes from]].', 'البنك كل شوي يسأل [[من وين الفلوس]].'],
        manager: ['Don\'t involve my manager, [[just a letter]].', 'لا تدخّل مديري، [[بس خطاب]].'],
        system: { say: ['You\'ll see I\'m real staff.', 'بتشوف إني موظف حقيقي.'], reveal: [[['Staff record', 'سجلّ الموظف'], ['Ibrahim K. · 600 OMR', 'إبراهيم ك. · 600 ر.ع']], [['Cash deposits', 'الإيداعات النقدية'], ['22,000 OMR in 2 months', '22,000 ر.ع خلال شهرين'], 1]] },
        official: ['A form takes a week. [[Stamp it today]].', 'الاستمارة تاخذ أسبوع. [[اختمه اليوم]].'],
        policy: ['Everyone [[rounds up a little]]. Help me.', 'الكل [[يزوّد شوي]]. ساعدني.']
      },
      flags: [['Wanted a fake salary letter', 'أراد خطاب راتب مزوّرًا'], ['To explain cash he cannot justify', 'لتبرير نقود لا يستطيع تفسيرها'], ['22,000 OMR cash in two months', '22,000 ر.ع نقدًا خلال شهرين']],
      key: ['Fake salary letter to hide cash', 'خطاب راتب مزوّر لإخفاء النقود'],
      sum: ['He wanted a fake salary letter to make dirty cash look like income.', 'أراد خطاب راتب مزوّرًا ليُظهر النقود المشبوهة دخلًا مشروعًا.'],
      exit: ['Okay, okay. Forget it.', 'طيب طيب، انسَ الموضوع.']
    },
    {
      id: 'M12', role: 'launderer', level: 3, jobs: ['ops', 'ceo', 'rm'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Kawthar', 'كوثر'], age: 34, v: { sunglasses: false, cloth: '#3b2f4a', mouth: 'smile', prop: 'laptop' } },
      claim: ['an import company manager', 'مديرة شركة استيراد'],
      line: ['kawthar@bluewave-imports.com', 'kawthar@bluewave-imports.com'],
      open: ['Please pay our supplier 480,000 OMR for [[200 used phones]]. Ship them to [[a third country]], not to Oman. [[Pay today]].', 'لو سمحتوا ادفعوا للمورّد 480,000 ر.ع مقابل [[200 تلفون مستعمل]]. الشحنة [[تروح لدولة ثالثة]]، مو لعُمان. [[ادفعوا اليوم]].'],
      card: { title: ['Trade payment', 'دفعة تجارية'], rows: [[['Goods', 'البضاعة'], ['200 used phones', '200 هاتف مستعمل']], [['Price', 'السعر'], ['480,000 OMR', '480,000 ر.ع'], 1], [['Ship to', 'الشحن إلى'], ['Third country', 'دولة ثالثة'], 1]] },
      acts: {
        letter: { say: ['The invoice is attached.', 'الفاتورة مرفقة.'], reveal: [[['Price per phone', 'سعر الهاتف الواحد'], ['2,400 OMR (market: ~60)', '2,400 ر.ع (سعر السوق نحو 60)'], 1]] },
        purpose: ['These are… [[special phones]]. Very rare.', 'هذي… [[تلفونات خاصة]]. نادرة وايد.'],
        who: ['The supplier is [[my cousin\'s company]].', 'المورّد [[شركة ولد عمي]].'],
        why: ['The ship leaves tomorrow. [[No time for checks]].', 'السفينة تطلع باكر. [[ما في وقت للتدقيق]].'],
        system: { say: ['We are a big client!', 'إحنا عميل كبير!'], reveal: [[['Past shipments', 'شحنات سابقة'], ['Same goods, same price, 4 times', 'البضاعة والسعر نفسهما 4 مرات'], 1]] },
        policy: ['Just process it, [[my manager approved]].', 'بس نفّذوها، [[مديري موافق]].']
      },
      flags: [['Price far above the real value', 'سعر يفوق القيمة الحقيقية بكثير'], ['Goods never reach Oman', 'البضاعة لا تصل إلى عُمان أبدًا'], ['Supplier is a relative\'s company', 'المورّد شركة قريب']],
      key: ['Invoices that don\'t match the goods', 'فواتير لا تطابق البضاعة'],
      sum: ['She used over-priced trade invoices to move dirty money abroad.', 'استخدمت فواتير تجارية مضخّمة لنقل أموال مشبوهة إلى الخارج.'],
      exit: ['We will use another bank.', 'بنتعامل مع بنك ثاني.']
    },
    {
      id: 'M13', role: 'launderer', level: 3, jobs: ['hr', 'reception', 'ceo'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Ziyad', 'زياد'], age: 35, v: { shirt: '#1b2a44', collar: '#2b3f66', glasses: 'mirror', beard: true, mouth: 'smile', brows: 'happy', prop: 'bag' } },
      claim: ['a sponsor for the Youth Day prizes', 'راعٍ لجوائز يوم الشباب'],
      arrive: ['A smiling businessman offers to sponsor the Youth Day prizes.', 'رجل أعمال مبتسم يعرض رعاية جوائز يوم الشباب.'],
      open: ['I want to sponsor your Youth Day prizes: [[25,000 in cash]]. I only need a [[thank-you letter on bank paper]] saying it came from my company.', 'أبي أرعى جوائز يوم الشباب عندكم: [[25,000 كاش]]. بس أحتاج [[خطاب شكر على ورق البنك]] إنها من شركتي.'],
      card: { title: ['Sponsorship', 'رعاية'], rows: [[['Sponsor', 'الراعي'], ['Ziyad · "Z Holdings"', 'زياد · "زد القابضة"']], [['Amount', 'المبلغ'], ['25,000 OMR cash', '25,000 ر.ع نقدًا'], 1]] },
      acts: {
        source: ['From my companies… [[the details are private]].', 'من شركاتي… [[التفاصيل خاصة]].'],
        letter: ['The letter is the important part. [[Date it last year]].', 'الخطاب هو المهم. [[حط تاريخه السنة الماضية]].'],
        manager: ['No need for the CEO, [[HR can sign]].', 'ما يحتاج الرئيس التنفيذي، [[الموارد تقدر توقّع]].'],
        system: { say: ['Check, check.', 'تحقق، تحقق.'], reveal: [[['Z Holdings', 'زد القابضة'], ['Registered last month', 'سُجّلت الشهر الماضي'], 1]] },
        official: ['A bank transfer? No, [[cash only]].', 'تحويل بنكي؟ لا، [[كاش بس]].'],
        why: ['I love supporting [[the youth]]!', 'أحب أدعم [[الشباب]]!']
      },
      flags: [['Large cash "donation"', '"تبرّع" نقدي كبير'], ['Wanted an official letter, back-dated', 'أراد خطابًا رسميًا بتاريخ سابق'], ['Brand-new company, refused a transfer', 'شركة حديثة جدًا ورفض التحويل البنكي']],
      key: ['Cash "sponsorship" to get an official letter', '"رعاية" نقدية للحصول على خطاب رسمي'],
      sum: ['He wanted a bank letter to make dirty cash look like a clean donation.', 'أراد خطابًا من البنك ليُظهر النقود المشبوهة تبرّعًا مشروعًا.'],
      exit: ['Your loss. Other banks will accept.', 'خسارتكم. البنوك الثانية بتقبل.']
    },

    // =================== INSIDERS (real colleagues breaking the rules) ===================
    {
      id: 'I1', role: 'insider', level: 1, jobs: ['guard', 'reception'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Ali', 'علي'], age: 26, v: { shirt: '#1d5694', collar: '#2563a6', badge: 'STAFF', lanyard: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague from IT', 'زميل من فريق التقنية'],
      arrive: ['A colleague you know from IT walks up, with a friend behind him.', 'يقترب زميل تعرفه من فريق التقنية ومعه صديق يمشي خلفه.'],
      open: ['Morning! This is my cousin. Let him in [[without signing the log]], he just wants to [[see our server room]].', 'صباح الخير! هذا ولد عمي. دخّله [[بدون ما يوقّع بالسجل]]، بس يبي [[يشوف غرفة الخوادم]].'],
      card: { title: ['Gate', 'البوابة'], rows: [[['Staff', 'الموظف'], ['Ali N. · IT', 'علي ن. · التقنية']], [['Guest', 'الضيف'], ['Cousin · no pass', 'ابن عمه · بلا تصريح'], 1]] },
      acts: {
        badge: { say: ['Of course, here\'s my badge.', 'أكيد، هذي بطاقتي.'], reveal: [[['Staff badge', 'بطاقة الموظف'], ['Ali N. · IT · valid ✓', 'علي ن. · التقنية · سارية ✓']]] },
        log: ['The log? [[No need]], he\'s with me.', 'السجل؟ [[ما يحتاج]]، هو معي.'],
        manager: ['Don\'t tell my manager, [[it\'s just a quick visit]].', 'لا تقول لمديري، [[زيارة سريعة بس]].'],
        why: ['He\'s thinking of working in IT. [[Just between us]].', 'يفكر يشتغل في التقنية. [[بيني وبينك]].'],
        policy: ['Come on, we\'re colleagues. [[Do me a favour]].', 'يلا، إحنا زملاء. [[سوّ لي هالخدمة]].'],
        wait: ['Fine, he\'ll wait. Or I\'ll just [[lend him my badge]].', 'خلاص، بينتظر. ولا [[بعطيه بطاقتي]] وخلاص.']
      },
      flags: [['Wanted a guest in without signing in', 'أراد إدخال ضيف دون تسجيل'], ['Asked you to hide it from his manager', 'طلب إخفاء الأمر عن مديره'], ['Offered to lend his badge', 'عرض إعارة بطاقته']],
      key: ['Real colleague breaking the access rules', 'زميل حقيقي يخالف قواعد الدخول'],
      sum: ['A real colleague who tried to sneak an outsider into a secure area.', 'زميل حقيقي حاول إدخال شخص من الخارج إلى منطقة محمية.'],
      exit: ['Okay, okay. I\'ll get him a visitor pass.', 'طيب طيب. بطلع له تصريح زائر.']
    },
    {
      id: 'I2', role: 'insider', level: 1, jobs: ['teller', 'ops', 'it'], channel: 'internal', place: 'ops',
      who: { base: 'dish', name: ['Hamood', 'حمود'], age: 33, v: { beard: true, cap: '#f6f0de', capPat: '#1d5694', mouth: 'smile', brows: 'happy', glasses: true } },
      claim: ['your senior colleague', 'زميلك الأقدم'],
      line: ['Hamood R. · Operations · online', 'حمود ر. · العمليات · متصل'],
      open: ['Hey, I\'m locked out again. Can you [[send me your password]]? I just need to [[approve one payment]] on your login.', 'هلا، انقفل حسابي مرة ثانية. ممكن [[ترسل لي كلمة المرور حقك]]؟ بس أبي [[أوافق على دفعة وحدة]] من حسابك.'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['From', 'من'], ['Hamood R. · Operations', 'حمود ر. · العمليات']], [['Wants', 'يطلب'], ['Your password', 'كلمة مرورك'], 1]] },
      acts: {
        otp: ['Relax, [[everyone shares]] here. It\'s only me.', 'روّق، [[الكل يشارك]] هني. هذا أنا بس.'],
        ticket: ['A ticket takes an hour. [[The client can\'t wait]].', 'التذكرة تاخذ ساعة. [[العميل ما يقدر ينتظر]].'],
        manager: ['Don\'t bother the manager, [[he\'ll say no]].', 'لا تزعج المدير، [[بيرفض]].'],
        system: { say: ['Come on…', 'يلا…'], reveal: [[['Chat account', 'حساب المحادثة'], ['Hamood R. · real staff ✓', 'حمود ر. · موظف حقيقي ✓']], [['Payment', 'الدفعة'], ['To his brother\'s company', 'إلى شركة أخيه'], 1]] },
        what: ['Just one transfer, to my [[brother\'s company]].', 'بس تحويل واحد، لـ[[شركة أخوي]].'],
        policy: ['Fine. I\'ll remember this when [[you need a favour]].', 'خلاص. بتذكرها لما [[تحتاج خدمة]].']
      },
      flags: [['Asked for your password', 'طلب كلمة مرورك'], ['Payment to his own brother\'s company', 'دفعة إلى شركة أخيه'], ['Skipped the ticket and the manager', 'تجاوز التذكرة والمدير']],
      key: ['Wanted your password to pay his brother\'s company', 'أراد كلمة مرورك ليدفع لشركة أخيه'],
      sum: ['A real colleague trying to use your login to pay his own family.', 'زميل حقيقي يحاول استخدام حسابك للدفع لعائلته.'],
      exit: ['… Forget I asked.', '… انسَ إني سألت.']
    },
    {
      id: 'I3', role: 'insider', level: 1, jobs: ['hr'], channel: 'person', place: 'hroffice',
      who: { base: 'abaya', name: ['Zahra', 'زهرة'], age: 30, v: { sunglasses: false, cloth: '#2a2236', mouth: 'smile', mole: false, prop: null } },
      claim: ['a team leader', 'قائدة فريق'],
      arrive: ['A team leader from another floor sits down at your desk, smiling.', 'تجلس قائدة فريق من طابق آخر عند مكتبك مبتسمة.'],
      open: ['Quick favour! Can you show me [[my colleague\'s salary]]? And [[raise my friend\'s interview score]] a little?', 'خدمة سريعة! ممكن تشوّفني [[راتب زميلتي]]؟ و[[ترفع درجة صديقتي]] في المقابلة شوي؟'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Zahra M. · team leader', 'زهرة م. · قائدة فريق']], [['Wants', 'تطلب'], ['Salary file + score change', 'ملف راتب وتعديل درجة'], 1]] },
      acts: {
        why: ['I\'m just [[curious]]. And my friend really needs the job.', 'بس [[فضول]]. وصديقتي محتاجة الوظيفة.'],
        manager: ['No need to ask [[anyone]]. Five seconds!', 'ما يحتاج تسأل [[أحد]]. خمس ثواني!'],
        badge: { say: ['You know me!', 'أنت تعرفني!'], reveal: [[['Staff', 'الموظفة'], ['Zahra M. · real ✓', 'زهرة م. · حقيقية ✓']], [['Access to salaries', 'صلاحية الاطلاع على الرواتب'], ['None', 'لا يوجد'], 1]] },
        official: ['A form? Then [[everyone will know]].', 'استمارة؟ أجل [[الكل بيدري]].'],
        policy: ['Don\'t be so strict. [[Nobody will check]].', 'لا تصير شديد. [[محد بيتحقق]].'],
        what: ['Just the salary and the score. [[Keep it quiet]].', 'بس الراتب والدرجة. [[خلها سر]].']
      },
      flags: [['Wanted a colleague\'s private salary', 'أرادت الاطلاع على راتب زميلتها'], ['Asked you to change an interview score', 'طلبت تعديل درجة مقابلة'], ['Secrecy: "keep it quiet"', 'السرّية: "خلّها سرًّا"']],
      key: ['Asked to see salaries and fix a score', 'طلبت الاطلاع على رواتب وتعديل درجة'],
      sum: ['A real colleague asking you to break HR rules for a friend.', 'زميلة حقيقية تطلب منك مخالفة قواعد الموارد البشرية من أجل صديقتها.'],
      exit: ['Fine… I was only joking.', 'خلاص… كنت أمزح بس.']
    },
    {
      id: 'I4', role: 'insider', level: 1, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'shayla', name: ['Salma', 'سلمى'], age: 27, v: { cloth: '#d6c2ef', dots: '#fbfaf5', prop: null, mouth: 'smile' } },
      claim: ['your colleague at the next counter', 'زميلتك في الشبّاك المجاور'],
      arrive: ['Your colleague from the next counter leans over and whispers.', 'تميل زميلتك من الشبّاك المجاور نحوك وتهمس.'],
      open: ['Psst! A famous singer banks here. Can you [[look up her balance]]? [[Just a peek]], for fun!', 'بسس! مغنية مشهورة تتعامل معانا. ممكن [[تشوف رصيدها]]؟ [[نظرة بس]]، للضحك!'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Salma · teller', 'سلمى · أمينة صندوق']], [['Wants', 'تطلب'], ['A customer\'s balance', 'رصيد عميلة'], 1]] },
      acts: {
        why: ['No reason! I just [[want to know]].', 'بدون سبب! بس [[أبي أعرف]].'],
        policy: ['Nobody will know. [[The system doesn\'t log it]].', 'محد بيدري. [[النظام ما يسجّل]].'],
        system: { say: ['See? Easy.', 'شفت؟ سهلة.'], reveal: [[['Every account lookup', 'كل بحث في الحسابات'], ['Logged with your name', 'يُسجَّل باسمك'], 1]] },
        manager: ['Don\'t tell the manager! [[It\'s nothing]].', 'لا تقول للمدير! [[ما في شي]].'],
        who: ['Not on my screen. [[Use your login]], mine is slow.', 'مو من شاشتي. [[استخدم حسابك]]، حسابي بطيء.'],
        what: ['Her balance, and her [[phone number]] too.', 'رصيدها، و[[رقم تلفونها]] بعد.']
      },
      flags: [['Snooping on a customer\'s account', 'تتجسّس على حساب عميلة'], ['Wanted you to use your login', 'أرادتك أن تستخدم حسابك'], ['Wanted her phone number too', 'أرادت رقم هاتفها أيضًا']],
      key: ['Wanted to snoop on a customer\'s account', 'أرادت التجسّس على حساب عميلة'],
      sum: ['A real colleague who wanted to snoop on a famous customer\'s data.', 'زميلة حقيقية أرادت التجسّس على بيانات عميلة مشهورة.'],
      exit: ['Ugh, you\'re no fun.', 'أوف، ما عندك روح مرحة.']
    },
    {
      id: 'I5', role: 'insider', level: 2, jobs: ['ceo', 'ops'], channel: 'phone', place: 'exec',
      who: { base: 'polo', name: ['Khalfan', 'خلفان'], age: 35, v: { shirt: '#0b2547', collar: '#22385f', glasses: 'clear', mustache: true, beard: true, mouth: 'flat', brows: 'stern' } },
      claim: ['a senior manager', 'مدير أول'],
      line: ['Ext. 4410 · Finance', 'تحويلة 4410 · الإدارة المالية'],
      open: ['Approve this supplier contract today and [[skip the second approval]]. Oh, the supplier is [[my wife\'s company]].', 'وافق على عقد المورد هذا اليوم و[[تجاوز الموافقة الثانية]]. وبالمناسبة المورد [[شركة زوجتي]].'],
      card: { title: ['Contract', 'العقد'], rows: [[['From', 'من'], ['Khalfan · Finance', 'خلفان · الإدارة المالية']], [['Supplier', 'المورّد'], ['New · family link', 'جديد · صلة عائلية'], 1], [['Approvals', 'الموافقات'], ['1 of 2', '1 من 2'], 1]] },
      acts: {
        manager: ['I AM the manager. [[Don\'t involve the CEO]].', 'أنا المدير. [[لا تدخّل الرئيس التنفيذي]].'],
        official: ['A tender takes months. [[This is faster]].', 'المناقصة تاخذ شهور. [[كذا أسرع]].'],
        why: ['The budget ends this month. [[Use it or lose it]].', 'الميزانية تخلص هالشهر. [[إما نستخدمها أو تروح]].'],
        system: { say: ['Just sign.', 'بس وقّع.'], reveal: [[['Caller', 'المتصل'], ['Khalfan · real manager ✓', 'خلفان · مدير حقيقي ✓']], [['Conflict of interest form', 'نموذج تضارب المصالح'], ['Not declared', 'غير مُفصَح عنه'], 1]] },
        policy: ['Think about your [[next promotion]].', 'فكّر في [[ترقيتك الجاية]].'],
        confirm: ['Calling compliance will [[only cause trouble]].', 'الاتصال بالامتثال [[بس بيسبب مشاكل]].']
      },
      flags: [['Contract for his own wife\'s company', 'عقد لشركة زوجته'], ['Wanted to skip the second approval', 'أراد تجاوز الموافقة الثانية'], ['Hinted at your promotion', 'لمّح إلى ترقيتك']],
      key: ['Conflict of interest, skipped approval', 'تضارب مصالح وتجاوز للموافقة'],
      sum: ['A real manager pushing a contract for his own family\'s company.', 'مدير حقيقي يضغط لتمرير عقد لشركة عائلته.'],
      exit: ['Compliance opened a review the next day.', 'فتحت إدارة الالتزام مراجعة في اليوم التالي.']
    },
    {
      id: 'I6', role: 'insider', level: 3, jobs: ['hr', 'ops'], channel: 'person', place: 'hroffice',
      who: { base: 'dish', name: ['Talal', 'طلال'], age: 27, v: { beard: false, robe: '#f4f1ea', cap: '#f6f0de', capPat: '#00843d', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague from Finance', 'زميل من الإدارة المالية'],
      arrive: ['A colleague you have seen in the canteen leans on your desk.', 'زميل سبق أن رأيته في المقصف يتّكئ على مكتبك.'],
      open: ['Hi, Talal from Finance. Send me the full staff list with [[salaries and civil ID numbers]]? To [[my Gmail]], work email is slow.', 'هلا، طلال من المالية. ترسل لي قائمة الموظفين كاملة مع [[الرواتب وأرقام البطاقات]]؟ على [[جيميلي]]، إيميل الشغل بطيء.'],
      card: { title: ['Data request', 'طلب بيانات'], rows: [[['From', 'من'], ['Talal · Finance', 'طلال · الإدارة المالية']], [['Data', 'البيانات'], ['Salaries + civil IDs', 'الرواتب وأرقام البطاقات'], 1], [['Send to', 'الإرسال إلى'], ['Personal Gmail', 'بريد Gmail شخصي'], 1]] },
      acts: {
        official: ['Work email [[bounces big files]]. Gmail is fine.', 'إيميل الشغل [[يرفض الملفات الكبيرة]]. الجيميل عادي.'],
        why: ['It\'s for a [[budget report]]. My manager needs it today.', 'عشان [[تقرير الميزانية]]. مديري يبيه اليوم.'],
        confirm: ['My manager is [[travelling]]. I\'ll get approval later.', 'مديري [[مسافر]]. بجيب الموافقة بعدين.'],
        badge: { say: ['Here\'s my staff badge. We\'re colleagues!', 'هذي بطاقتي. إحنا زملاء!'], reveal: [[['Staff', 'الموظف'], ['Talal S. · Finance · real', 'طلال س. · الإدارة المالية · موظف حقيقي']], [['HR data access', 'صلاحية بيانات الموارد البشرية'], ['Not approved', 'غير معتمدة'], 1]] },
        policy: ['The form takes a week. [[Just between us]].', 'الاستمارة تاخذ أسبوع. [[بيني وبينك]].'],
        what: ['Names, salaries, IDs, [[bank accounts]] — everything.', 'الأسماء، الرواتب، البطاقات، [[الحسابات البنكية]] — كل شي.']
      },
      flags: [['Wanted personal data sent to Gmail', 'أراد إرسال بيانات شخصية إلى Gmail'], ['No manager approval', 'بلا موافقة المدير'], ['Asked for far more data than needed', 'طلب بيانات تفوق الحاجة بكثير']],
      key: ['Staff data to a personal Gmail', 'بيانات الموظفين إلى بريد Gmail شخصي'],
      sum: ['A real colleague trying to take staff data out to a personal email.', 'زميل حقيقي يحاول إخراج بيانات الموظفين إلى بريد شخصي.'],
      exit: ['The request was reported to compliance.', 'انرفع الطلب للامتثال.']
    },
    {
      id: 'I7', role: 'insider', level: 3, jobs: ['it', 'ops'], channel: 'internal', place: 'itdesk',
      who: { base: 'abaya', name: ['Rania', 'رانيا'], age: 28, v: { sunglasses: false, cloth: '#1d2f55', trim: '#a9c8ec', prop: 'laptop', mole: false } },
      claim: ['the new app contractor', 'متعاقدة مشروع التطبيق الجديد'],
      line: ['Rania T. · Contractor', 'رانيا ت. · متعاقدة'],
      open: ['Hi, I\'m Rania, the new app contractor. Please export [[the customer database]] with phone numbers. We need [[real data for testing]].', 'هلا، أنا رانيا متعاقدة التطبيق الجديد. لو سمحت صدّر [[قاعدة بيانات العملاء]] مع أرقام التلفونات. نحتاج [[بيانات حقيقية للتجربة]].'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Rania T. · contractor', 'رانيا ت. · متعاقدة']], [['Data', 'البيانات'], ['All customers + phones', 'جميع العملاء مع أرقام الهواتف'], 1]] },
      acts: {
        ticket: ['The change ticket is [[coming tomorrow]]. Start today.', 'تذكرة التغيير [[بتوصل باكر]]. ابدأ اليوم.'],
        why: ['Fake data [[doesn\'t work]] with our app.', 'البيانات الوهمية [[ما تشتغل]] مع تطبيقنا.'],
        confirm: ['The project manager said [[it\'s fine]], but he\'s offline now.', 'مدير المشروع قال [[عادي]]، بس هو غير متصل الحين.'],
        system: { say: ['I\'m waiting…', 'أنتظر…'], reveal: [[['Contractor access', 'صلاحية المتعاقدة'], ['Ends Oct 31', 'تنتهي في 31 أكتوبر']], [['Data export', 'تصدير البيانات'], ['Needs data-owner approval', 'يتطلب موافقة مالك البيانات'], 1]] },
        policy: ['Then just send [[a small sample]], 5,000 customers.', 'أجل بس أرسل [[عينة صغيرة]]، 5,000 عميل.'],
        official: ['Upload it to [[my personal cloud folder]], the link is in the chat.', 'ارفعها على [[مجلدي الشخصي في السحابة]]، الرابط في المحادثة.']
      },
      flags: [['Real customer data "for testing"', 'بيانات عملاء حقيقية "للاختبار"'], ['No ticket or approval', 'بلا تذكرة ولا موافقة'], ['Wanted it in a personal cloud folder', 'أرادتها في مجلد سحابي شخصي']],
      key: ['Customer data to a personal cloud', 'بيانات العملاء إلى سحابة شخصية'],
      sum: ['A contractor trying to walk out with customer data.', 'متعاقدة تحاول الخروج ببيانات العملاء.'],
      exit: ['Her access was suspended pending review.', 'انوقفت صلاحياتها لين المراجعة.']
    },
    {
      id: 'I8', role: 'insider', level: 2, jobs: ['ops', 'hr', 'ceo'], channel: 'internal', place: 'ops',
      who: { base: 'polo', name: ['Haitham', 'هيثم'], age: 29, v: { shirt: '#2f6a4a', collar: '#3d8460', glasses: 'clear', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague with an expense claim', 'زميل لديه مطالبة مصروفات'],
      line: ['Haitham S. · Operations · online', 'هيثم س. · العمليات · متصل'],
      open: ['My manager is away. Can you [[approve my expense claim]] for me? 640 OMR. [[I\'ll approve yours]] next time!', 'مديري مسافر. ممكن [[توافق على مطالبة مصاريفي]] عنه؟ 640 ريال. [[وأنا بوافق على حقك]] المرة الجاية!'],
      card: { title: ['Expense claim', 'مطالبة مصروفات'], rows: [[['Claimant', 'مقدّم المطالبة'], ['Haitham S.', 'هيثم س.']], [['Amount', 'المبلغ'], ['640 OMR', '640 ر.ع']], [['Approver', 'المعتمِد'], ['You (not his manager)', 'أنت (لست مديره)'], 1]] },
      acts: {
        manager: ['He\'s on holiday. [[Don\'t message him]].', 'هو في إجازة. [[لا ترسل له]].'],
        letter: { say: ['The receipts? Somewhere…', 'الإيصالات؟ في مكان ما…'], reveal: [[['Receipts', 'الإيصالات'], ['2 of 9 attached', '2 من 9 مرفقة'], 1]] },
        what: ['Dinners and a [[family trip]]. Business, mostly.', 'عشاوات و[[رحلة عائلية]]. شغل في الغالب.'],
        system: { say: ['Just click approve.', 'بس اضغط موافقة.'], reveal: [[['Claim system', 'نظام المطالبات'], ['You have no approval right for him', 'ليست لديك صلاحية اعتماد مطالباته'], 1]] },
        why: ['I need the money [[before the weekend]].', 'أحتاج الفلوس [[قبل الويكند]].'],
        policy: ['Everyone does it. [[Nobody checks]].', 'الكل يسويها. [[محد يتحقق]].']
      },
      flags: [['Asked you to approve his own claim', 'طلب منك اعتماد مطالبته الشخصية'], ['A family trip claimed as business', 'رحلة عائلية مُدرجة على أنها عمل'], ['Most receipts missing', 'معظم الإيصالات ناقصة']],
      key: ['Wanted his own expenses approved without his manager', 'أراد اعتماد مصروفاته من دون مديره'],
      sum: ['A real colleague trying to get personal costs paid by skipping his manager.', 'زميل حقيقي يحاول صرف تكاليف شخصية بتجاوز مديره.'],
      exit: ['Fine, I\'ll wait for him.', 'خلاص، بنتظره.']
    },
    {
      id: 'I9', role: 'insider', level: 2, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Yahya', 'يحيى'], age: 28, v: { beard: true, cap: '#f6f0de', capPat: '#7a55c4', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague from the branch', 'زميل من الفرع'],
      arrive: ['A colleague from the back office comes to your counter with a card form.', 'زميل من المكتب الخلفي يأتي إلى شبّاكك ومعه استمارة بطاقة.'],
      open: ['Raise my brother\'s card limit to 5,000, please. [[No documents needed]], he\'s [[my brother]]. I\'ll sign for him.', 'ارفع حد بطاقة أخوي لـ5,000 لو سمحت. [[ما يحتاج أوراق]]، هو [[أخوي]]. أنا بوقّع عنه.'],
      card: { title: ['Card limit request', 'طلب رفع حد البطاقة'], rows: [[['Customer', 'العميل'], ['Younis (his brother)', 'يونس (أخوه)']], [['New limit', 'الحد الجديد'], ['5,000 OMR', '5,000 ر.ع'], 1], [['Signed by', 'الموقِّع'], ['Yahya (staff)', 'يحيى (موظف)'], 1]] },
      acts: {
        id: ['My staff badge is enough, [[he\'s family]].', 'بطاقتي كموظف تكفي، [[هو من الأهل]].'],
        poa: ['Power of attorney? [[We\'re brothers]]!', 'وكالة؟ [[إحنا إخوان]]!'],
        system: { say: ['Look, his salary is fine.', 'شوف، راتبه زين.'], reveal: [[['Customer income', 'دخل العميل'], ['350 OMR / month', '350 ر.ع شهريًا'], 1]] },
        manager: ['Don\'t ask the manager, [[it\'s a small thing]].', 'لا تسأل المدير، [[شي بسيط]].'],
        why: ['He wants to buy a phone [[today]].', 'يبي يشتري تلفون [[اليوم]].'],
        policy: ['Come on, I\'d do it [[for your family]] too.', 'يلا، أنا بسويها [[لأهلك]] بعد.']
      },
      flags: [['Changing a relative\'s limit himself', 'يغيّر حد بطاقة قريبه بنفسه'], ['No documents, no customer present', 'بلا مستندات ولا حضور للعميل'], ['Limit far above the customer\'s income', 'حدّ يفوق دخل العميل بكثير']],
      key: ['Using his job to raise a relative\'s limit', 'يستغل وظيفته لرفع حد قريبه'],
      sum: ['A real colleague bending the rules to help his own brother.', 'زميل حقيقي يلتفّ على القواعد لمساعدة أخيه.'],
      exit: ['Okay, he\'ll come himself.', 'طيب، بيجي بنفسه.']
    },
    {
      id: 'I10', role: 'insider', level: 3, jobs: ['rm', 'ops', 'teller'], channel: 'phone', place: 'rmdesk',
      who: { base: 'shayla', name: ['Bushra', 'بشرى'], age: 30, v: { cloth: '#ffe08a', dots: '#0b2547', prop: 'phone', mouth: 'flat', brows: 'worried' } },
      claim: ['a colleague in Compliance', 'زميلة في إدارة الالتزام'],
      line: ['Ext. 3020 · Compliance', 'تحويلة 3020 · الالتزام'],
      open: ['My friend\'s account was [[frozen for review]]. Can you [[tell him why]]? And maybe he can [[move his money first]]…', 'حساب صديقي [[انجمّد للمراجعة]]. ممكن [[تقول له السبب]]؟ ويمكن [[يحوّل فلوسه قبل]]…'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Bushra A. · Compliance', 'بشرى أ. · الالتزام']], [['About', 'بخصوص'], ['A frozen account (her friend)', 'حساب مجمّد (لصديقها)'], 1]] },
      acts: {
        badge: { say: ['Staff ID 41207, check it.', 'رقمي الوظيفي 41207، تحقق.'], reveal: [[['Staff', 'الموظفة'], ['Bushra A. · Compliance · real ✓', 'بشرى أ. · الالتزام · حقيقية ✓']]] },
        why: ['He\'s a good guy. [[He just needs a warning]].', 'هو ريّال طيب. [[بس يحتاج تنبيه]].'],
        manager: ['Please don\'t tell my manager, [[it\'s personal]].', 'لو سمحت لا تقول لمديري، [[موضوع شخصي]].'],
        system: { say: ['So?', 'ها؟'], reveal: [[['Account status', 'حالة الحساب'], ['Frozen · suspicious activity', 'مجمّد · نشاط مشبوه'], 1]] },
        official: ['If I write it officially, [[it stays on record]].', 'إذا كتبتها رسمي، [[بتنسجل]].'],
        policy: ['Just a hint! [[Nobody will know]].', 'تلميح بس! [[محد بيدري]].']
      },
      flags: [['Wanted to tip off a friend under review', 'أرادت تنبيه صديق قيد المراجعة'], ['Suggested moving money before the freeze', 'اقترحت تحويل الأموال قبل التجميد'], ['Asked to keep it from her manager', 'طلبت إخفاء الأمر عن مديرها']],
      key: ['Tipping off a friend about a frozen account', 'تنبيه صديق إلى تجميد حسابه'],
      sum: ['A real colleague trying to warn a friend under investigation.', 'زميلة حقيقية تحاول تحذير صديق قيد التحقيق.'],
      exit: ['Fine… forget I called.', 'خلاص… انسَ إني اتصلت.']
    },
    {
      id: 'I11', role: 'insider', level: 2, jobs: ['guard', 'it', 'reception'], channel: 'internal', place: 'gate',
      who: { base: 'dish', name: ['Ahmed', 'أحمد'], age: 31, v: { beard: true, mustache: true, cap: '#f6f0de', capPat: '#00843d', mouth: 'flat', brows: 'neutral' } },
      claim: ['a facilities supervisor', 'مشرف المرافق'],
      line: ['Ahmed H. · Facilities · online', 'أحمد هـ. · المرافق · متصل'],
      open: ['Please [[switch off the CCTV]] in meeting room 3 for an hour. And [[the door alarm keeps beeping]], just disable it.', 'لو سمحت [[طفّ الكاميرات]] في قاعة 3 ساعة. و[[جرس الباب يزعج]]، بس وقّفه.'],
      card: { title: ['Chat check', 'التحقق من المحادثة'], rows: [[['From', 'من'], ['Ahmed H. · Facilities', 'أحمد هـ. · المرافق']], [['Wants', 'يطلب'], ['CCTV and alarm off', 'إيقاف الكاميرات والإنذار'], 1]] },
      acts: {
        why: ['A [[private meeting]] with some friends. Nothing big.', '[[اجتماع خاص]] مع كم ربع. ما في شي.'],
        ticket: ['A ticket? Then [[security will ask]]. No.', 'تذكرة؟ أجل [[الأمن بيسألون]]. لا.'],
        manager: ['My manager [[doesn\'t need to know]].', 'مديري [[ما يحتاج يعرف]].'],
        system: { say: ['Hurry.', 'استعجل.'], reveal: [[['Staff', 'الموظف'], ['Ahmed H. · Facilities · real ✓', 'أحمد هـ. · المرافق · حقيقي ✓']], [['Room 3 booking', 'حجز القاعة 3'], ['Not booked', 'غير محجوزة'], 1]] },
        what: ['Just an hour. [[Nobody watches the cameras]] anyway.', 'ساعة بس. [[محد يشوف الكاميرات]] أصلًا.'],
        policy: ['It\'s [[annoying]], everyone wants it off.', 'هو [[مزعج]]، الكل يبيه يوقف.']
      },
      flags: [['Wanted CCTV switched off', 'أراد إيقاف كاميرات المراقبة'], ['Wanted an alarm disabled', 'أراد تعطيل الإنذار'], ['No ticket, no booking, manager kept out', 'بلا تذكرة ولا حجز، وإبعاد للمدير']],
      key: ['Real colleague turning off security for himself', 'زميل حقيقي يعطّل الأمن لمصلحته'],
      sum: ['A real colleague wanted cameras and alarms off for a "private meeting".', 'زميل حقيقي أراد إيقاف الكاميرات والإنذارات من أجل "اجتماع خاص".'],
      exit: ['Fine, cameras stay on.', 'خلاص، خلّ الكاميرات شغالة.']
    },
    {
      id: 'I12', role: 'insider', level: 3, jobs: ['ceo', 'rm'], channel: 'phone', place: 'exec',
      who: { base: 'abaya', name: ['Aseel', 'أسيل'], age: 27, v: { sunglasses: false, cloth: '#3b2f4a', mouth: 'smile', prop: 'phone' } },
      claim: ['a colleague in Marketing', 'زميلة في التسويق'],
      line: ['Ext. 2280 · Marketing', 'تحويلة 2280 · التسويق'],
      open: ['Can you send me [[the new product launch deck]]? A friend at [[another bank]] wants to see it. [[Just between us]]!', 'ممكن ترسل لي [[عرض إطلاق المنتج الجديد]]؟ صديقتي في [[بنك ثاني]] تبي تشوفه. [[بيني وبينك]]!'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Aseel N. · Marketing', 'أسيل ن. · التسويق']], [['Wants', 'تطلب'], ['Confidential launch deck', 'عرض الإطلاق السرّي'], 1], [['Send to', 'الإرسال إلى'], ['Friend at a competitor', 'صديقة في بنك منافس'], 1]] },
      acts: {
        why: ['She\'ll give me [[a job offer]] if I help.', 'بتعطيني [[عرض وظيفة]] إذا ساعدتها.'],
        official: ['Officially? [[No way]], that\'s why I called you.', 'رسمي؟ [[مستحيل]]، عشان كذا اتصلت فيك.'],
        manager: ['The CEO would [[never agree]]. Don\'t ask.', 'الرئيس التنفيذي [[ما بيوافق أبدًا]]. لا تسأل.'],
        system: { say: ['You have it, right?', 'عندك، صح؟'], reveal: [[['Launch deck', 'عرض الإطلاق'], ['Confidential · internal only', 'سرّي · للاستخدام الداخلي فقط'], 1]] },
        email: ['Send it to my [[personal email]], not work.', 'أرسله على [[إيميلي الشخصي]]، مو الشغل.'],
        policy: ['It\'s only slides. [[What\'s the harm]]?', 'بس شرائح. [[وش الضرر]]؟']
      },
      flags: [['Leaking a confidential launch', 'تسريب إطلاق سرّي'], ['To a friend at a competitor', 'لصديقة في بنك منافس'], ['To a personal email, in secret', 'إلى بريد شخصي وفي السرّ']],
      key: ['Leaking plans to a competitor', 'تسريب الخطط إلى منافس'],
      sum: ['A real colleague trying to leak confidential plans to a competitor.', 'زميلة حقيقية تحاول تسريب خطط سرّية إلى منافس.'],
      exit: ['Okay, okay. Forget it.', 'طيب طيب، انسَ الموضوع.']
    },

    // =================== LEGAL CUSTOMERS ===================
    {
      id: 'L1', role: 'legal', level: 1, jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'shayla', name: ['Noor', 'نور'], age: 22, v: {  } },
      claim: ['a first-time customer', 'عميلة جديدة'],
      arrive: ['A young woman in a light-blue shayla walks up holding a letter.', 'تتقدّم شابة بشيلة زرقاء فاتحة وفي يدها خطاب.'],
      open: ['Hi! I just got my first salary letter. How do I open a savings account?', 'هلا! وصلني خطاب أول راتب. كيف أفتح حساب توفير؟'],
      card: { title: ['Salary letter', 'خطاب الراتب'], rows: [[['Name', 'الاسم'], ['Noor A.', 'نور أ.']], [['Employer', 'جهة العمل'], ['Ministry of Health', 'وزارة الصحة']], [['Salary', 'الراتب'], ['650 OMR / month', '650 ر.ع شهريًا']]] },
      acts: {
        id: { say: ['Of course, here\'s my civil ID.', 'أكيد، تفضل بطاقتي.'], reveal: [[['Civil ID', 'البطاقة الشخصية'], ['Noor A. · matches letter', 'نور أ. · مطابقة للخطاب']]] },
        what: ['Just a savings account, and maybe a debit card.', 'بس حساب توفير، ويمكن بطاقة صراف.'],
        why: ['No rush at all! I want to start saving for a car.', 'أبد مو مستعجلة! أبي أبدأ أوفر لسيارة.'],
        system: { say: ['Take your time.', 'خذ راحتك.'], reveal: [[['Existing accounts', 'حسابات سابقة'], ['None', 'لا يوجد']], [['Name check', 'التحقق من الاسم'], ['Clear', 'سليم']]] },
        policy: ['No problem, I\'ll fill in whatever forms you need.', 'ما في مشكلة، بعبّي أي استمارة تحتاجها.'],
        letter: ['Yes, it\'s signed and stamped by my employer.', 'إيه، موقّع ومختوم من جهة عملي.']
      },
      flags: [['ID matches her salary letter', 'بطاقتها مطابقة لخطاب الراتب'], ['Happy to fill forms and follow the process', 'مستعدة لملء الاستمارات واتباع الإجراءات'], ['No pressure, no unusual request', 'بلا ضغط ولا طلب غريب']],
      key: ['Showed ID and accepted every check', 'قدّمت بطاقتها وقبلت كل تحقق'],
      sum: ['She just wanted to open her first savings account.', 'أرادت فقط فتح أول حساب توفير لها.'],
      exit: ['Shukran! See you next month!', 'شكرًا! أشوفك الشهر الجاي!']
    },
    {
      id: 'L2', role: 'legal', level: 1, jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'dish', name: ['Ahmed', 'أحمد'], age: 22, v: { beard: false, brows: 'worried', robe: '#eef0f2', cap: '#f6f0de', capPat: '#7a55c4', mouth: 'talk' } },
      claim: ['a new joiner without a badge', 'موظف جديد نسي بطاقته'],
      arrive: ['A nervous young man in a crisp dishdasha stops at the barrier.', 'يتوقّف شابٌّ متوتر بدشداشة مكويّة عند الحاجز.'],
      open: ['Good morning! It\'s my second week. I forgot my badge at home. Can you let me in?', 'صباح الخير! هذا ثاني أسبوع لي. نسيت بطاقتي في البيت. ممكن تدخلني؟'],
      card: { title: ['Gate', 'البوابة'], rows: [[['Name', 'الاسم'], ['Ahmed S.', 'أحمد س.']], [['Badge', 'بطاقة العمل'], ['Not with him', 'ليست معه']]] },
      acts: {
        id: ['Here\'s my civil ID.', 'تفضل بطاقتي الشخصية.'],
        confirm: ['Sure. My manager is Ms. Fatma in Operations, extension 2210.', 'أكيد. مديرتي الأستاذة فاطمة في العمليات، تحويلة 2210.'],
        system: { say: ['I hope I\'m on there!', 'إن شاء الله موجود!'], reveal: [[['Staff list', 'قائمة الموظفين'], ['Ahmed S. · Operations · joined Oct 12', 'أحمد س. · العمليات · منذ 12 أكتوبر']]] },
        log: ['No problem, I\'ll sign the visitor log.', 'ما في مشكلة، بوقّع في سجل الزوار.'],
        wait: ['Okay, I\'ll wait here for my manager.', 'تمام، بنتظر مديرتي هني.'],
        policy: ['Understood. I\'ll get a temporary pass.', 'فاهم. باخذ تصريح مؤقت.']
      },
      flags: [['On the staff list', 'اسمه في قائمة الموظفين'], ['Gave his manager\'s name and extension', 'ذكر اسم مديرته وتحويلتها'], ['Happy to sign in and wait', 'مستعد للتوقيع والانتظار']],
      key: ['On the staff list, happy to wait', 'اسمه في القائمة ومستعد للانتظار'],
      sum: ['A new joiner who simply forgot his badge at home.', 'موظف جديد نسي بطاقته في المنزل لا أكثر.'],
      exit: ['Thanks! I\'ll never forget it again.', 'مشكور! ما بنساها مرة ثانية.']
    },
    {
      id: 'L3', role: 'legal', level: 2, jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Mohammed', 'محمد'], age: 30, v: { glasses: 'mirror', shirt: '#0b2547', collar: '#22385f', beard: true, prop: 'laptop', mouth: 'flat' } },
      claim: ['an investor meeting the CEO', 'مستثمر لديه موعد مع الرئيس التنفيذي'],
      arrive: ['A man in dark glasses rushes in, checking his watch.', 'يدخل رجل بنظارة داكنة مسرعًا وهو ينظر إلى ساعته.'],
      open: ['I have a 10 o\'clock with the CEO. I\'m a bit late, could we hurry, please?', 'عندي موعد الساعة 10 مع الرئيس التنفيذي. متأخر شوي، ممكن نستعجل لو سمحت؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Mohammed Al Lawati', 'محمد اللواتي']], [['Meeting', 'الموعد'], ['CEO · 10:00', 'الرئيس التنفيذي · 10:00']]] },
      acts: {
        appt: { say: ['Mohammed Al Lawati, 10:00, with the CEO\'s office.', 'محمد اللواتي، الساعة 10، مع مكتب الرئيس.'], reveal: [[['Appointment list', 'قائمة المواعيد'], ['10:00 · M. Al Lawati ✓', '10:00 · م. اللواتي ✓']]] },
        id: ['Here\'s my passport.', 'تفضل جوازي.'],
        confirm: ['Of course, please call them.', 'أكيد، تفضل اتصل فيهم.'],
        log: ['Sure, where do I sign?', 'أكيد، وين أوقّع؟'],
        wait: ['Fine, I\'ll wait. Is there coffee?', 'تمام، بنتظر. في قهوة؟'],
        why: ['Traffic on the expressway. Sorry!', 'زحمة على الطريق السريع. آسف!']
      },
      flags: [['On the appointment list', 'اسمه في قائمة المواعيد'], ['Showed ID and signed in', 'قدّم هويته ووقّع في السجلّ'], ['Impatient, but accepted every check', 'مستعجل، لكنه قبل كل تحقق']],
      key: ['Booked meeting, accepted every check', 'موعد محجوز، وقبِل كل تحقق'],
      sum: ['His meeting was booked; he was just running late.', 'كان موعده محجوزًا، وكل ما في الأمر أنه تأخّر.'],
      exit: ['Thank you. Lovely bunting, by the way!', 'شكرًا. الزينة حلوة بالمناسبة!']
    },
    {
      id: 'L4', role: 'legal', level: 3, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'abaya', name: ['Sara', 'سارة'], age: 27, v: { prop: 'folder', lips: '#a8423a' } },
      claim: ['the customer\'s daughter', 'ابنة العميلة'],
      arrive: ['A woman in sunglasses places a thick folder on the counter.', 'تضع امرأة ترتدي نظارة شمسية ملفًا سميكًا على الشبّاك.'],
      open: ['My mother can\'t walk well, so I\'m here to withdraw 500 OMR for her. I have the power of attorney.', 'أمي ما تقدر تمشي زين، فأنا جاية أسحب لها 500 ر.ع. معي الوكالة.'],
      card: { title: ['Power of attorney', 'وكالة رسمية'], rows: [[['For', 'الموكِّلة'], ['Moza H.', 'موزة ح.']], [['Agent', 'الوكيلة'], ['Sara H.', 'سارة ح.']], [['Status', 'الحالة'], ['Notarised · valid to 2027', 'موثّقة · سارية حتى 2027']]] },
      acts: {
        id: { say: ['Here\'s my ID. It matches the attorney.', 'تفضل بطاقتي. مطابقة للوكالة.'], reveal: [[['Civil ID', 'البطاقة الشخصية'], ['Sara H. · matches', 'سارة ح. · مطابقة']]] },
        poa: ['Here it is, notarised last year.', 'تفضل، موثقة السنة اللي فاتت.'],
        system: { say: ['Sure, check.', 'أكيد، تأكد.'], reveal: [[['POA on file', 'الوكالة في النظام'], ['Registered ✓', 'مسجّلة ✓']]] },
        callback: ['Sure, call her on the number you have.', 'أكيد، اتصل عليها على رقمها اللي عندكم.'],
        why: ['It\'s for her medicine and the house. No rush.', 'عشان دواها والبيت. مو مستعجلة.'],
        policy: ['Of course, take your time.', 'أكيد، خذ راحتك.']
      },
      flags: [['Valid, registered power of attorney', 'وكالة سارية ومسجّلة'], ['ID matches the papers', 'البطاقة مطابقة للمستندات'], ['Small amount, no pressure', 'مبلغ صغير بلا ضغط']],
      key: ['Registered power of attorney', 'وكالة مسجّلة'],
      sum: ['Her registered power of attorney let her bank for her mother.', 'وكالتها المسجّلة تخوّلها إجراء المعاملات نيابةً عن والدتها.'],
      exit: ['Thank you, you were very careful!', 'شكرًا، كنت حريص وايد!']
    },
    {
      id: 'L5', role: 'legal', level: 1, jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Asma', 'أسماء'], age: 26, v: { cloth: '#f2c6d6', dots: '#1d5694', prop: null, glasses: true, brows: 'worried' } },
      claim: ['a colleague locked out', 'زميلة أُقفل حسابها'],
      line: ['Asma N. · Credit', 'أسماء ن. · الائتمان'],
      open: ['Hi, I locked myself out after too many tries. Can you help me reset my password?', 'هلا، انقفل حسابي بعد محاولات كثيرة. ممكن تساعدني أغير كلمة المرور؟'],
      card: { title: ['Helpdesk', 'الدعم الفني'], rows: [[['User', 'المستخدمة'], ['Asma N. · Credit', 'أسماء ن. · الائتمان']], [['Issue', 'المشكلة'], ['Account locked', 'حساب مقفل']]] },
      acts: {
        ticket: { say: ['Sure, ticket number INC-20931.', 'أكيد، رقم التذكرة INC-20931.'], reveal: [[['Ticket INC-20931', 'التذكرة INC-20931'], ['Opened by Asma ✓', 'فتحتها أسماء ✓']]] },
        badge: ['Staff ID 30577. I can come to your desk too.', 'رقمي الوظيفي 30577. وأقدر أجي لمكتبك بعد.'],
        callback: ['Yes, call me on extension 3145.', 'إيه، اتصل علي على تحويلة 3145.'],
        system: { say: ['Thanks for checking.', 'مشكور على التحقق.'], reveal: [[['Failed logins', 'محاولات الدخول الفاشلة'], ['From her usual PC', 'من جهازها المعتاد']]] },
        policy: ['Perfect, send the reset link to my work email.', 'ممتاز، أرسل رابط التغيير على إيميل الشغل.'],
        why: ['No rush, I can work on paper for now.', 'مو مستعجلة، أقدر أشتغل على الورق الحين.']
      },
      flags: [['Raised a proper ticket', 'فتحت تذكرة رسمية'], ['Answered every check', 'أجابت عن كل أسئلة التحقق'], ['Wanted the reset sent to her own work email', 'طلبت إرسال الرابط إلى بريد عملها']],
      key: ['Raised a ticket, answered every check', 'فتحت تذكرة وأجابت عن كل تحقق'],
      sum: ['A colleague who simply forgot her password.', 'زميلة نسيت كلمة المرور لا أكثر.'],
      exit: ['Thank you! Logged back in.', 'شكرًا! رجعت دخلت.']
    },
    {
      id: 'L6', role: 'legal', level: 3, jobs: ['ops', 'ceo'], channel: 'phone', place: 'ops',
      who: { base: 'polo', name: ['Hamad', 'حمد'], age: 33, v: { shirt: '#2f6a4a', collar: '#3d8460', badge: 'VISITOR', lanyard: '#00843d', mouth: 'smile', brows: 'happy', mustache: true } },
      claim: ['a supplier asking about an invoice', 'مورّد يستفسر عن فاتورة'],
      line: ['+968 2••• ••88 · Muscat Print House', '+968 2••• ••88 · دار مسقط للطباعة'],
      open: ['Hello, Hamad from Muscat Print House. Could you confirm when invoice #2210 will be paid? No changes, just checking.', 'هلا، حمد من مسقط للطباعة. ممكن تأكد لي متى بتندفع الفاتورة رقم 2210؟ بدون أي تغيير، بس أتأكد.'],
      card: { title: ['Vendor file', 'ملف المورّد'], rows: [[['Vendor', 'المورّد'], ['Muscat Print House', 'دار مسقط للطباعة']], [['Invoice', 'الفاتورة'], ['#2210', '#2210']]] },
      acts: {
        callback: ['Of course, call our office number from your vendor file.', 'أكيد، اتصل على رقم مكتبنا اللي في ملف المورد.'],
        system: { say: ['Thank you.', 'مشكور.'], reveal: [[['Invoice #2210', 'الفاتورة 2210'], ['Due Oct 30', 'مستحقة في 30 أكتوبر']], [['Bank details', 'البيانات المصرفية'], ['Unchanged', 'لم تتغيّر']]] },
        id: ['Our vendor number is V-1187.', 'رقمنا كمورد V-1187.'],
        official: ['I\'ll send it from our registered email too.', 'برسلها من إيميلنا المسجل بعد.'],
        why: ['Just planning our cash flow. No rush.', 'بس نرتب السيولة. مو مستعجلين.'],
        policy: ['No problem, an email reply is fine.', 'ما في مشكلة، الرد بالإيميل يكفي.']
      },
      flags: [['Asked for nothing to change', 'لم يطلب أي تغيير'], ['Offered the official contact on file', 'اقترح وسيلة التواصل الرسمية المسجّلة'], ['Patient, accepted the process', 'صبور ويقبل الإجراءات']],
      key: ['No changes, used the official contact', 'لا تغيير، وتواصل عبر القناة الرسمية'],
      sum: ['He was only checking when his invoice would be paid.', 'كان يستفسر فقط عن موعد سداد فاتورته.'],
      exit: ['Thanks, have a great Youth Day!', 'مشكور، يوم شباب سعيد!']
    },
    {
      id: 'L7', role: 'legal', level: 1, jobs: ['hr', 'reception', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Reem', 'ريم'], age: 23, v: { cloth: '#ffe08a', dots: '#c8423a', prop: 'folder' } },
      claim: ['a graduate interview candidate', 'متقدّمة لبرنامج الخرّيجين'],
      arrive: ['A young woman in a yellow shayla holds a folder of printed CVs.', 'شابة بشيلة صفراء تحمل ملفًا فيه نسخ مطبوعة من سيرتها الذاتية.'],
      open: ['Hello! I\'m Reem. I have an interview at 11 with HR for the graduate programme.', 'مرحبا! أنا ريم. عندي مقابلة الساعة 11 مع الموارد البشرية لبرنامج الخريجين.'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Reem S.', 'ريم س.']], [['Here for', 'الغرض'], ['Interview · 11:00', 'مقابلة · 11:00']]] },
      acts: {
        appt: { say: ['It should be under Reem S.', 'المفروض باسم ريم س.'], reveal: [[['Interview list', 'قائمة المقابلات'], ['11:00 · Reem S. · HR ✓', '11:00 · ريم س. · الموارد البشرية ✓']]] },
        id: ['Here\'s my civil ID.', 'تفضل بطاقتي.'],
        confirm: ['Sure! The interviewer is Ms. Badriya.', 'أكيد! المقابِلة الأستاذة بدرية.'],
        log: ['Of course, I\'ll sign in.', 'أكيد، بوقّع.'],
        wait: ['Thank you, I\'ll wait in the lobby.', 'شكرًا، بنتظر في الصالة.'],
        what: ['Just the interview. I brought printed copies of my CV.', 'بس المقابلة. جبت نسخ مطبوعة من سيرتي.']
      },
      flags: [['On the interview list', 'اسمها في قائمة المقابلات'], ['Knew who she was meeting', 'تعرف من ستقابل'], ['Printed CVs, no USB or odd requests', 'سيرة مطبوعة، بلا ذاكرة USB ولا طلبات غريبة']],
      key: ['On the interview list', 'اسمها في قائمة المقابلات'],
      sum: ['She was here for her booked graduate interview.', 'جاءت لحضور مقابلتها المحجوزة في برنامج الخرّيجين.'],
      exit: ['Wish me luck!', 'ادعيلي بالتوفيق!']
    },
    {
      id: 'L8', role: 'legal', level: 2, jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'dish', name: ['Hussain', 'حسين'], age: 21, v: { beard: false, mustache: false, mouth: 'smile', brows: 'worried', cap: '#f6f0de', capPat: '#00843d' } },
      claim: ['a customer locked out of the app', 'عميل أُقفل حسابه في التطبيق'],
      line: ['+968 9••• ••31 · registered', '+968 9••• ••31 · رقم مسجّل'],
      open: ['Hi, my app says my account is locked. I\'m a bit worried, can you check?', 'هلا، التطبيق يقول حسابي مقفل. خايف شوي، ممكن تتأكد؟'],
      card: { title: ['Customer record', 'سجلّ العميل'], rows: [[['Account holder', 'صاحب الحساب'], ['Hussain A.', 'حسين أ.']], [['Issue', 'المشكلة'], ['App locked', 'التطبيق مقفل']]] },
      acts: {
        secq: { say: ['Born 4 May 2005, and my mother\'s name is Shamsa.', 'مواليد 4 مايو 2005، واسم أمي شمسة.'], reveal: [[['Security answers', 'إجابات الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        callback: ['Yes, call me back on my registered number.', 'إيه، اتصل علي على رقمي المسجل.'],
        system: { say: ['Thanks.', 'مشكور.'], reveal: [[['Lock reason', 'سبب الإقفال'], ['3 wrong PINs', '3 محاولات رقم سري خاطئة']], [['Calling number', 'رقم المتصل'], ['Registered ✓', 'مسجّل ✓']]] },
        why: ['I need to pay my university fees this week.', 'لازم أدفع رسوم الجامعة هالأسبوع.'],
        policy: ['Okay, I\'ll reset it in the app with my ID.', 'تمام، بغيرها من التطبيق ببطاقتي.'],
        branch: ['I can come to the branch tomorrow if needed.', 'أقدر أجي الفرع باكر لو احتاج.']
      },
      flags: [['Answered security questions correctly', 'أجاب عن أسئلة الأمان بشكل صحيح'], ['Called from his registered number', 'اتصل من رقمه المسجّل'], ['Accepted the reset process', 'قبِل إجراءات إعادة التعيين']],
      key: ['Passed security, registered number', 'اجتاز أسئلة الأمان، ورقمه مسجّل'],
      sum: ['He got locked out after typing his PIN wrong three times.', 'أُقفل حسابه بعد أن أدخل رقمه السري خطأً ثلاث مرات.'],
      exit: ['Thanks a lot!', 'مشكور وايد!']
    },
    {
      id: 'L9', role: 'legal', level: 2, jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Yousuf', 'يوسف'], age: 29, v: { beard: true, cap: '#f6f0de', capPat: '#c8102e', mouth: 'smile', brows: 'happy', prop: 'bag' } },
      claim: ['a shop owner depositing takings', 'صاحب محل يودع إيرادات محلّه'],
      arrive: ['A shop owner puts a cash bag and a folder of receipts on the counter.', 'يضع صاحب محل حقيبة نقود وملف إيصالات على الشبّاك.'],
      open: ['Salam! Here are my shop\'s takings for the week, 2,300 OMR. The till receipts are in the folder.', 'السلام عليكم! هذا دخل المحل للأسبوع، 2,300 ر.ع. إيصالات الكاشير في الملف.'],
      card: { title: ['Deposit slip', 'قسيمة إيداع'], rows: [[['Account', 'الحساب'], ['Al Yousuf Bakery', 'مخبز اليوسف']], [['Amount', 'المبلغ'], ['2,300 OMR cash', '2,300 ر.ع نقدًا']], [['Usual week', 'الأسبوع المعتاد'], ['2,000–2,600 OMR', '2,000–2,600 ر.ع']]] },
      acts: {
        source: { say: ['From the bakery. Here are the receipts.', 'من المخبز. تفضل الإيصالات.'], reveal: [[['Till receipts', 'إيصالات الكاشير'], ['Match the amount ✓', 'مطابقة للمبلغ ✓']]] },
        id: ['Here\'s my ID and the shop licence.', 'تفضل بطاقتي ورخصة المحل.'],
        system: { say: ['Same as every week.', 'نفس كل أسبوع.'], reveal: [[['Deposit history', 'سجلّ الإيداعات'], ['Every Sunday for 3 years', 'كل أحد منذ 3 سنوات']]] },
        purpose: ['To pay my flour supplier on Tuesday.', 'بدفع لمورد الطحين يوم الثلاثاء.'],
        why: ['No rush, I\'ll have a karak while I wait.', 'مو مستعجل، بشرب كرك وأنا أنتظر.'],
        policy: ['Of course, whatever you need.', 'أكيد، اللي تحتاجه.']
      },
      flags: [['Receipts match the cash', 'الإيصالات مطابقة للنقود'], ['Same deposit every week for years', 'الإيداع نفسه كل أسبوع منذ سنوات'], ['Happy to show ID and licence', 'قدّم بطاقته والرخصة عن طيب خاطر']],
      key: ['Regular takings with receipts', 'إيرادات منتظمة مع إيصالات'],
      sum: ['His cash was his bakery\'s normal weekly takings.', 'كانت نقوده إيرادات مخبزه الأسبوعية المعتادة.'],
      exit: ['Shukran! Come by for fresh bread!', 'شكرًا! مر علينا للخبز الطازج!']
    },
    {
      id: 'L10', role: 'legal', level: 2, jobs: ['it', 'ops', 'hr'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Hajar', 'هاجر'], age: 28, v: { cloth: '#9fd9c0', dots: '#0b2547', glasses: true, mouth: 'smile', brows: 'happy' } },
      claim: ['a team leader asking for system access', 'قائدة فريق تطلب صلاحية نظام'],
      line: ['Hajar S. · Operations · online', 'هاجر س. · العمليات · متصلة'],
      open: ['Hi! My new team member starts Sunday. I raised a ticket for his system access, and my manager approved it.', 'هلا! عضو جديد في فريقي يبدأ يوم الأحد. فتحت تذكرة لصلاحيات النظام حقه، ومديري وافق عليها.'],
      card: { title: ['Access request', 'طلب صلاحيات'], rows: [[['Requester', 'مقدّمة الطلب'], ['Hajar S. · team leader', 'هاجر س. · قائدة فريق']], [['For', 'لـ'], ['New joiner · Operations', 'موظف جديد · العمليات']]] },
      acts: {
        ticket: { say: ['Sure, ACC-7781.', 'أكيد، ACC-7781.'], reveal: [[['Ticket ACC-7781', 'التذكرة ACC-7781'], ['Manager approved ✓', 'معتمدة من المدير ✓']]] },
        manager: ['Already done, it\'s in the ticket. You can call him too.', 'خلصت، موجودة في التذكرة. وتقدر تتصل فيه بعد.'],
        what: ['Only the standard Operations profile, nothing extra.', 'بس صلاحيات العمليات العادية، ولا شي زيادة.'],
        system: { say: ['Thanks for checking.', 'مشكور على التحقق.'], reveal: [[['HR record', 'سجلّ الموارد البشرية'], ['New joiner starts Sunday ✓', 'موظف جديد يبدأ الأحد ✓']]] },
        otp: ['Of course! He will set his own password on day one.', 'أكيد! هو بيسوي كلمة المرور حقه أول يوم.'],
        why: ['No rush, Sunday is fine.', 'مو مستعجلة، الأحد عادي.']
      },
      flags: [['Proper ticket with manager approval', 'تذكرة رسمية بموافقة المدير'], ['Asked only for standard access', 'طلبت الصلاحيات المعتادة فقط'], ['Never asked for a password', 'لم تطلب أي كلمة مرور']],
      key: ['Followed the access process', 'اتبعت إجراءات منح الصلاحيات'],
      sum: ['A colleague who asked for access the right way.', 'زميلة طلبت الصلاحيات بالطريقة الصحيحة.'],
      exit: ['Perfect, thank you!', 'تمام، مشكور!']
    },
    {
      id: 'L11', role: 'legal', level: 3, jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Talib', 'طالب'], age: 30, v: { glasses: 'mirror', badge: 'VENDOR', lanyard: '#c8423a', mouth: 'flat', prop: 'laptop' } },
      claim: ['an IT contractor', 'متعاقد تقنية'],
      arrive: ['A man in a navy polo with a red lanyard and a laptop stops at the gate.', 'رجل بقميص كحلي وشريط أحمر حول عنقه يحمل حاسوبًا محمولًا يتوقّف عند البوابة.'],
      open: ['Good morning! I\'m here to fix the meeting-room screens. Ticket CHG-4402, booked for 9 o\'clock.', 'صباح الخير! جاي أصلّح شاشات قاعات الاجتماعات. التذكرة CHG-4402، محجوزة الساعة 9.'],
      card: { title: ['Gate pass', 'تصريح البوابة'], rows: [[['Visitor', 'الزائر'], ['Talib (contractor)', 'طالب (متعاقد)']], [['Going to', 'الوجهة'], ['Meeting rooms', 'قاعات الاجتماعات']]] },
      acts: {
        ticket: { say: ['CHG-4402, opened by your IT team.', 'CHG-4402، فتحها فريق التقنية عندكم.'], reveal: [[['Ticket CHG-4402', 'التذكرة CHG-4402'], ['Booked · 09:00 ✓', 'محجوزة · 09:00 ✓']]] },
        badge: { say: ['Here\'s my company badge and ID.', 'تفضل بطاقة الشركة والبطاقة الشخصية.'], reveal: [[['Vendor badge', 'بطاقة المورّد'], ['Photo + company match ✓', 'الصورة والشركة مطابقتان ✓']]] },
        log: ['Of course, I\'ll sign in.', 'أكيد، بوقّع.'],
        wait: ['Sure, I\'ll wait for my escort.', 'أكيد، بنتظر المرافق.'],
        usb: ['No USB. I only use my laptop on the guest network.', 'ما معي فلاش. أستخدم لابتوبي على شبكة الضيوف بس.'],
        confirm: ['Please call Mr. Said in IT, he booked me.', 'تفضل اتصل بالأستاذ سعيد في التقنية، هو اللي حجزني.']
      },
      flags: [['Real ticket, booked on time', 'تذكرة حقيقية في موعدها'], ['Badge and ID match', 'بطاقة العمل والهوية متطابقتان'], ['Happy to sign in and wait for an escort', 'رحّب بالتوقيع وانتظار المرافق']],
      key: ['Booked contractor who followed every rule', 'متعاقد بموعد محجوز اتبع كل القواعد'],
      sum: ['A real contractor with a booked job, following the visitor rules.', 'متعاقد حقيقي لديه مهمة محجوزة ويتّبع قواعد الزوّار.'],
      exit: ['Thanks, see you at 9!', 'مشكور، أشوفك الساعة 9!']
    },
    {
      id: 'L12', role: 'legal', level: 3, jobs: ['teller', 'rm'], channel: 'whatsapp', place: 'callcentre',
      who: { base: 'abaya', name: ['Rahma', 'رحمة'], age: 19, v: { sunglasses: false, cloth: '#2a2236', mouth: 'smile', prop: 'phone' } },
      claim: ['a student receiving money from family abroad', 'طالبة تتلقّى أموالًا من أهلها في الخارج'],
      line: ['+968 9••• ••27 · registered', '+968 9••• ••27 · رقم مسجّل'],
      open: ['Hi! My father sent 3,000 OMR from the UAE for my university fees. Can you tell me when it will arrive?', 'هلا! أبوي أرسل 3,000 ر.ع من الإمارات عشان رسوم الجامعة. ممكن تقول لي متى بتوصل؟'],
      card: { title: ['Incoming transfer', 'تحويل وارد'], rows: [[['Customer', 'العميلة'], ['Rahma S. · student', 'رحمة س. · طالبة']], [['From', 'من'], ['Salim S. (father) · UAE', 'سالم س. (الأب) · الإمارات']], [['Amount', 'المبلغ'], ['3,000 OMR', '3,000 ر.ع']]] },
      acts: {
        source: { say: ['It\'s from my dad\'s salary. I can send his letter.', 'من راتب أبوي. أقدر أرسل خطابه.'], reveal: [[['Sender', 'المرسِل'], ['Same surname · regular sender ✓', 'اللقب نفسه · مرسِل منتظم ✓']]] },
        purpose: ['Only my university fees. I\'ll pay the university directly.', 'بس رسوم الجامعة. بدفع للجامعة مباشرة.'],
        secq: { say: ['Born 2007, mother Shamsa.', 'مواليد 2007، والوالدة شمسة.'], reveal: [[['Security answers', 'إجابات الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        callback: ['Yes, call me on my registered number.', 'إيه، اتصل علي على رقمي المسجل.'],
        branch: ['I can come to the branch with my ID if needed.', 'أقدر أجي الفرع مع بطاقتي إذا احتاج.'],
        why: ['No rush, the fees are due next month.', 'مو مستعجلة، الرسوم الشهر الجاي.']
      },
      flags: [['Money from her own father, a regular sender', 'أموال من والدها وهو مرسِل منتظم'], ['Clear purpose: university fees', 'غرض واضح: الرسوم الجامعية'], ['Passed security and offered documents', 'اجتازت أسئلة الأمان وعرضت المستندات']],
      key: ['Family money for fees, fully explained', 'أموال عائلية للرسوم بتفسير كامل'],
      sum: ['A student waiting for her father\'s money for university fees.', 'طالبة تنتظر أموال والدها لسداد الرسوم الجامعية.'],
      exit: ['Thank you so much!', 'شكرًا وايد!']
    },
    {
      id: 'L13', role: 'legal', level: 3, jobs: ['ceo', 'rm', 'teller', 'ops'], channel: 'person', place: 'branchoff',
      who: { base: 'abaya', name: ['Nawal', 'نوال'], age: 34, v: { sunglasses: false, cloth: '#1d2f55', trim: '#a9c8ec', prop: 'folder', mouth: 'flat' } },
      claim: ['an auditor from the central bank', 'مدقّقة من البنك المركزي'],
      arrive: ['A serious woman with a folder asks for the branch manager.', 'امرأة جادّة الملامح تحمل ملفًا تطلب مقابلة مدير الفرع.'],
      open: ['Good morning. I\'m from the regulator\'s inspection team. Here is our official letter. Please call your compliance team first.', 'صباح الخير. أنا من فريق التفتيش في الجهة الرقابية. هذا خطابنا الرسمي. لو سمحت اتصل بفريق الالتزام عندكم أول.'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Nawal K. · inspector', 'نوال ك. · مفتّشة']], [['Letter', 'الخطاب'], ['Signed and stamped', 'موقّع ومختوم']]] },
      acts: {
        letter: { say: ['Here is the letter and my ID card.', 'تفضل الخطاب وبطاقة الهوية.'], reveal: [[['Official letter', 'الخطاب الرسمي'], ['Matches compliance schedule ✓', 'مطابق لجدول الالتزام ✓']]] },
        confirm: ['Yes, please call them. They are expecting us.', 'إيه لو سمحت اتصل فيهم. هم ينتظرونا.'],
        badge: ['My regulator ID card, with photo.', 'بطاقتي من الجهة الرقابية، فيها صورة.'],
        what: ['We will review files with your compliance officer present.', 'بنراجع الملفات بحضور مسؤول الالتزام عندكم.'],
        otp: ['Of course. We never need your password.', 'أكيد. ما نحتاج كلمة المرور حقك أبد.'],
        wait: ['Sure, I\'ll wait for compliance.', 'أكيد، بنتظر الالتزام.']
      },
      flags: [['Official letter that matched the schedule', 'خطاب رسمي مطابق للجدول'], ['Asked you to call compliance first', 'طلبت منك الاتصال بالالتزام أولًا'], ['Never asked for your login', 'لم تطلب بيانات دخولك أبدًا']],
      key: ['Real inspector with a letter, used compliance', 'مفتّشة حقيقية بخطاب، وتعاملت عبر الالتزام'],
      sum: ['A genuine inspector who followed every official step.', 'مفتّشة حقيقية اتبعت كل الخطوات الرسمية.'],
      exit: ['Thank you for checking properly.', 'شكرًا على تحققك الصحيح.']
    },
    {
      id: 'L14', role: 'legal', level: 2, jobs: ['hr', 'reception'], channel: 'person', place: 'hroffice',
      who: { base: 'polo', name: ['Salah', 'صلاح'], age: 24, v: { shirt: '#2f6a4a', collar: '#3d8460', badge: 'STAFF', lanyard: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['an employee changing his salary account', 'موظف يغيّر حساب راتبه'],
      arrive: ['A young employee comes to HR in person, holding his ID and a form.', 'يحضر موظف شاب إلى الموارد البشرية بنفسه حاملًا بطاقته واستمارة.'],
      open: ['Hi! I want to change my salary account. I already submitted it on the HR portal, here is my ID too.', 'هلا! أبي أغيّر حساب راتبي. قدّمت الطلب في بوابة الموارد، وهذي بطاقتي بعد.'],
      card: { title: ['Salary account change', 'تغيير حساب الراتب'], rows: [[['Employee', 'الموظف'], ['Salah N.', 'صلاح ن.']], [['Submitted', 'قُدِّم'], ['Via HR portal', 'عبر بوابة الموارد البشرية']]] },
      acts: {
        id: { say: ['Here\'s my civil ID.', 'تفضل بطاقتي الشخصية.'], reveal: [[['Civil ID', 'البطاقة الشخصية'], ['Salah N. · matches ✓', 'صلاح ن. · مطابقة ✓']]] },
        official: ['Yes, request HR-2219 on the portal.', 'إيه، الطلب HR-2219 في البوابة.'],
        system: { say: ['Take your time.', 'خذ راحتك.'], reveal: [[['New account', 'الحساب الجديد'], ['In his own name ✓', 'باسمه ✓']]] },
        why: ['No rush, next month is fine.', 'مو مستعجل، الشهر الجاي عادي.'],
        manager: ['My manager knows. You can email him.', 'مديري يدري. تقدر ترسل له إيميل.'],
        badge: ['Staff ID 51420.', 'رقمي الوظيفي 51420.']
      },
      flags: [['Came in person with ID', 'حضر بنفسه ومعه بطاقته'], ['Used the official HR portal', 'استخدم بوابة الموارد البشرية الرسمية'], ['New account is in his own name', 'الحساب الجديد باسمه']],
      key: ['Changed his account the official way', 'غيّر حسابه بالطريقة الرسمية'],
      sum: ['A real employee changing his salary account properly.', 'موظف حقيقي يغيّر حساب راتبه بالطريقة الصحيحة.'],
      exit: ['Thanks a lot!', 'مشكور وايد!']
    }
  ];
})();
