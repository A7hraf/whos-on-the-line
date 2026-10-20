/* Who's on the Line? — scripted visitors (free version, no live AI).
 *
 * Every text is [English, Arabic]. Wrap a real red-flag phrase in [[double brackets]]:
 * players can tap it to flag it, and the debrief counts how many they caught.
 *
 * To add a visitor: copy any block below, give it a new id, set role, jobs,
 * channel ('person' | 'phone' | 'whatsapp' | 'email' | 'internal') and write the lines.
 * Each entry in `acts` is a question the player can ask (see ACTIONS) and the
 * visitor's reply. A reply can also be { say: [en, ar], reveal: [[label, value, bad], ...] }
 * to add rows to the evidence card / record panel when the player checks something.
 */
(function () {
  // Questions the player can ask. verify:true = counts as "asked for verification" (+20).
  window.ACTIONS = {
    id:       { icon: 'identification-card', chip: ['Ask for ID', 'اطلب البطاقة'], say: ['Can I see your ID, please?', 'ممكن أشوف بطاقتك الشخصية لو سمحت؟'], verify: true },
    poa:      { icon: 'scroll', chip: ['Power of attorney?', 'وكالة رسمية؟'], say: ['Do you have a power of attorney?', 'هل عندك وكالة رسمية؟'], verify: true },
    why:      { icon: 'timer', chip: ['Why the rush?', 'ليش الاستعجال؟'], say: ['Why is this so urgent?', 'ليش الموضوع مستعجل كذا؟'] },
    callback: { icon: 'phone-outgoing', chip: ['Call back on file', 'اتصال على الرقم المسجل'], say: ["I'll call back on the number we have on file.", 'بتصل على الرقم المسجّل عندنا.'], verify: true },
    secq:     { icon: 'lock-key', chip: ['Security question', 'سؤال الأمان'], say: ['Please answer the security questions first.', 'لو سمحت جاوب على أسئلة الأمان أول.'], verify: true },
    appt:     { icon: 'calendar-check', chip: ['Check appointments', 'قائمة المواعيد'], say: ["Let me check today's appointment list.", 'خلني أتأكد من قائمة مواعيد اليوم.'], verify: true },
    confirm:  { icon: 'phone-call', chip: ['Confirm with them', 'تأكد من الجهة'], say: ["I'll call the person you mentioned to confirm.", 'بتصل على الشخص اللي ذكرته عشان أتأكد.'], verify: true },
    badge:    { icon: 'identification-badge', chip: ['Staff / vendor badge', 'بطاقة العمل'], say: ['Can I see your staff or company badge?', 'ممكن أشوف بطاقة العمل أو بطاقة الشركة؟'], verify: true },
    letter:   { icon: 'envelope-simple', chip: ['Official letter?', 'خطاب رسمي؟'], say: ['Do you have an official letter or documents?', 'عندك خطاب رسمي أو مستندات؟'], verify: true },
    ticket:   { icon: 'ticket', chip: ['Ticket number?', 'رقم التذكرة؟'], say: ["What's the ticket or reference number?", 'كم رقم التذكرة أو الطلب؟'], verify: true },
    who:      { icon: 'question', chip: ['Whose account?', 'حساب منو؟'], say: ['Whose name is the account in?', 'الحساب باسم منو؟'] },
    what:     { icon: 'chat-circle-dots', chip: ['What exactly?', 'شو بالضبط؟'], say: ['What exactly do you need from us?', 'شو اللي تحتاجه منا بالضبط؟'] },
    policy:   { icon: 'hand-palm', chip: ['Explain the policy', 'اشرح السياسة'], say: ["Sorry, our policy doesn't allow that.", 'آسف، سياستنا ما تسمح بهذا.'] },
    branch:   { icon: 'storefront', chip: ['Visit a branch', 'زر الفرع'], say: ['Please visit a branch in person with your ID.', 'تفضل زر الفرع شخصيًا مع بطاقتك.'] },
    system:   { icon: 'desktop', chip: ['Check the system', 'تحقق من النظام'], say: ['Let me check our system first.', 'خلني أتحقق من النظام أول.'], verify: true },
    log:      { icon: 'clipboard-text', chip: ['Sign visitor log', 'سجل الزوار'], say: ['Please sign the visitor log and wait for an escort.', 'لو سمحت وقّع في سجل الزوار وانتظر المرافق.'], verify: true },
    official: { icon: 'envelope-open', chip: ['Use official channel', 'القناة الرسمية'], say: ['Please send it through the official channel.', 'لو سمحت أرسلها عن طريق القناة الرسمية.'], verify: true },
    wait:     { icon: 'armchair', chip: ['Please wait', 'تفضل انتظر'], say: ['Please wait in the lobby while I check.', 'تفضل انتظر في الصالة لين أتأكد.'] },
    otp:      { icon: 'prohibit', chip: ['I never share codes', 'ما أشارك الرموز'], say: ['I never share OTPs or passwords with anyone.', 'أنا ما أشارك رموز التحقق أو كلمات المرور مع أي أحد.'] },
    link:     { icon: 'link', chip: ['Why this link?', 'ليش هالرابط؟'], say: ['Why should I log in through this link?', 'ليش أدخل عن طريق هالرابط؟'] },
    usb:      { icon: 'usb', chip: ['No USB devices', 'ممنوع USB'], say: ['We never plug outside USB devices into bank PCs.', 'ممنوع نوصل أي USB خارجي بأجهزة البنك.'] },
    email:    { icon: 'at', chip: ['Send by email', 'أرسلها بالإيميل'], say: ['Could you send it by email instead?', 'ممكن ترسلها بالإيميل بدال؟'] }
  };

  // Places / channels shown in the tag above the dialogue box
  window.PLACES = {
    counter:   ['Branch counter', 'كاونتر الفرع'],
    branchoff: ["Branch manager's office", 'مكتب مدير الفرع'],
    gate:      ['HQ main gate', 'البوابة الرئيسية'],
    reception: ['HQ reception', 'الاستقبال بالمبنى الرئيسي'],
    hroffice:  ['HQ · HR office', 'المبنى الرئيسي · مكتب الموارد البشرية'],
    exec:      ['HQ · executive floor', 'المبنى الرئيسي · الطابق التنفيذي'],
    callcentre:['Call centre', 'مركز الاتصال'],
    itdesk:    ['HQ · IT helpdesk', 'المبنى الرئيسي · الدعم الفني'],
    ops:       ['HQ · operations', 'المبنى الرئيسي · العمليات'],
    rmdesk:    ['Relationship desk', 'مكتب مدير العلاقات']
  };
  window.CHANNELS = {
    person:   ['In person', 'حضوري'],
    phone:    ['Phone call', 'مكالمة'],
    whatsapp: ['WhatsApp', 'واتساب'],
    email:    ['Email', 'بريد إلكتروني'],
    internal: ['Internal chat', 'محادثة داخلية']
  };

  window.ENCOUNTERS = [
    // =================== SCAMMERS ===================
    {
      id: 'S1', role: 'scammer', jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'dish', name: ['Salim', 'سالم'], age: 24, v: { brows: 'worried' } },
      claim: ["the customer's son", 'ابن العميل'],
      arrive: ['A young man in a white dishdasha hurries to your counter, out of breath.', 'شاب بدشداشة بيضاء يستعجل نحو الكاونتر ويلهث.'],
      open: ['My father is in hospital. I need to withdraw his money [[today]]. Can you make an exception [[just this once]]?', 'أبوي في المستشفى. لازم أسحب فلوسه [[اليوم]]. ممكن تسوي استثناء [[هالمرة بس]]؟'],
      card: { title: ['Withdrawal slip', 'قسيمة سحب'], rows: [[['Account', 'الحساب'], ['Hamood S.', 'حمود س.']], [['Amount', 'المبلغ'], ['3,000 OMR', '3,000 ر.ع'], 1], [['Signed by', 'التوقيع'], ['Salim (son)', 'سالم (الابن)'], 1]] },
      acts: {
        id: ["Here's my ID. And this is a [[photo of my father's ID]] on my phone.", 'هذي بطاقتي. وهذي [[صورة بطاقة أبوي]] في تلفوني.'],
        poa: ["Power of attorney? There's [[no time for paperwork]], he's in hospital!", 'وكالة؟ [[ما في وقت للأوراق]]، هو في المستشفى!'],
        why: ['The hospital wants payment [[in cash, today]]. Please, I am begging you.', 'المستشفى يبون الدفع [[كاش، اليوم]]. الله يخليك.'],
        callback: ["Don't call him! He's [[too sick to talk]]. Just trust me.", 'لا تتصل فيه! هو [[تعبان وما يقدر يتكلم]]. بس ثق فيني.'],
        system: { say: ['Check what you like. I am his son, [[everyone knows me]] here.', 'تحقق كيف ما تبي. أنا ولده، [[الكل يعرفني]] هني.'], reveal: [[['Allowed to withdraw', 'المخوّل بالسحب'], ['Hamood S. only', 'حمود س. فقط'], 1]] },
        policy: ['Your policy? My father could die! [[Who is your manager?]]', 'سياستكم؟ أبوي ممكن يموت! [[منو مديرك؟]]']
      },
      flags: [['Rushed you: "today!"', 'استعجلك: "اليوم!"'], ['No power of attorney, only a photo of an ID', 'ما عنده وكالة، بس صورة بطاقة'], ['Asked for an exception "just this once"', 'طلب استثناء "هالمرة بس"']],
      key: ['No power of attorney, only an ID photo', 'بدون وكالة، بس صورة بطاقة'],
      sum: ["He wanted his father's money out today, with no power of attorney.", 'كان يبي يسحب فلوس أبوه اليوم بدون أي وكالة.'],
      exit: ["Wait… I'll come back tomorrow!", 'انتظر… برجع باكر!'], exitNote: ["(he won't)", '(ما بيرجع)']
    },
    {
      id: 'S2', role: 'scammer', jobs: ['ceo', 'ops'], channel: 'email', place: 'exec',
      who: { base: 'dish', name: ['Khalid', 'خالد'], age: 31, v: { headwear: 'massar', cap: '#5a2a6a', capPat: '#c9a31c', capBand: '#e6c95a', glasses: true, skin: 'e', mouth: 'flat' } },
      claim: ['the Chairman', 'رئيس مجلس الإدارة'],
      line: ['chairman.office@ahlibank-om.co', 'chairman.office@ahlibank-om.co'],
      open: ['CONFIDENTIAL. Wire 48,000 OMR to our new partner [[before 2 pm]]. Keep this [[between us]] until the deal is announced.', 'سري. حوّل 48,000 ر.ع لشريكنا الجديد [[قبل الساعة 2]]. خلّ الموضوع [[بيني وبينك]] لين نعلن الصفقة.'],
      card: { title: ['Sender check', 'فحص المرسل'], rows: [[['From', 'من'], ['Chairman (claimed)', 'رئيس المجلس (حسب قوله)']], [['Amount', 'المبلغ'], ['48,000 OMR', '48,000 ر.ع'], 1], [['Payee', 'المستفيد'], ['New, never used', 'جديد، أول مرة'], 1]] },
      acts: {
        official: ["I'm travelling, [[my official email isn't working]]. Use this one.", 'أنا مسافر، [[إيميلي الرسمي ما يشتغل]]. استخدم هذا.'],
        callback: ["I'm [[in meetings all day]], I can't take calls. Just process it.", 'أنا [[في اجتماعات طول اليوم]]، ما أقدر أرد. بس نفّذ.'],
        why: ['The deal closes today. If we miss it, [[the bank loses millions]].', 'الصفقة تقفل اليوم. لو فاتتنا، [[البنك بيخسر الملايين]].'],
        confirm: ["[[Don't involve finance]] yet, it's confidential. I trust only you.", '[[لا تدخّل المالية]] الحين، الموضوع سري. أنا واثق فيك أنت بس.'],
        system: { say: ['Why are you checking? Just do as I say.', 'ليش تتحقق؟ بس سوّ اللي أقول لك.'], reveal: [[['Sender domain', 'نطاق المرسل'], ['ahlibank-om.co', 'ahlibank-om.co'], 1], [['Bank domain', 'نطاق البنك'], ['ahlibank.om', 'ahlibank.om']]] },
        policy: ["I'm the Chairman. [[I'm approving it]]. That's enough.", 'أنا رئيس المجلس. [[أنا موافق]]. وهذا يكفي.']
      },
      flags: [['Secrecy: "keep this between us"', 'السرية: "بيني وبينك"'], ['Deadline pressure: "before 2 pm"', 'ضغط الوقت: "قبل الساعة 2"'], ['Look-alike email domain', 'نطاق إيميل مقلّد']],
      key: ['Secret payment from a look-alike email', 'دفعة سرية من إيميل مقلّد'],
      sum: ['He wanted a big payment sent in secret, from a look-alike email address.', 'كان يبي دفعة كبيرة تنرسل بالسر، من عنوان إيميل مقلّد.'],
      exit: ['No reply. The address bounced the next day.', 'ما في رد. العنوان تعطّل ثاني يوم.']
    },
    {
      id: 'S3', role: 'scammer', jobs: ['teller'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Said', 'سعيد'], age: 26, v: { shirt: '#7a2a2a', collar: '#9a3a3a', mouth: 'flat' } },
      claim: ['a customer charged twice', 'عميل انخصم منه مرتين'],
      line: ['+968 9••• ••52 · new number', '+968 9••• ••52 · رقم جديد'],
      open: ['You charged me twice for my card fee! Refund it now, but send it to [[my friend\'s account]], mine is blocked.', 'خصمتوا رسوم البطاقة مرتين! رجّعوها الحين، بس حوّلوها [[لحساب صديقي]]، حسابي موقوف.'],
      card: { title: ['Customer record', 'سجل العميل'], rows: [[['Caller', 'المتصل'], ['Said R. (claimed)', 'سعيد ر. (حسب قوله)']], [['Request', 'الطلب'], ["Refund to another person's account", 'استرداد لحساب شخص آخر'], 1]] },
      acts: {
        secq: { say: ['Er… Fatma? Or Aisha. [[Just process it]], please.', 'أمم… فاطمة؟ ولا عائشة. [[بس نفّذ الطلب]] لو سمحت.'], reveal: [[['Security answer', 'جواب الأمان'], ['Wrong', 'خطأ'], 1]] },
        system: { say: ["You'll see it. Two charges, [[I'm sure]].", 'بتشوفها. خصمين، [[أنا متأكد]].'], reveal: [[['Card fee charges', 'خصم رسوم البطاقة'], ['1 charge only', 'خصم واحد فقط'], 1]] },
        why: ['My account is frozen, so [[send it to Hamed\'s]]. He\'ll give me the cash.', 'حسابي مجمّد، [[حوّلها لحساب حمد]]. هو بيعطيني الكاش.'],
        callback: ["I'm on a [[new number]], don't call the old one.", 'أنا على [[رقم جديد]]، لا تتصل على القديم.'],
        branch: ["I can't come to a branch, I'm [[travelling]]. Do it on the phone.", 'ما أقدر أجي الفرع، أنا [[مسافر]]. خلّصها بالتلفون.'],
        policy: ["Every bank does refunds! [[I'll complain]] about you online.", 'كل البنوك ترجّع الفلوس! [[بشتكي عليك]] في السوشال ميديا.']
      },
      flags: [["Refund to someone else's account", 'استرداد لحساب شخص ثاني'], ['Records show only one charge', 'السجل فيه خصم واحد بس'], ['Threats and pressure', 'تهديد وضغط']],
      key: ['Fake double charge, refund to a friend', 'خصم مزدوج وهمي، واسترداد لحساب صديق'],
      sum: ['He invented a double charge to get money sent to another account.', 'اخترع خصم مزدوج عشان تنحوّل فلوس لحساب ثاني.'],
      exit: ['Click. He hung up.', 'طق. سكّر الخط.']
    },
    {
      id: 'S4', role: 'scammer', jobs: ['rm', 'teller'], channel: 'whatsapp', place: 'rmdesk',
      who: { base: 'polo', name: ['Ahmed', 'أحمد'], age: 29, v: { shirt: '#2f6a4a', collar: '#3d8460', glasses: 'clear', mouth: 'smile', brows: 'happy' } },
      claim: ['a long-time business client', 'عميل تجاري قديم'],
      line: ['+968 7••• ••19 · not saved', '+968 7••• ••19 · غير محفوظ'],
      open: ["Salam, it's Ahmed from Al Noor Trading, new number. Please transfer 12,000 OMR to this [[new supplier abroad]] [[today]].", 'السلام عليكم، معك أحمد من النور للتجارة، رقم جديد. لو سمحت حوّل 12,000 ر.ع [[لمورد جديد برا]] [[اليوم]].'],
      card: { title: ['Client record', 'سجل العميل'], rows: [[['Client', 'العميل'], ['Al Noor Trading', 'النور للتجارة']], [['Phone on file', 'الرقم المسجل'], ['+968 9••• 2231', '+968 9••• 2231']], [['Request', 'الطلب'], ['12,000 OMR abroad', '12,000 ر.ع للخارج'], 1]] },
      acts: {
        callback: ['That phone is [[broken]]. WhatsApp only for now, please.', 'هذاك التلفون [[خربان]]. واتساب بس الحين لو سمحت.'],
        official: ["Email is down. You know me, [[we've worked together for years]]!", 'الإيميل واقف. أنت تعرفني، [[صار لنا سنين نتعامل]]!'],
        why: ['The supplier will [[cancel the order]] if paid after 3 pm.', 'المورد [[بيلغي الطلب]] إذا الدفع بعد الساعة 3.'],
        system: { say: ['Why check? [[Hurry please]].', 'ليش تتحقق؟ [[استعجل لو سمحت]].'], reveal: [[['Payee', 'المستفيد'], ['New, never paid before', 'جديد، أول مرة'], 1], [['Usual payments', 'المدفوعات المعتادة'], ['Local suppliers only', 'موردين محليين فقط']]] },
        secq: ["I [[don't have time]] for questions. I'll lose the deal!", '[[ما عندي وقت]] للأسئلة. بتروح علي الصفقة!'],
        branch: ["I'm abroad. Just do it, [[I'll sign later]].", 'أنا برا البلد. بس سوّها، [[بوقّع بعدين]].']
      },
      flags: [['New number, WhatsApp only', 'رقم جديد، واتساب بس'], ['New payee abroad, today', 'مستفيد جديد برا، اليوم'], ['Refused every check', 'رفض كل تحقق']],
      key: ['Pretended to be a client from a new number', 'انتحل صفة عميل من رقم جديد'],
      sum: ['He pretended to be a known client to send money to a new payee abroad.', 'انتحل صفة عميل معروف عشان يحوّل فلوس لمستفيد جديد برا.'],
      exit: ['Message deleted. The number blocked you.', 'انحذفت الرسالة. والرقم حظرك.']
    },
    {
      id: 'S5', role: 'scammer', jobs: ['ops', 'ceo'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Huda', 'هدى'], age: 30, v: { sunglasses: false, cloth: '#3b2f4a', mouth: 'smile', mole: false } },
      claim: ['a regular supplier', 'مورد معتاد'],
      line: ['accounts@gulf-offlce.com', 'accounts@gulf-offlce.com'],
      open: ['Dear team, please note our [[bank details have changed]]. Pay invoice #4471 (8,900 OMR) to the new account [[from this week]].', 'فريقنا العزيز، يرجى العلم أن [[بيانات حسابنا البنكي تغيرت]]. ادفعوا الفاتورة رقم 4471 (8,900 ر.ع) على الحساب الجديد [[من هالأسبوع]].'],
      card: { title: ['Vendor file', 'ملف المورد'], rows: [[['Vendor', 'المورد'], ['Gulf Office Supplies', 'الخليج للأدوات المكتبية']], [['Invoice', 'الفاتورة'], ['#4471 · 8,900 OMR', '#4471 · 8,900 ر.ع']], [['Request', 'الطلب'], ['Change bank account', 'تغيير الحساب البنكي'], 1]] },
      acts: {
        callback: ['Please use the [[number in this email]]. Our old line is closed.', 'لو سمحتوا استخدموا [[الرقم اللي في الإيميل]]. خطنا القديم مقفل.'],
        letter: ['A letter will take weeks. [[A screenshot is fine]], right?', 'الخطاب ياخذ أسابيع. [[صورة شاشة تكفي]]، صح؟'],
        system: { say: ['We are your supplier, you can trust us.', 'إحنا موردكم، تقدرون تثقون فينا.'], reveal: [[['Account on file', 'الحساب المسجل'], ['Bank ••4410', 'بنك ••4410']], [['New account', 'الحساب الجديد'], ['Other bank, other name', 'بنك ثاني، اسم ثاني'], 1], [['Email domain', 'نطاق الإيميل'], ['gulf-offlce.com (letter "l")', 'gulf-offlce.com (حرف l)'], 1]] },
        why: ['We changed banks for better fees. [[Please don\'t delay]] the payment.', 'غيرنا البنك عشان الرسوم. [[لا تأخروا الدفع]] لو سمحتوا.'],
        confirm: ['Your usual contact [[left the company]]. Deal with me now.', 'الشخص اللي تتعاملون معه [[ترك الشركة]]. تعاملوا معي الحين.'],
        policy: ["No need, we've been your supplier for [[five years]].", 'ما يحتاج، إحنا موردكم من [[خمس سنين]].']
      },
      flags: [['Changed bank details by email', 'تغيير بيانات البنك بالإيميل'], ['Only offered contacts from the same email', 'عطت أرقام من نفس الإيميل بس'], ['Look-alike email domain', 'نطاق إيميل مقلّد']],
      key: ['Fake "new bank details" for a real supplier', 'بيانات بنك "جديدة" مزيفة لمورد حقيقي'],
      sum: ["She tried to redirect a real supplier's payment to her own account.", 'حاولت تحوّل دفعة مورد حقيقي لحسابها.'],
      exit: ['The real supplier called later: they never changed banks.', 'المورد الحقيقي اتصل بعدين: ما غيروا البنك أبد.']
    },
    {
      id: 'S6', role: 'scammer', jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Faisal', 'فيصل'], age: 30, v: { shirt: '#1b2a44', collar: '#2b3f66', glasses: 'clear', beard: true, prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['an investor for the CEO', 'مستثمر جاي للرئيس التنفيذي'],
      arrive: ['A smart man with a leather folder walks straight to the desk, smiling.', 'رجل أنيق بملف جلد يمشي مباشرة للمكتب وهو يبتسم.'],
      open: ['I\'m an investor from Dubai with [[a 20 million deal]] for your CEO. I just need a bank guarantee letter [[signed today]].', 'أنا مستثمر من دبي وعندي [[صفقة بـ20 مليون]] لرئيسكم التنفيذي. بس أحتاج خطاب ضمان بنكي [[موقّع اليوم]].'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Faisal (business card)', 'فيصل (كرت عمل)']], [['Wants', 'يطلب'], ['Signed guarantee letter', 'خطاب ضمان موقّع'], 1]] },
      acts: {
        appt: { say: ['No appointment, but [[the CEO knows me]] personally. Call him if you like.', 'ما عندي موعد، بس [[الرئيس يعرفني]] شخصيًا. اتصل فيه لو تبي.'], reveal: [[['Appointments', 'المواعيد'], ['Not on the list', 'مو موجود بالقائمة'], 1]] },
        id: ["Here's my business card. My passport is [[at the hotel]].", 'هذا كرتي. جوازي [[في الفندق]].'],
        confirm: ["His secretary? She'll say no. [[Better to go straight up]].", 'سكرتيرته؟ بترفض. [[الأحسن أطلع له على طول]].'],
        why: ['Other banks want this deal too. It\'s [[today or never]].', 'بنوك ثانية تبي هالصفقة. [[اليوم أو أبد]].'],
        letter: ['The papers are with my lawyer. Just [[stamp this letter]], I\'ll send them later.', 'الأوراق عند المحامي. بس [[اختم هالخطاب]]، وبرسلها بعدين.'],
        log: ["I don't sign forms. [[Do you know who I am?]]", 'أنا ما أوقّع استمارات. [[تعرف منو أنا؟]]']
      },
      flags: [['No appointment, name-drops the CEO', 'بدون موعد، ويستخدم اسم الرئيس'], ['Wants a signed bank letter today', 'يبي خطاب بنكي موقّع اليوم'], ['No ID or company papers', 'بدون هوية أو أوراق شركة']],
      key: ['Wanted a signed bank letter, no appointment', 'يبي خطاب بنكي موقّع، بدون موعد'],
      sum: ['He wanted a signed bank letter to use in a scam, with no appointment or ID.', 'كان يبي خطاب بنكي موقّع يستخدمه في احتيال، بدون موعد أو هوية.'],
      exit: ['He left fast when security walked over.', 'طلع بسرعة لما قرّب الأمن.']
    },
    {
      id: 'S7', role: 'scammer', jobs: ['hr', 'ops'], channel: 'phone', place: 'hroffice',
      who: { base: 'dish', name: ['Mazin', 'مازن'], age: 25, v: { robe: '#e9e4d8', cap: '#fbfaf5', capPat: '#c8423a', mouth: 'talk' } },
      claim: ['an employee at the Sohar branch', 'موظف في فرع صحار'],
      line: ['+968 9••• ••73 · mobile', '+968 9••• ••73 · نقال'],
      open: ['Hi HR, Mazin from the Sohar branch. Please change my salary account to a new one [[before payroll tonight]].', 'هلا بالموارد البشرية، مازن من فرع صحار. لو سمحتوا غيّروا حساب راتبي لحساب جديد [[قبل الرواتب الليلة]].'],
      card: { title: ['Employee record', 'سجل الموظف'], rows: [[['Name', 'الاسم'], ['Mazin H. · Sohar', 'مازن ح. · صحار']], [['Request', 'الطلب'], ['New salary account', 'حساب راتب جديد'], 1]] },
      acts: {
        callback: ["I'm [[not at the branch]] today, call this mobile only.", 'أنا [[مو في الفرع]] اليوم، اتصل على هالنقال بس.'],
        id: ['Er… my employee number is on my payslip, [[I don\'t have it]] with me.', 'أمم… رقمي الوظيفي في كشف الراتب، [[مو معي]] الحين.'],
        official: ['The HR portal [[won\'t let me log in]]. You can just do it, it\'s quick.', 'بوابة الموارد [[ما تخليني أدخل]]. تقدر تسويها أنت، سريعة.'],
        system: { say: ['Is there a problem?', 'في مشكلة؟'], reveal: [[['Mobile on file', 'النقال المسجل'], ['Different number', 'رقم مختلف'], 1], [['Account changes', 'تغيير الحساب'], ['Only via HR portal', 'عن طريق البوابة فقط']]] },
        why: ['My old account is [[closed]]. If you don\'t change it, I won\'t get paid!', 'حسابي القديم [[مسكّر]]. إذا ما غيرته، ما بنزل راتبي!'],
        confirm: ['My manager is [[on leave]]. Please, it\'s only a small change.', 'مديري [[في إجازة]]. الله يخليك، تغيير بسيط.']
      },
      flags: [['Asked you to skip the HR portal', 'طلب يتجاوز بوابة الموارد'], ["Couldn't give his employee number", 'ما عرف رقمه الوظيفي'], ['Deadline: "before payroll tonight"', 'موعد نهائي: "قبل الرواتب الليلة"']],
      key: ['Salary diversion from an unknown mobile', 'تحويل راتب من نقال غير مسجل'],
      sum: ["He tried to divert a real employee's salary to his own account.", 'حاول يحوّل راتب موظف حقيقي لحسابه.'],
      exit: ['The real Mazin called next week: he never asked for any change.', 'مازن الحقيقي اتصل الأسبوع اللي بعده: ما طلب أي تغيير.']
    },
    {
      id: 'S8', role: 'scammer', jobs: ['it', 'ops'], channel: 'internal', place: 'ops',
      who: { base: 'shayla', name: ['Laila', 'ليلى'], age: 29, v: { cloth: '#c9b2e6', dots: '#fbfaf5', prop: null, mouth: 'smile' } },
      claim: ['your Head of Operations', 'رئيسة العمليات'],
      line: ['Laila K. · Head of Operations · in a meeting', 'ليلى ك. · رئيسة العمليات · في اجتماع'],
      open: ['Hi, it\'s Laila. I\'m in a board meeting. Can you buy [[10 gift cards]] for the Youth Day staff prizes and [[send me the codes]] here?', 'هلا، أنا ليلى. أنا في اجتماع مجلس. ممكن تشتري [[10 بطاقات هدايا]] لجوائز يوم الشباب و[[ترسل لي الأكواد]] هني؟'],
      card: { title: ['Chat check', 'فحص المحادثة'], rows: [[['Account', 'الحساب'], ['Laila K.', 'ليلى ك.']], [['Request', 'الطلب'], ['Gift card codes', 'أكواد بطاقات هدايا'], 1]] },
      acts: {
        callback: ['[[Can\'t talk]], board meeting. Chat only please.', '[[ما أقدر أتكلم]]، اجتماع مجلس. محادثة بس لو سمحت.'],
        why: ['The prizes are for today. [[It\'s urgent]], you\'re the only one I trust.', 'الجوائز لليوم. [[ضروري]]، أنت الوحيد اللي أثق فيه.'],
        official: ['No time for a purchase request. [[Use your own card]], I\'ll approve later.', 'ما في وقت لطلب شراء. [[استخدم بطاقتك]]، وبوافق بعدين.'],
        confirm: ["Don't bother my assistant, [[keep it a surprise]]!", 'لا تزعج مساعدتي، [[خلها مفاجأة]]!'],
        system: { say: ['Why are you so slow today?', 'ليش بطيء اليوم؟'], reveal: [[['Last login', 'آخر دخول'], ['New device, outside Oman', 'جهاز جديد، خارج عُمان'], 1]] },
        policy: ["I'm your manager. [[Are you refusing me?]]", 'أنا مديرتك. [[ترفض طلبي؟]]']
      },
      flags: [['Gift cards and codes in a chat', 'بطاقات هدايا وأكواد في محادثة'], ['Secrecy: "keep it a surprise"', 'السرية: "خلها مفاجأة"'], ['Login from a new device abroad', 'دخول من جهاز جديد برا']],
      key: ['Hacked manager account wanting gift-card codes', 'حساب مدير مخترق يبي أكواد بطاقات'],
      sum: ['A hacked account pretending to be your manager, chasing gift-card codes.', 'حساب مخترق ينتحل صفة مديرتك، ويطارد أكواد بطاقات الهدايا.'],
      exit: ['IT locked the account an hour later.', 'الدعم الفني قفل الحساب بعد ساعة.']
    },

    // =================== ATTACKERS ===================
    {
      id: 'A1', role: 'attacker', jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Hamed', 'حامد'], age: 27, v: { glasses: 'mirror', badge: 'VENDOR' } },
      claim: ['an IT vendor', 'مورد تقنية'],
      arrive: ['A man in a navy polo with a red lanyard taps his badge at the gate.', 'رجل بقميص كحلي وشريط أحمر يأشّر على بطاقته عند البوابة.'],
      open: ['Morning! IT vendor. I need [[five minutes in the server room]] to [[plug in an update]]. Quick job.', 'صباح الخير! من مورد التقنية. أحتاج [[خمس دقايق في غرفة الخوادم]] عشان [[أوصل تحديث]]. شغلة سريعة.'],
      card: { title: ['Gate pass', 'تصريح البوابة'], rows: [[['Visitor', 'الزائر'], ['Hamed (vendor)', 'حامد (مورد)']], [['Going to', 'الوجهة'], ['Server room', 'غرفة الخوادم'], 1]] },
      acts: {
        ticket: ['Ticket? Your IT manager [[called me directly]], it\'s urgent.', 'تذكرة؟ مدير التقنية [[اتصل فيني مباشرة]]، الموضوع مستعجل.'],
        badge: { say: ["Here's my vendor badge. All official.", 'هذي بطاقة المورد. كلها رسمية.'], reveal: [[['Vendor badge', 'بطاقة المورد'], ['No company name, no photo', 'بدون اسم شركة أو صورة'], 1]] },
        confirm: ['IT is [[in a meeting]]. Don\'t disturb them, I\'ll be out fast.', 'التقنية [[في اجتماع]]. لا تزعجهم، بطلع بسرعة.'],
        log: ["I'll sign on the way out, [[I'm in a hurry]].", 'بوقّع وأنا طالع، [[أنا مستعجل]].'],
        usb: ["It's only a [[small USB]] with the patch. Totally safe.", 'بس [[فلاش صغير]] فيه التحديث. آمن مية بالمية.'],
        wait: ["I don't need an escort, [[I know the way]].", 'ما أحتاج مرافق، [[أعرف الطريق]].']
      },
      flags: [['No ticket: "the manager called me"', 'بدون تذكرة: "المدير اتصل فيني"'], ['Wants to plug in a USB', 'يبي يوصل فلاش'], ['Avoided the escort and visitor log', 'تهرّب من المرافق وسجل الزوار']],
      key: ['Wanted the server room with a USB', 'يبي غرفة الخوادم مع فلاش'],
      sum: ['He wanted unescorted access to plug a device into bank systems.', 'كان يبي يدخل بدون مرافق ويوصل جهاز بأنظمة البنك.'],
      exit: ['Security walked him out. No vendor visit was booked.', 'الأمن طلّعه. ما كان في أي زيارة مورد محجوزة.']
    },
    {
      id: 'A2', role: 'attacker', jobs: ['teller', 'rm', 'hr', 'ops'], channel: 'phone', place: 'callcentre',
      who: { base: 'polo', name: ['Rashid', 'راشد'], age: 27, v: { shirt: '#44546a', collar: '#56677f', glasses: 'clear', badge: 'IT', lanyard: '#1d5694', mouth: 'smile', brows: 'happy' } },
      claim: ['Head Office IT', 'تقنية المبنى الرئيسي'],
      line: ['Internal? +968 2••• ••00 · withheld', 'داخلي؟ +968 2••• ••00 · مخفي'],
      open: ["Hello, Rashid from Head Office IT. We're fixing a security issue on your PC. Please [[read me the code]] you just got by SMS.", 'هلا، راشد من تقنية المبنى الرئيسي. نصلّح مشكلة أمنية في جهازك. لو سمحت [[اقرأ لي الكود]] اللي وصلك بالرسالة.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Rashid (IT, claimed)', 'راشد (التقنية، حسب قوله)']], [['Wants', 'يطلب'], ['Your SMS code', 'كود الرسالة'], 1]] },
      acts: {
        otp: ["It's not a real OTP, just [[a test code]]. Everyone in your branch already gave it.", 'هذا مو رمز تحقق، بس [[كود تجربة]]. الكل في فرعك عطاني إياه.'],
        ticket: ["There's no ticket, it's an [[emergency fix]].", 'ما في تذكرة، هذا [[تصليح طارئ]].'],
        callback: ["Don't call the helpdesk, [[the line is down]]. That's why I'm calling you.", 'لا تتصل على الدعم، [[الخط عطلان]]. عشان كذا أتصل عليك.'],
        badge: ['My staff ID? Er… [[4-4-7… it\'s long]]. Just the code please.', 'رقمي الوظيفي؟ أمم… [[4-4-7… طويل]]. بس الكود لو سمحت.'],
        why: ['If we don\'t fix it in [[five minutes]], your account gets locked.', 'إذا ما صلحناها في [[خمس دقايق]]، حسابك بينقفل.'],
        policy: ['Fine, then [[your account will be blocked]] and it\'s your fault.', 'خلاص، [[حسابك بينحظر]] وأنت السبب.']
      },
      flags: [['Asked for the SMS code', 'طلب كود الرسالة'], ['Threatened to lock your account', 'هدّد بقفل حسابك'], ["Wouldn't let you call the real helpdesk", 'منعك تتصل على الدعم الحقيقي']],
      key: ['Asked for your one-time code', 'طلب رمز التحقق حقك'],
      sum: ['He wanted your one-time code to break into your account.', 'كان يبي رمز التحقق حقك عشان يخترق حسابك.'],
      exit: ["He hung up when you said you'd call the helpdesk.", 'سكّر الخط لما قلت بتتصل على الدعم.']
    },
    {
      id: 'A3', role: 'attacker', jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Amal', 'أمل'], age: 26, v: { cloth: '#9fd9c0', dots: '#1d5694', prop: 'phone', brows: 'stern', mouth: 'flat' } },
      claim: ['a colleague in Treasury', 'زميلة في الخزينة'],
      line: ['Amal K. · Treasury', 'أمل ك. · الخزينة'],
      open: ['Hi helpdesk, Amal from Treasury. Salma is on leave. Please [[reset her MFA]] to [[my phone]] so I can approve her payments.', 'هلا بالدعم، أمل من الخزينة. سلمى في إجازة. لو سمحتوا [[صفّروا التحقق الثنائي حقها]] على [[تلفوني]] عشان أوافق على مدفوعاتها.'],
      card: { title: ['Chat check', 'فحص المحادثة'], rows: [[['Requester', 'مقدم الطلب'], ['Amal K. · Treasury', 'أمل ك. · الخزينة']], [['For user', 'للمستخدم'], ['Salma B. (on leave)', 'سلمى ب. (إجازة)'], 1]] },
      acts: {
        ticket: ['No ticket, it\'s [[faster this way]]. Her manager agreed.', 'بدون تذكرة، [[أسرع كذا]]. مديرها موافق.'],
        confirm: ['Salma is [[unreachable]] on holiday. Her manager is busy.', 'سلمى [[ما ترد]] في إجازتها. ومديرها مشغول.'],
        policy: ['Every team does this. [[Don\'t be difficult]].', 'كل الفرق تسوي كذا. [[لا تعقّدها]].'],
        badge: { say: ['My staff ID is 20981. Happy?', 'رقمي الوظيفي 20981. مرتاح؟'], reveal: [[['Chat session', 'جلسة المحادثة'], ['New device, new location', 'جهاز جديد، مكان جديد'], 1]] },
        system: { say: ['Just do it please.', 'بس سوّها لو سمحت.'], reveal: [[['MFA reset', 'تصفير التحقق'], ['Only for the account owner', 'لصاحب الحساب فقط'], 1]] },
        why: ['Payments are [[stuck]]. The bank will lose money today!', 'المدفوعات [[واقفة]]. البنك بيخسر فلوس اليوم!']
      },
      flags: [["Wanted someone else's MFA on her phone", 'تبي تحقق شخص ثاني على تلفونها'], ['Skipped the ticket process', 'تجاوزت نظام التذاكر'], ['Chat login from a new device', 'دخول المحادثة من جهاز جديد']],
      key: ["Wanted another user's MFA moved to her", 'تبي تحقق مستخدم ثاني ينتقل لها'],
      sum: ["An attacker using a hacked chat account to take over another user's login.", 'مخترق يستخدم حساب محادثة مخترق عشان يسيطر على دخول مستخدم ثاني.'],
      exit: ['The real Amal had no idea her account was being used.', 'أمل الحقيقية ما كانت تدري إن حسابها ينستخدم.']
    },
    {
      id: 'A4', role: 'attacker', jobs: ['ops', 'hr', 'ceo', 'it'], channel: 'email', place: 'ops',
      who: { base: 'abaya', name: ['Noura', 'نورة'], age: 28, v: { sunglasses: false, mouth: 'smile', prop: null, cloth: '#2a2236' } },
      claim: ['HR Communications', 'اتصالات الموارد البشرية'],
      line: ['hr-comms@ahlibank-mail.com', 'hr-comms@ahlibank-mail.com'],
      open: ['ACTION REQUIRED. All staff must sign the new policy [[by 5 pm today]]. Log in with your bank password here: [[policy-portal-login.net]]', 'إجراء مطلوب. على كل الموظفين توقيع السياسة الجديدة [[قبل الساعة 5 اليوم]]. ادخل بكلمة مرور البنك هني: [[policy-portal-login.net]]'],
      card: { title: ['Email check', 'فحص الإيميل'], rows: [[['From', 'من'], ['HR Communications', 'اتصالات الموارد']], [['Asks for', 'يطلب'], ['Your bank password', 'كلمة مرور البنك'], 1]] },
      acts: {
        link: ["It's our new portal, [[faster than the intranet]]. Just log in.", 'هذي بوابتنا الجديدة، [[أسرع من الإنترانت]]. بس ادخل.'],
        official: ["It's [[not on the intranet yet]]. This is the only link.", '[[مو على الإنترانت للحين]]. هذا الرابط الوحيد.'],
        callback: ['HR is very busy today, [[please don\'t call]]. Just click.', 'الموارد مشغولين اليوم، [[لا تتصل لو سمحت]]. بس اضغط.'],
        system: { say: ['Did you sign yet?', 'وقّعت؟'], reveal: [[['Sender domain', 'نطاق المرسل'], ['ahlibank-mail.com', 'ahlibank-mail.com'], 1], [['Link', 'الرابط'], ['Not a bank website', 'مو موقع البنك'], 1]] },
        why: ['Anyone who misses the deadline gets [[a warning letter]].', 'اللي يفوّت الموعد بيوصله [[إنذار]].'],
        otp: ['Then you\'ll be [[reported to your manager]].', 'أجل [[بنبلّغ مديرك]].']
      },
      flags: [['A link asking for your bank password', 'رابط يطلب كلمة مرور البنك'], ['Not on the intranet', 'مو موجود في الإنترانت'], ['Deadline plus a threat', 'موعد نهائي وتهديد']],
      key: ['Phishing link asking for your password', 'رابط تصيد يطلب كلمة المرور'],
      sum: ['A phishing email built to steal staff passwords.', 'إيميل تصيّد مصمم يسرق كلمات مرور الموظفين.'],
      exit: ['IT confirmed: the link was a fake login page.', 'التقنية أكدت: الرابط صفحة دخول مزيفة.']
    },
    {
      id: 'A5', role: 'attacker', jobs: ['guard', 'reception'], channel: 'person', place: 'gate',
      who: { base: 'polo', name: ['Yaqoob', 'يعقوب'], age: 25, v: { shirt: '#d9822b', collar: '#b86a1f', badge: 'COURIER', lanyard: '#1b1410', prop: 'parcel', mouth: 'smile', brows: 'happy' } },
      claim: ['a courier with a parcel', 'مندوب توصيل'],
      arrive: ['A courier in an orange shirt arrives holding a taped box.', 'مندوب بقميص برتقالي يوصل ومعه كرتون ملفوف.'],
      open: ['Delivery for the finance director. I must [[hand it to him upstairs]], and he needs to [[sign on my tablet]].', 'شحنة للمدير المالي. لازم [[أسلّمها له فوق بنفسي]]، ولازم [[يوقّع على جهازي]].'],
      card: { title: ['Delivery', 'التوصيل'], rows: [[['For', 'إلى'], ['Finance director', 'المدير المالي']], [['Courier', 'المندوب'], ['Yaqoob (no company named)', 'يعقوب (بدون اسم شركة)'], 1]] },
      acts: {
        why: ["Company rules. It's [[confidential]], I can't leave it here.", 'نظام الشركة. هذي [[سرية]]، ما أقدر أخليها هني.'],
        confirm: ['No need to call, [[he\'s expecting me]].', 'ما يحتاج تتصل، [[هو ينتظرني]].'],
        id: ['My ID is in the van. I\'ll [[just go up]] quickly.', 'بطاقتي في السيارة. بس [[بطلع فوق]] بسرعة.'],
        wait: ["If I leave it, [[I'll lose my job]]. Two minutes upstairs!", 'لو خليتها، [[بنفصل من شغلي]]. دقيقتين فوق!'],
        appt: { say: ['It\'s a surprise delivery.', 'هذي شحنة مفاجئة.'], reveal: [[['Expected deliveries', 'الشحنات المتوقعة'], ['None today', 'ما في اليوم'], 1]] },
        badge: { say: ["Here's my courier badge.", 'هذي بطاقة المندوب.'], reveal: [[['Courier badge', 'بطاقة المندوب'], ['Handwritten, no logo', 'مكتوبة باليد، بدون شعار'], 1]] }
      },
      flags: [['Insisted on going upstairs', 'أصر يطلع فوق'], ['No ID, no expected delivery', 'بدون هوية ولا شحنة متوقعة'], ["Wouldn't leave the parcel at reception", 'رفض يخلي الشحنة في الاستقبال']],
      key: ['Fake delivery to get upstairs', 'توصيل وهمي عشان يطلع فوق'],
      sum: ['He used a fake delivery to get past security into the offices.', 'استخدم توصيل وهمي عشان يتجاوز الأمن ويدخل المكاتب.'],
      exit: ['He left the "parcel" behind. It was empty.', 'خلّى "الشحنة" وراه. كانت فاضية.']
    },
    {
      id: 'A6', role: 'attacker', jobs: ['hr', 'reception'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Shaikha', 'شيخة'], age: 23, v: { cloth: '#f2c6d6', dots: '#c8423a', prop: 'folder', mouth: 'smile' } },
      claim: ['a job candidate', 'متقدمة لوظيفة'],
      arrive: ['A young woman with a folder waves at you with a friendly smile.', 'شابة معها ملف تأشر لك بابتسامة.'],
      open: ['Hi! I\'m here for an interview. My CV is on this USB. Can you [[print it from your PC]]? [[Mine\'s not working]].', 'هلا! جاية لمقابلة. سيرتي الذاتية على هالفلاش. ممكن [[تطبعها من جهازك]]؟ [[جهازي خربان]].'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Shaikha M.', 'شيخة م.']], [['Wants', 'تطلب'], ['USB into your PC', 'توصيل فلاش بجهازك'], 1]] },
      acts: {
        appt: { say: ["It's at 11, with… er, [[someone from HR]].", 'الساعة 11، مع… أمم، [[أحد من الموارد]].'], reveal: [[['Interview list', 'قائمة المقابلات'], ['No "Shaikha" today', 'ما في "شيخة" اليوم'], 1]] },
        usb: ["It's just a CV! [[It'll take one second]].", 'بس سيرة ذاتية! [[ثانية وحدة]].'],
        id: { say: ['Sure, here\'s my ID.', 'أكيد، هذي بطاقتي.'], reveal: [[['ID', 'البطاقة'], ['Shaikha M. · matches', 'شيخة م. · مطابقة']]] },
        confirm: ['I [[forgot the name]]. Can\'t you just print it?', '[[نسيت الاسم]]. ما تقدر تطبعها وبس؟'],
        wait: ['OK… but [[could I use the PC in that office]] while I wait?', 'طيب… بس [[ممكن أستخدم الجهاز اللي في المكتب]] وأنا أنتظر؟'],
        email: ['My email is [[locked]]. The USB is easier.', 'إيميلي [[مقفل]]. الفلاش أسهل.']
      },
      flags: [['Pushed her USB into a bank PC', 'أصرت توصل الفلاش بجهاز البنك'], ['Not on the interview list', 'مو موجودة بقائمة المقابلات'], ["Couldn't name the interviewer", 'ما عرفت اسم المقابِل']],
      key: ['Wanted her USB in a bank PC', 'تبي توصل فلاشها بجهاز البنك'],
      sum: ['She tried to get a USB with malware into a bank computer.', 'حاولت توصل فلاش فيه برنامج خبيث بجهاز البنك.'],
      exit: ['The USB had a hidden program on it.', 'الفلاش كان فيه برنامج مخفي.']
    },
    {
      id: 'A7', role: 'attacker', jobs: ['ceo', 'rm', 'teller'], channel: 'person', place: 'branchoff',
      who: { base: 'dish', name: ['Saif', 'سيف'], age: 31, v: { headwear: 'massar', cap: '#1d5694', capPat: '#e6c95a', capBand: '#fbfaf5', glasses: true, prop: 'folder', brows: 'stern', mouth: 'flat' } },
      claim: ['a central audit inspector', 'مفتش تدقيق مركزي'],
      arrive: ['A serious man with a folder walks in and closes the office door.', 'رجل جدي معه ملف يدخل ويسكّر باب المكتب.'],
      open: ['Central audit. This is a [[surprise inspection]]. Log me into your system [[with your account]] so I can check the records.', 'تدقيق مركزي. هذا [[تفتيش مفاجئ]]. دخّلني على النظام [[بحسابك]] عشان أراجع السجلات.'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Saif (auditor, claimed)', 'سيف (مدقق، حسب قوله)']], [['Wants', 'يطلب'], ['Your login', 'حساب الدخول حقك'], 1]] },
      acts: {
        letter: ['The letter is [[being emailed]]. Start without it.', 'الخطاب [[ينرسل بالإيميل]]. ابدأ بدونه.'],
        badge: { say: ["Here's my card.", 'هذا كرتي.'], reveal: [[['Card', 'الكرت'], ['Name only, no regulator logo', 'اسم بس، بدون شعار الجهة'], 1]] },
        confirm: ['Calling compliance [[ruins the surprise]]. Don\'t.', 'الاتصال بالامتثال [[يخرّب المفاجأة]]. لا تتصل.'],
        policy: ['Refusing an auditor is [[a serious offence]].', 'رفض المدقق [[مخالفة خطيرة]].'],
        why: ['My access [[isn\'t set up yet]]. Yours is faster.', 'صلاحياتي [[ما تجهزت للحين]]. حسابك أسرع.'],
        wait: ["I'll [[come back later]] then…", 'أجل [[برجع بعدين]]…']
      },
      flags: [['Wanted to use your login', 'يبي يستخدم حسابك'], ['No letter or regulator ID', 'بدون خطاب أو هوية الجهة'], ['Avoided compliance', 'تهرّب من الامتثال']],
      key: ['Fake auditor wanting your login', 'مدقق مزيف يبي حسابك'],
      sum: ['A fake auditor trying to get into bank systems through your account.', 'مدقق مزيف يحاول يدخل أنظمة البنك عن طريق حسابك.'],
      exit: ['Compliance had no inspection scheduled.', 'الامتثال ما عندهم أي تفتيش مجدول.']
    },

    // =================== STEALERS ===================
    {
      id: 'T1', role: 'stealer', jobs: ['teller', 'rm'], channel: 'whatsapp', place: 'callcentre',
      who: { base: 'abaya', name: ['Maryam', 'مريم'], age: 29, v: {} },
      claim: ['the customer', 'العميلة'],
      line: ['+968 9••• ••87 · typing…', '+968 9••• ••87 · تكتب…'],
      open: ['Hi, I lost my phone. Please update my number to this one and send my new card to [[a new address]].', 'هلا، ضاع تلفوني. لو سمحت حدّث رقمي لهذا الرقم وأرسل بطاقتي الجديدة [[لعنوان جديد]].'],
      card: { title: ['Customer record', 'سجل العميل'], rows: [[['Account holder', 'صاحبة الحساب'], ['Aisha K.', 'عائشة ك.']], [['Phone on file', 'الرقم المسجل'], ['+968 9••• 4410', '+968 9••• 4410']], [['Card address', 'عنوان البطاقة'], ['Al Hail North', 'الحيل الشمالية']], [['Request', 'الطلب'], ['Change phone + address', 'تغيير الرقم والعنوان'], 1]] },
      acts: {
        secq: { say: ["I don't remember it. Can you just [[tell me the balance]]?", 'ما أذكره. ممكن بس [[تقول لي الرصيد]]؟'], reveal: [[['Security question', 'سؤال الأمان'], ['Not answered', 'ما انجاوب'], 1]] },
        callback: ["That number is lost, remember? [[Don't call it]].", 'الرقم ضاع، نسيت؟ [[لا تتصل عليه]].'],
        who: { say: ["The account is under Aisha's name. [[I manage her banking]] for her.", 'الحساب باسم عائشة. [[أنا أدير حساباتها]] عنها.'], reveal: [[['Caller', 'المتصلة'], ['Not the account holder', 'مو صاحبة الحساب'], 1]] },
        branch: ["I can't go to a branch, I'm [[too busy]]. WhatsApp is easier.", 'ما أقدر أروح الفرع، أنا [[مشغولة وايد]]. الواتساب أسهل.'],
        why: ['I need the card [[before the weekend]].', 'أحتاج البطاقة [[قبل الويكند]].'],
        policy: ['Fine, then just [[send me her statement]] so I can check.', 'خلاص، بس [[أرسل لي كشف حسابها]] أتأكد.']
      },
      flags: [['Change phone and address together', 'تغيير الرقم والعنوان مع بعض'], ['Not the account holder', 'مو صاحبة الحساب'], ['Fishing for the balance', 'تحاول تعرف الرصيد']],
      key: ["Couldn't answer the security question", 'ما جاوبت سؤال الأمان'],
      sum: ["She wanted to take over someone else's account by changing the phone and address.", 'كانت تبي تسيطر على حساب غيرها بتغيير الرقم والعنوان.'],
      exit: ['Last seen: offline.', 'آخر ظهور: غير متصلة.']
    },
    {
      id: 'T2', role: 'stealer', jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'polo', name: ['Badr', 'بدر'], age: 28, v: { shirt: '#2b3a55', mustache: true, mouth: 'flat', brows: 'neutral' } },
      claim: ['the account holder', 'صاحب الحساب'],
      arrive: ['A young man slides a civil ID under the glass without a word.', 'شاب يمرر بطاقة شخصية تحت الزجاج بدون ولا كلمة.'],
      open: ['I want to close my account and [[take everything in cash]]. Here\'s [[my ID]].', 'أبي أسكّر حسابي و[[آخذ كل شي كاش]]. هذي [[بطاقتي]].'],
      card: { title: ['Civil ID', 'البطاقة الشخصية'], rows: [[['Name', 'الاسم'], ['Ali R.', 'علي ر.']], [['Born', 'تاريخ الميلاد'], ['1971', '1971'], 1], [['Request', 'الطلب'], ['Close account, all cash', 'تسكير الحساب، كله كاش'], 1]] },
      acts: {
        id: ["That's me in the photo, [[I was younger]].", 'هذا أنا في الصورة، [[كنت أصغر]].'],
        secq: ['My signature? It [[changed]] over the years.', 'توقيعي؟ [[تغيّر]] مع السنين.'],
        why: ["I'm moving abroad [[tonight]].", 'بسافر برا [[الليلة]].'],
        system: { say: ['What are you looking for?', 'شو تدور؟'], reveal: [[['Account holder age', 'عمر صاحب الحساب'], ['55', '55'], 1], [['Signature on file', 'التوقيع المسجل'], ["Doesn't match", 'ما يطابق'], 1]] },
        callback: ['My phone is [[off]], just use the ID.', 'تلفوني [[مقفل]]، بس استخدم البطاقة.'],
        branch: ["I don't have other papers. [[Can't you just do it?]]", 'ما عندي أوراق ثانية. [[ما تقدر تخلصها وبس؟]]']
      },
      flags: [["ID belongs to a man in his 50s", 'البطاقة لرجل عمره 50+'], ['All money in cash, tonight', 'كل الفلوس كاش، الليلة'], ["Signature doesn't match", 'التوقيع ما يطابق']],
      key: ["Used another man's ID", 'استخدم بطاقة شخص ثاني'],
      sum: ["He used a stolen ID to empty another man's account.", 'استخدم بطاقة مسروقة عشان يفضّي حساب رجل ثاني.'],
      exit: ['He left "his" ID on the counter and ran.', 'خلّى "بطاقته" على الكاونتر وهرب.']
    },
    {
      id: 'T3', role: 'stealer', jobs: ['hr'], channel: 'person', place: 'hroffice',
      who: { base: 'dish', name: ['Talal', 'طلال'], age: 27, v: { beard: false, robe: '#f4f1ea', cap: '#f6f0de', capPat: '#00843d', mouth: 'smile', brows: 'happy' } },
      claim: ['a colleague from Finance', 'زميل من المالية'],
      arrive: ['A colleague you have seen in the canteen leans on your desk.', 'زميل شفته في الكافتيريا يتكي على مكتبك.'],
      open: ['Hi, Talal from Finance. Send me the full staff list with [[salaries and civil ID numbers]]? To [[my Gmail]], work email is slow.', 'هلا، طلال من المالية. ترسل لي قائمة الموظفين كاملة مع [[الرواتب وأرقام البطاقات]]؟ على [[جيميلي]]، إيميل الشغل بطيء.'],
      card: { title: ['Data request', 'طلب بيانات'], rows: [[['From', 'من'], ['Talal · Finance', 'طلال · المالية']], [['Data', 'البيانات'], ['Salaries + civil IDs', 'رواتب + أرقام بطاقات'], 1], [['Send to', 'الإرسال إلى'], ['Personal Gmail', 'جيميل شخصي'], 1]] },
      acts: {
        official: ['Work email [[bounces big files]]. Gmail is fine.', 'إيميل الشغل [[يرفض الملفات الكبيرة]]. الجيميل عادي.'],
        why: ["It's for a [[budget report]]. My manager needs it today.", 'عشان [[تقرير الميزانية]]. مديري يبيه اليوم.'],
        confirm: ["My manager is [[travelling]]. I'll get approval later.", 'مديري [[مسافر]]. بجيب الموافقة بعدين.'],
        badge: { say: ["Here's my staff badge. We're colleagues!", 'هذي بطاقتي. إحنا زملاء!'], reveal: [[['Staff', 'موظف'], ['Talal S. · Finance · real', 'طلال س. · المالية · حقيقي']], [['HR data access', 'صلاحية بيانات الموارد'], ['Not approved', 'غير معتمدة'], 1]] },
        policy: ['The form takes a week. [[Just between us]].', 'الاستمارة تاخذ أسبوع. [[بيني وبينك]].'],
        what: ['Names, salaries, IDs, [[bank accounts]] — everything.', 'الأسماء، الرواتب، البطاقات، [[الحسابات البنكية]] — كل شي.']
      },
      flags: [['Wanted personal data sent to Gmail', 'يبي بيانات شخصية على الجيميل'], ['No manager approval', 'بدون موافقة المدير'], ['Asked for far more data than needed', 'طلب بيانات أكثر من اللازم']],
      key: ['Staff data to a personal Gmail', 'بيانات موظفين لجيميل شخصي'],
      sum: ['A real colleague trying to take staff data out to a personal email.', 'زميل حقيقي يحاول يطلّع بيانات الموظفين لإيميل شخصي.'],
      exit: ['The request was reported to compliance.', 'انرفع الطلب للامتثال.']
    },
    {
      id: 'T4', role: 'stealer', jobs: ['it', 'ops'], channel: 'internal', place: 'itdesk',
      who: { base: 'abaya', name: ['Rania', 'رانيا'], age: 28, v: { sunglasses: false, cloth: '#1d2f55', trim: '#a9c8ec', prop: 'laptop', mole: false } },
      claim: ['the new app contractor', 'متعاقدة التطبيق الجديد'],
      line: ['Rania T. · Contractor', 'رانيا ت. · متعاقدة'],
      open: ["Hi, I'm Rania, the new app contractor. Please export [[the customer database]] with phone numbers. We need [[real data for testing]].", 'هلا، أنا رانيا متعاقدة التطبيق الجديد. لو سمحت صدّر [[قاعدة بيانات العملاء]] مع أرقام التلفونات. نحتاج [[بيانات حقيقية للتجربة]].'],
      card: { title: ['Request', 'الطلب'], rows: [[['From', 'من'], ['Rania T. · contractor', 'رانيا ت. · متعاقدة']], [['Data', 'البيانات'], ['All customers + phones', 'كل العملاء + التلفونات'], 1]] },
      acts: {
        ticket: ['The change ticket is [[coming tomorrow]]. Start today.', 'تذكرة التغيير [[بتوصل باكر]]. ابدأ اليوم.'],
        why: ['Fake data [[doesn\'t work]] with our app.', 'البيانات الوهمية [[ما تشتغل]] مع تطبيقنا.'],
        confirm: ['The project manager said [[it\'s fine]], but he\'s offline now.', 'مدير المشروع قال [[عادي]]، بس هو غير متصل الحين.'],
        system: { say: ["I'm waiting…", 'أنتظر…'], reveal: [[['Contractor access', 'صلاحية المتعاقدة'], ['Ends Oct 31', 'تنتهي 31 أكتوبر']], [['Data export', 'تصدير البيانات'], ['Needs data-owner approval', 'يحتاج موافقة مالك البيانات'], 1]] },
        policy: ['Then just send [[a small sample]], 5,000 customers.', 'أجل بس أرسل [[عينة صغيرة]]، 5,000 عميل.'],
        official: ['Upload it to [[my personal cloud folder]], the link is in the chat.', 'ارفعها على [[مجلدي الشخصي في السحابة]]، الرابط في المحادثة.']
      },
      flags: [['Real customer data "for testing"', 'بيانات عملاء حقيقية "للتجربة"'], ['No ticket or approval', 'بدون تذكرة أو موافقة'], ['Wanted it in a personal cloud folder', 'تبيها في مجلد سحابي شخصي']],
      key: ['Customer data to a personal cloud', 'بيانات العملاء لسحابة شخصية'],
      sum: ['A contractor trying to walk out with customer data.', 'متعاقدة تحاول تطلع ومعها بيانات العملاء.'],
      exit: ['Her access was suspended pending review.', 'انوقفت صلاحياتها لين المراجعة.']
    },
    {
      id: 'T5', role: 'stealer', jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'shayla', name: ['Hind', 'هند'], age: 25, v: { cloth: '#e6c95a', dots: '#0b2547', prop: 'phone', brows: 'worried', mouth: 'flat' } },
      claim: ['the account holder, Zainab', 'صاحبة الحساب، زينب'],
      line: ['+968 7••• ••40 · unknown', '+968 7••• ••40 · غير معروف'],
      open: ["Hi, I'm Zainab Al Harthi. I just want to know [[my balance]] and [[my last five transactions]].", 'هلا، أنا زينب الحارثية. بس أبي أعرف [[رصيدي]] و[[آخر خمس عمليات]].'],
      card: { title: ['Customer record', 'سجل العميل'], rows: [[['Account holder', 'صاحبة الحساب'], ['Zainab H.', 'زينب ح.']], [['Wants', 'تطلب'], ['Balance + transactions', 'الرصيد + العمليات']]] },
      acts: {
        secq: { say: ['My date of birth? Er… [[1995? Or 1996]].', 'تاريخ ميلادي؟ أمم… [[1995؟ ولا 1996]].'], reveal: [[['Date of birth', 'تاريخ الميلاد'], ['1988 on file', '1988 بالسجل'], 1]] },
        callback: ["I'm on my [[friend's phone]], don't call my number.", 'أنا على [[تلفون صديقتي]]، لا تتصل على رقمي.'],
        why: ['I think my husband is [[spending my money]].', 'أحس إن زوجي [[يصرف فلوسي]].'],
        system: { say: ['Is something wrong?', 'في شي غلط؟'], reveal: [[['Calling number', 'رقم المتصل'], ['Not registered', 'غير مسجل'], 1]] },
        branch: ["I can't come in. [[Just read them]] to me quickly.", 'ما أقدر أجي. [[بس اقرأها لي]] بسرعة.'],
        policy: ["It's MY account! [[Fine, just the balance]] then.", 'هذا حسابي أنا! [[خلاص، بس الرصيد]] أجل.']
      },
      flags: [['Wrong date of birth', 'تاريخ ميلاد غلط'], ['Calling from an unknown number', 'تتصل من رقم غير معروف'], ['Kept fishing for account details', 'تحاول تعرف تفاصيل الحساب']],
      key: ['Wrong date of birth, unknown number', 'تاريخ ميلاد غلط، رقم غير معروف'],
      sum: ["She was collecting another customer's account details.", 'كانت تجمع تفاصيل حساب عميلة ثانية.'],
      exit: ["Zainab's real phone showed no call to the bank.", 'تلفون زينب الحقيقي ما فيه أي اتصال للبنك.']
    },
    {
      id: 'T6', role: 'stealer', jobs: ['reception', 'hr', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Omar', 'عمر'], age: 24, v: { shirt: '#4f86c6', collar: '#3a6aa6', prop: 'folder', mouth: 'smile', brows: 'happy' } },
      claim: ['a university student', 'طالب جامعي'],
      arrive: ['A cheerful student with a folder asks if you have a minute.', 'طالب مبتسم ومعه ملف يسأل إذا عندك دقيقة.'],
      open: ["I'm a student doing a project. Could you give me [[the names and emails]] of everyone in IT and Finance? And [[who reports to whom]]?", 'أنا طالب وعندي مشروع. ممكن تعطيني [[أسماء وإيميلات]] كل موظفي التقنية والمالية؟ و[[منو يتبع منو]]؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Omar (student)', 'عمر (طالب)']], [['Wants', 'يطلب'], ['Staff names, emails, org chart', 'أسماء وإيميلات وهيكل'], 1]] },
      acts: {
        letter: ['My university letter is [[at home]]. It\'s a small project.', 'خطاب الجامعة [[في البيت]]. مشروع صغير.'],
        why: ["It's for a [[research paper]] on banks.", 'عشان [[بحث]] عن البنوك.'],
        confirm: ["Communications will take forever. You're [[much more helpful]]!", 'الاتصال المؤسسي بياخذون وقت. أنت [[أفيد بوايد]]!'],
        id: { say: ["Here's my student card.", 'هذي بطاقة الجامعة.'], reveal: [[['Student card', 'بطاقة الطالب'], ['Expired 2023', 'منتهية 2023'], 1]] },
        policy: ["Just [[the IT manager's name]] and email then?", 'طيب بس [[اسم مدير التقنية]] وإيميله؟'],
        what: ['Also, [[what software]] do you use for payments?', 'وبعد، [[أي برنامج]] تستخدمون للمدفوعات؟']
      },
      flags: [['Wanted names, emails and the org chart', 'يبي أسماء وإيميلات والهيكل'], ['Asked which systems the bank uses', 'سأل عن أنظمة البنك'], ['Expired student card, no letter', 'بطاقة منتهية، بدون خطاب']],
      key: ['Collecting staff names and emails', 'يجمع أسماء وإيميلات الموظفين'],
      sum: ['He was harvesting staff details to target them later.', 'كان يجمع بيانات الموظفين عشان يستهدفهم بعدين.'],
      exit: ['He left before Communications came down.', 'طلع قبل ما ينزل الاتصال المؤسسي.']
    },
    {
      id: 'T7', role: 'stealer', jobs: ['ceo', 'reception'], channel: 'phone', place: 'exec',
      who: { base: 'dish', name: ['Hilal', 'هلال'], age: 30, v: { headwear: 'massar', cap: '#00843d', capPat: '#fbfaf5', capBand: '#c8102e', glasses: true, mouth: 'talk' } },
      claim: ["a board member's advisor", 'مستشار عضو مجلس'],
      line: ['+44 7••• ••19 · abroad', '+44 7••• ••19 · دولي'],
      open: ['Good morning. I advise one of your board members. Please email me [[the board pack]] and [[the top 50 clients list]] before tomorrow.', 'صباح الخير. أنا مستشار لأحد أعضاء مجلسكم. لو سمحت أرسل لي [[ملف المجلس]] و[[قائمة أكبر 50 عميل]] قبل باكر.'],
      card: { title: ['Caller', 'المتصل'], rows: [[['Name', 'الاسم'], ['Hilal (external)', 'هلال (خارجي)']], [['Wants', 'يطلب'], ['Board pack + client list', 'ملف المجلس + قائمة العملاء'], 1]] },
      acts: {
        official: ['The board secretary is [[slow]]. Just send it directly.', 'أمين سر المجلس [[بطيء]]. بس أرسلها مباشرة.'],
        callback: ["He's [[on a flight]]. That's why he asked me.", 'هو [[في الطيارة]]. عشان كذا طلب مني.'],
        id: ['My name is Hilal. [[You won\'t find me]] in your system, I\'m external.', 'اسمي هلال. [[ما بتلقاني]] في نظامكم، أنا خارجي.'],
        system: { say: ["You're wasting time.", 'أنت تضيع الوقت.'], reveal: [[['Board advisors on file', 'المستشارون المسجلون'], ['None', 'لا يوجد'], 1]] },
        why: ['He needs to [[prepare tonight]].', 'يحتاج [[يتجهز الليلة]].'],
        policy: ["I'll tell him [[you refused]]. He won't be happy.", 'بقول له [[إنك رفضت]]. ما بيكون مبسوط.']
      },
      flags: [['Asked for confidential board papers', 'طلب أوراق المجلس السرية'], ['Unknown external person', 'شخص خارجي غير معروف'], ['Pressure: "he won\'t be happy"', 'ضغط: "ما بيكون مبسوط"']],
      key: ['Board pack and client list to an outsider', 'ملف المجلس وقائمة العملاء لشخص خارجي'],
      sum: ['He wanted confidential board and client data with no authority.', 'كان يبي بيانات المجلس والعملاء السرية بدون أي صلاحية.'],
      exit: ['The board member had never heard of him.', 'عضو المجلس ما سمع فيه أبد.']
    },

    // =================== LEGAL CUSTOMERS ===================
    {
      id: 'L1', role: 'legal', jobs: ['teller'], channel: 'person', place: 'counter',
      who: { base: 'shayla', name: ['Noor', 'نور'], age: 22, v: {} },
      claim: ['a first-time customer', 'عميلة لأول مرة'],
      arrive: ['A young woman in a light-blue shayla walks up holding a letter.', 'شابة بشيلة زرقاء فاتحة تقرّب ومعها خطاب.'],
      open: ['Hi! I just got my first salary letter. How do I open a savings account?', 'هلا! وصلني خطاب أول راتب. كيف أفتح حساب توفير؟'],
      card: { title: ['Salary letter', 'خطاب الراتب'], rows: [[['Name', 'الاسم'], ['Noor A.', 'نور أ.']], [['Employer', 'جهة العمل'], ['Ministry of Health', 'وزارة الصحة']], [['Salary', 'الراتب'], ['650 OMR / month', '650 ر.ع شهريًا']]] },
      acts: {
        id: { say: ["Of course, here's my civil ID.", 'أكيد، تفضل بطاقتي.'], reveal: [[['Civil ID', 'البطاقة'], ['Noor A. · matches letter', 'نور أ. · مطابقة للخطاب']]] },
        what: ['Just a savings account, and maybe a debit card.', 'بس حساب توفير، ويمكن بطاقة صراف.'],
        why: ['No rush at all! I want to start saving for a car.', 'أبد مو مستعجلة! أبي أبدأ أوفر لسيارة.'],
        system: { say: ['Take your time.', 'خذ راحتك.'], reveal: [[['Existing accounts', 'حسابات سابقة'], ['None', 'لا يوجد']], [['Name check', 'فحص الاسم'], ['Clear', 'سليم']]] },
        policy: ["No problem, I'll fill in whatever forms you need.", 'ما في مشكلة، بعبّي أي استمارة تحتاجها.'],
        letter: ["Yes, it's signed and stamped by my employer.", 'إيه، موقّع ومختوم من جهة عملي.']
      },
      flags: [['ID matches her salary letter', 'البطاقة مطابقة لخطاب الراتب'], ['Happy to fill forms and follow the process', 'مستعدة تعبي الاستمارات وتتبع الإجراءات'], ['No pressure, no unusual request', 'بدون ضغط ولا طلب غريب']],
      key: ['Showed ID and accepted every check', 'عرضت البطاقة وقبلت كل تحقق'],
      sum: ['She just wanted to open her first savings account.', 'كانت بس تبي تفتح أول حساب توفير.'],
      exit: ['Shukran! See you next month!', 'شكرًا! أشوفك الشهر الجاي!']
    },
    {
      id: 'L2', role: 'legal', jobs: ['guard', 'reception', 'it'], channel: 'person', place: 'gate',
      who: { base: 'dish', name: ['Ahmed', 'أحمد'], age: 22, v: { beard: false, brows: 'worried', robe: '#eef0f2', cap: '#f6f0de', capPat: '#7a55c4', mouth: 'talk' } },
      claim: ['a new joiner without a badge', 'موظف جديد بدون بطاقة'],
      arrive: ['A nervous young man in a crisp dishdasha stops at the barrier.', 'شاب متوتر بدشداشة مكوية يوقف عند الحاجز.'],
      open: ["Good morning! It's my second week. I forgot my badge at home. Can you let me in?", 'صباح الخير! هذا ثاني أسبوع لي. نسيت بطاقتي في البيت. ممكن تدخلني؟'],
      card: { title: ['Gate', 'البوابة'], rows: [[['Name', 'الاسم'], ['Ahmed S.', 'أحمد س.']], [['Badge', 'البطاقة'], ['Not with him', 'مو معه']]] },
      acts: {
        id: ["Here's my civil ID.", 'تفضل بطاقتي الشخصية.'],
        confirm: ['Sure. My manager is Ms. Fatma in Operations, extension 2210.', 'أكيد. مديرتي الأستاذة فاطمة في العمليات، تحويلة 2210.'],
        system: { say: ['I hope I\'m on there!', 'إن شاء الله موجود!'], reveal: [[['Staff list', 'قائمة الموظفين'], ['Ahmed S. · Operations · joined Oct 12', 'أحمد س. · العمليات · من 12 أكتوبر']]] },
        log: ["No problem, I'll sign the visitor log.", 'ما في مشكلة، بوقّع في سجل الزوار.'],
        wait: ["Okay, I'll wait here for my manager.", 'تمام، بنتظر مديرتي هني.'],
        policy: ["Understood. I'll get a temporary pass.", 'فاهم. باخذ تصريح مؤقت.']
      },
      flags: [['On the staff list', 'موجود بقائمة الموظفين'], ["Gave his manager's name and extension", 'عطى اسم مديرته وتحويلتها'], ['Happy to sign in and wait', 'مستعد يوقّع وينتظر']],
      key: ['On the staff list, happy to wait', 'موجود بالقائمة ومستعد ينتظر'],
      sum: ['A new joiner who simply forgot his badge at home.', 'موظف جديد نسى بطاقته في البيت وبس.'],
      exit: ["Thanks! I'll never forget it again.", 'مشكور! ما بنساها مرة ثانية.']
    },
    {
      id: 'L3', role: 'legal', jobs: ['reception', 'ceo', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'polo', name: ['Mohammed', 'محمد'], age: 30, v: { glasses: 'mirror', shirt: '#0b2547', collar: '#22385f', beard: true, prop: 'laptop', mouth: 'flat' } },
      claim: ['an investor meeting the CEO', 'مستثمر عنده موعد مع الرئيس'],
      arrive: ['A man in dark glasses rushes in, checking his watch.', 'رجل بنظارة سوداء يدخل مستعجل ويشوف ساعته.'],
      open: ["I have a 10 o'clock with the CEO. I'm a bit late, could we hurry, please?", 'عندي موعد الساعة 10 مع الرئيس التنفيذي. متأخر شوي، ممكن نستعجل لو سمحت؟'],
      card: { title: ['Visitor', 'زائر'], rows: [[['Name', 'الاسم'], ['Mohammed Al Lawati', 'محمد اللواتي']], [['Meeting', 'الموعد'], ['CEO · 10:00', 'الرئيس التنفيذي · 10:00']]] },
      acts: {
        appt: { say: ['Mohammed Al Lawati, 10:00, with the CEO\'s office.', 'محمد اللواتي، الساعة 10، مع مكتب الرئيس.'], reveal: [[['Appointment list', 'قائمة المواعيد'], ['10:00 · M. Al Lawati ✓', '10:00 · م. اللواتي ✓']]] },
        id: ["Here's my passport.", 'تفضل جوازي.'],
        confirm: ['Of course, please call them.', 'أكيد، تفضل اتصل فيهم.'],
        log: ['Sure, where do I sign?', 'أكيد، وين أوقّع؟'],
        wait: ['Fine, I\'ll wait. Is there coffee?', 'تمام، بنتظر. في قهوة؟'],
        why: ['Traffic on the expressway. Sorry!', 'زحمة على الطريق السريع. آسف!']
      },
      flags: [['On the appointment list', 'موجود بقائمة المواعيد'], ['Showed ID and signed in', 'عرض هويته ووقّع'], ['Impatient, but accepted every check', 'مستعجل، بس قبل كل تحقق']],
      key: ['Booked meeting, accepted every check', 'موعد محجوز، وقبل كل تحقق'],
      sum: ['His meeting was booked; he was just running late.', 'موعده كان محجوز، بس كان متأخر.'],
      exit: ['Thank you. Lovely bunting, by the way!', 'شكرًا. الزينة حلوة بالمناسبة!']
    },
    {
      id: 'L4', role: 'legal', jobs: ['teller', 'rm'], channel: 'person', place: 'counter',
      who: { base: 'abaya', name: ['Sara', 'سارة'], age: 27, v: { prop: 'folder', lips: '#a8423a' } },
      claim: ['the customer\'s daughter', 'بنت العميلة'],
      arrive: ['A woman in sunglasses places a thick folder on the counter.', 'امرأة بنظارة شمسية تحط ملف سميك على الكاونتر.'],
      open: ["My mother can't walk well, so I'm here to withdraw 500 OMR for her. I have the power of attorney.", 'أمي ما تقدر تمشي زين، فأنا جاية أسحب لها 500 ر.ع. معي الوكالة.'],
      card: { title: ['Power of attorney', 'وكالة رسمية'], rows: [[['For', 'الموكّلة'], ['Moza H.', 'موزة ح.']], [['Agent', 'الوكيلة'], ['Sara H.', 'سارة ح.']], [['Status', 'الحالة'], ['Notarised · valid to 2027', 'موثقة · سارية لين 2027']]] },
      acts: {
        id: { say: ["Here's my ID. It matches the attorney.", 'تفضل بطاقتي. مطابقة للوكالة.'], reveal: [[['Civil ID', 'البطاقة'], ['Sara H. · matches', 'سارة ح. · مطابقة']]] },
        poa: ['Here it is, notarised last year.', 'تفضل، موثقة السنة اللي فاتت.'],
        system: { say: ['Sure, check.', 'أكيد، تأكد.'], reveal: [[['POA on file', 'الوكالة بالنظام'], ['Registered ✓', 'مسجلة ✓']]] },
        callback: ["Sure, call her on the number you have.", 'أكيد، اتصل عليها على رقمها اللي عندكم.'],
        why: ["It's for her medicine and the house. No rush.", 'عشان دواها والبيت. مو مستعجلة.'],
        policy: ['Of course, take your time.', 'أكيد، خذ راحتك.']
      },
      flags: [['Valid, registered power of attorney', 'وكالة سارية ومسجلة'], ['ID matches the papers', 'البطاقة مطابقة للأوراق'], ['Small amount, no pressure', 'مبلغ بسيط، بدون ضغط']],
      key: ['Registered power of attorney', 'وكالة مسجلة'],
      sum: ['Her registered power of attorney let her bank for her mother.', 'وكالتها المسجلة تسمح لها تتعامل عن أمها.'],
      exit: ['Thank you, you were very careful!', 'شكرًا، كنت حريص وايد!']
    },
    {
      id: 'L5', role: 'legal', jobs: ['it'], channel: 'internal', place: 'itdesk',
      who: { base: 'shayla', name: ['Asma', 'أسماء'], age: 26, v: { cloth: '#f2c6d6', dots: '#1d5694', prop: null, glasses: true, brows: 'worried' } },
      claim: ['a colleague locked out', 'زميلة انقفل حسابها'],
      line: ['Asma N. · Credit', 'أسماء ن. · الائتمان'],
      open: ['Hi, I locked myself out after too many tries. Can you help me reset my password?', 'هلا، انقفل حسابي بعد محاولات كثيرة. ممكن تساعدني أغير كلمة المرور؟'],
      card: { title: ['Helpdesk', 'الدعم الفني'], rows: [[['User', 'المستخدم'], ['Asma N. · Credit', 'أسماء ن. · الائتمان']], [['Issue', 'المشكلة'], ['Account locked', 'حساب مقفل']]] },
      acts: {
        ticket: { say: ['Sure, ticket number INC-20931.', 'أكيد، رقم التذكرة INC-20931.'], reveal: [[['Ticket INC-20931', 'تذكرة INC-20931'], ['Opened by Asma ✓', 'فتحتها أسماء ✓']]] },
        badge: ['Staff ID 30577. I can come to your desk too.', 'رقمي الوظيفي 30577. وأقدر أجي لمكتبك بعد.'],
        callback: ['Yes, call me on extension 3145.', 'إيه، اتصل علي على تحويلة 3145.'],
        system: { say: ['Thanks for checking.', 'مشكور على التحقق.'], reveal: [[['Failed logins', 'محاولات فاشلة'], ['From her usual PC', 'من جهازها المعتاد']]] },
        policy: ['Perfect, send the reset link to my work email.', 'ممتاز، أرسل رابط التغيير على إيميل الشغل.'],
        why: ['No rush, I can work on paper for now.', 'مو مستعجلة، أقدر أشتغل على الورق الحين.']
      },
      flags: [['Raised a proper ticket', 'فتحت تذكرة رسمية'], ['Answered every check', 'جاوبت على كل تحقق'], ['Wanted the reset sent to her own work email', 'طلبت الرابط على إيميلها الرسمي']],
      key: ['Raised a ticket, answered every check', 'فتحت تذكرة وجاوبت كل تحقق'],
      sum: ['A colleague who simply forgot her password.', 'زميلة نست كلمة المرور وبس.'],
      exit: ['Thank you! Logged back in.', 'شكرًا! رجعت دخلت.']
    },
    {
      id: 'L6', role: 'legal', jobs: ['ops', 'ceo'], channel: 'phone', place: 'ops',
      who: { base: 'polo', name: ['Hamad', 'حمد'], age: 33, v: { shirt: '#2f6a4a', collar: '#3d8460', badge: 'VISITOR', lanyard: '#00843d', mouth: 'smile', brows: 'happy', mustache: true } },
      claim: ['a supplier asking about an invoice', 'مورد يسأل عن فاتورة'],
      line: ['+968 2••• ••88 · Muscat Print House', '+968 2••• ••88 · مسقط للطباعة'],
      open: ['Hello, Hamad from Muscat Print House. Could you confirm when invoice #2210 will be paid? No changes, just checking.', 'هلا، حمد من مسقط للطباعة. ممكن تأكد لي متى بتندفع الفاتورة رقم 2210؟ بدون أي تغيير، بس أتأكد.'],
      card: { title: ['Vendor file', 'ملف المورد'], rows: [[['Vendor', 'المورد'], ['Muscat Print House', 'مسقط للطباعة']], [['Invoice', 'الفاتورة'], ['#2210', '#2210']]] },
      acts: {
        callback: ['Of course, call our office number from your vendor file.', 'أكيد، اتصل على رقم مكتبنا اللي في ملف المورد.'],
        system: { say: ['Thank you.', 'مشكور.'], reveal: [[['Invoice #2210', 'الفاتورة 2210'], ['Due Oct 30', 'مستحقة 30 أكتوبر']], [['Bank details', 'بيانات البنك'], ['Unchanged', 'بدون تغيير']]] },
        id: ['Our vendor number is V-1187.', 'رقمنا كمورد V-1187.'],
        official: ["I'll send it from our registered email too.", 'برسلها من إيميلنا المسجل بعد.'],
        why: ['Just planning our cash flow. No rush.', 'بس نرتب السيولة. مو مستعجلين.'],
        policy: ['No problem, an email reply is fine.', 'ما في مشكلة، الرد بالإيميل يكفي.']
      },
      flags: [['Asked for nothing to change', 'ما طلب أي تغيير'], ['Offered the official contact on file', 'عرض التواصل الرسمي المسجل'], ['Patient, accepted the process', 'صبور وقبل الإجراءات']],
      key: ['No changes, used the official contact', 'بدون تغيير، وتواصل رسمي'],
      sum: ['He was only checking when his invoice would be paid.', 'كان بس يتأكد متى تندفع فاتورته.'],
      exit: ['Thanks, have a great Youth Day!', 'مشكور، يوم شباب سعيد!']
    },
    {
      id: 'L7', role: 'legal', jobs: ['hr', 'reception', 'guard'], channel: 'person', place: 'reception',
      who: { base: 'shayla', name: ['Reem', 'ريم'], age: 23, v: { cloth: '#ffe08a', dots: '#c8423a', prop: 'folder' } },
      claim: ['a graduate interview candidate', 'متقدمة لبرنامج الخريجين'],
      arrive: ['A young woman in a yellow shayla holds a folder of printed CVs.', 'شابة بشيلة صفراء ماسكة ملف فيه سير ذاتية مطبوعة.'],
      open: ["Hello! I'm Reem. I have an interview at 11 with HR for the graduate programme.", 'مرحبا! أنا ريم. عندي مقابلة الساعة 11 مع الموارد البشرية لبرنامج الخريجين.'],
      card: { title: ['Visitor', 'زائرة'], rows: [[['Name', 'الاسم'], ['Reem S.', 'ريم س.']], [['Here for', 'الغرض'], ['Interview · 11:00', 'مقابلة · 11:00']]] },
      acts: {
        appt: { say: ['It should be under Reem S.', 'المفروض باسم ريم س.'], reveal: [[['Interview list', 'قائمة المقابلات'], ['11:00 · Reem S. · HR ✓', '11:00 · ريم س. · الموارد ✓']]] },
        id: ["Here's my civil ID.", 'تفضل بطاقتي.'],
        confirm: ['Sure! The interviewer is Ms. Badriya.', 'أكيد! المقابِلة الأستاذة بدرية.'],
        log: ["Of course, I'll sign in.", 'أكيد، بوقّع.'],
        wait: ["Thank you, I'll wait in the lobby.", 'شكرًا، بنتظر في الصالة.'],
        what: ['Just the interview. I brought printed copies of my CV.', 'بس المقابلة. جبت نسخ مطبوعة من سيرتي.']
      },
      flags: [['On the interview list', 'موجودة بقائمة المقابلات'], ['Knew who she was meeting', 'تعرف مع منو المقابلة'], ['Printed CVs, no USB or odd requests', 'سير مطبوعة، بدون فلاش ولا طلبات غريبة']],
      key: ['On the interview list', 'موجودة بقائمة المقابلات'],
      sum: ['She was here for her booked graduate interview.', 'كانت جاية لمقابلتها المحجوزة لبرنامج الخريجين.'],
      exit: ['Wish me luck!', 'ادعيلي بالتوفيق!']
    },
    {
      id: 'L8', role: 'legal', jobs: ['teller', 'rm'], channel: 'phone', place: 'callcentre',
      who: { base: 'dish', name: ['Hussain', 'حسين'], age: 21, v: { beard: false, mustache: false, mouth: 'smile', brows: 'worried', cap: '#f6f0de', capPat: '#00843d' } },
      claim: ['a customer locked out of the app', 'عميل انقفل عليه التطبيق'],
      line: ['+968 9••• ••31 · registered', '+968 9••• ••31 · مسجل'],
      open: ["Hi, my app says my account is locked. I'm a bit worried, can you check?", 'هلا، التطبيق يقول حسابي مقفل. خايف شوي، ممكن تتأكد؟'],
      card: { title: ['Customer record', 'سجل العميل'], rows: [[['Account holder', 'صاحب الحساب'], ['Hussain A.', 'حسين أ.']], [['Issue', 'المشكلة'], ['App locked', 'التطبيق مقفل']]] },
      acts: {
        secq: { say: ['Born 4 May 2005, and my mother\'s name is Shamsa.', 'مواليد 4 مايو 2005، واسم أمي شمسة.'], reveal: [[['Security answers', 'أجوبة الأمان'], ['Correct ✓', 'صحيحة ✓']]] },
        callback: ['Yes, call me back on my registered number.', 'إيه، اتصل علي على رقمي المسجل.'],
        system: { say: ['Thanks.', 'مشكور.'], reveal: [[['Lock reason', 'سبب القفل'], ['3 wrong PINs', '3 أرقام سرية غلط']], [['Calling number', 'رقم المتصل'], ['Registered ✓', 'مسجل ✓']]] },
        why: ['I need to pay my university fees this week.', 'لازم أدفع رسوم الجامعة هالأسبوع.'],
        policy: ["Okay, I'll reset it in the app with my ID.", 'تمام، بغيرها من التطبيق ببطاقتي.'],
        branch: ['I can come to the branch tomorrow if needed.', 'أقدر أجي الفرع باكر لو احتاج.']
      },
      flags: [['Answered security questions correctly', 'جاوب أسئلة الأمان صح'], ['Called from his registered number', 'اتصل من رقمه المسجل'], ['Accepted the reset process', 'قبل إجراءات التغيير']],
      key: ['Passed security, registered number', 'جاوب الأمان، ورقمه مسجل'],
      sum: ['He got locked out after typing his PIN wrong three times.', 'انقفل حسابه بعد ما غلط في الرقم السري ثلاث مرات.'],
      exit: ['Thanks a lot!', 'مشكور وايد!']
    }
  ];
})();
