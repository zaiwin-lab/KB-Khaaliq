/* =====================================================================
   i18n.js — 4-language toggle (EN · BM · 中文 · Iban)
   House-standard data-i18n system. Marks every public-facing string,
   persists choice to localStorage, auto-picks browser language first run.
   Dashboard stays English (internal team tool).
   NOTE: Chinese & Iban copy is a solid first pass — have a native speaker
   review before the public launch.
   ===================================================================== */
(function () {
  "use strict";
  const LANGS = [["en", "EN"], ["bm", "BM"], ["zh", "中"], ["ib", "IB"]];

  const T = {
    en: {
      "nav.mission": "Mission", "nav.offer": "The Offer", "nav.how": "How it works",
      "nav.support": "Support", "nav.back": "← Back", "cta.activate": "Activate My Business",
      "hero.tag": "Representing District Kuching · Total 45 Districts of Sarawak",
      "hero.title": "I'm helping <span class=\"accent\">100 Sarawak businesses</span> go digital.",
      "hero.sub": "My name is Abdul Khaaliq bin Ahmad. As a Sarawak Digital Champion Candidate, my mission is simple: activate 100 new business websites and help local entrepreneurs get found, get trusted, and grow online.",
      "hero.activate": "Activate My Business →", "hero.support": "Support the Journey",
      "hero.trust": "Initiative by",
      "verify.title": "Official Sarawak Digital Champion",
      "verify.sub": "Verify on the SDEC website",
      "verify.chip": "SDEC Verified",
      "portrait.role": "Sarawak Digital Champion · Kuching",
      "brand.name": "Khaaliq's Mission",
      "brand.tag": "Sarawak Digital Champion",
      "mission.title": "Empowering Sarawak. Digitally. Together.",
      "mission.sub": "A movement to build a stronger digital future by inspiring communities, empowering entrepreneurs, and activating businesses across all 45 districts.",
      "pillar.inspire.t": "Inspire", "pillar.inspire.d": "Motivating communities to embrace digital opportunities.",
      "pillar.empower.t": "Empower", "pillar.empower.d": "Equipping entrepreneurs with the right tools and knowledge.",
      "pillar.activate.t": "Activate", "pillar.activate.d": "Driving real digital presence and growth for local businesses.",
      "pillar.impact.t": "Impact", "pillar.impact.d": "Strengthening Sarawak's digital economy, one business at a time.",
      "pledge.suffix": "of 100 business presences activated. Yours could be next.",
      "offer.flag": "Digital Empowerment Initiative · First 30 businesses",
      "offer.title": "Activate your website for <span class=\"price-now\">RM500</span>",
      "offer.was": "Usual RM1,380 · <strong>64% off</strong> activation to make digital presence accessible for local entrepreneurs.",
      "offer.claim": "Claim Your Activation →",
      "offer.recv.title": "What every business receives",
      "offer.recv.sub": "One complete package. This is the standard we build to, so you can judge our craft before you trust us with yours.",
      "how.title": "How it works", "how.sub": "Three steps from registration to a live website you control.",
      "how.s1.t": "Register in minutes", "how.s1.p": "Tell us the essentials, paste your links, drop your files. Our AI reads your business and drafts a summary on the spot.",
      "how.s2.t": "We build with AI + human craft", "how.s2.p": "Your profile feeds our hybrid build pipeline. We write the copy, design the pages, and prepare your site for review.",
      "how.s3.t": "You go live, in control", "how.s3.p": "Preview, approve, and publish. You get a dashboard to edit content and updates yourself, any time.",
      "support.q": "\"I have met many business owners with amazing products and stories. They didn't need a better business. They simply needed to be discovered.\"",
      "support.qby": "— Abdul Khaaliq bin Ahmad, District Kuching",
      "support.title": "Support the journey",
      "support.p": "Every business we activate strengthens Sarawak's digital economy. If you believe local entrepreneurs deserve to be found, walk with us.",
      "support.activate": "Activate a Business", "support.share": "Share the Mission",
      "final.title": "Your future, digitally empowered.",
      "final.p": "Let's build it together. Activation takes a few minutes to begin.",
      "final.activate": "Activate My Business →",
      "foot.tagline": "Abdul Khaaliq bin Ahmad, representing District Kuching. Activating 100 new business digital presences across all 45 districts of Sarawak.",
      "foot.initiative": "Initiative", "foot.partners": "The Program",
      "foot.programNote": "Sarawak Digital Champion (SDC) is a digital-empowerment program organized by SDEC, AZAM Sarawak, Kamek Digital and Sarawak Digital. This website is an independent initiative by an SDC Candidate.",
      "foot.activate": "Activate My Business", "foot.mission": "The Mission", "foot.offer": "The Offer", "foot.dash": "Team Dashboard",
      // activate page + form
      "act.title": "Let's get your business found.",
      "act.sub": "A few quick moments. No long forms. Our AI reads what you share and drafts your business profile for you, right here.",
      "p.step": "Step", "p.of": "of",
      "step.about": "About you", "step.links": "Your links", "step.files": "Your files", "step.story": "Your story",
      "f.about.title": "First, the essentials", "f.about.lead": "Just enough to reach you and get started. Nothing more.",
      "f.biz": "Business name", "f.name": "Your name", "f.wa": "WhatsApp number", "f.email": "Email",
      "f.cat": "What kind of business?", "f.dist": "District",
      "f.links.title": "Drop all your links here",
      "f.links.lead": "Website, Facebook, Instagram, TikTok, Shopee, Google Maps, anything. Paste them all in one go, any order. Our AI sorts and labels each one.",
      "f.files.title": "Drop your files in one place",
      "f.files.lead": "Logo, business profile, product photos, certificates, PDFs. Drop everything together. Our AI sorts each one into the right category.",
      "f.dz": "Drag & drop everything here", "f.dz2": " or tap to browse",
      "f.story.title": "Tell us your story",
      "f.story.lead": "A couple of lines is plenty. The more you share, the smarter we build, but only what you're comfortable with.",
      "f.q1": "What does your business do?", "f.q2": "Who are your ideal customers?",
      "f.needs": "What do you need help with?", "f.more": "Want sharper results? Add a little more (optional)",
      "f.diff": "What makes you different?", "f.comp": "A competitor or two you watch", "f.insp": "Websites you love (inspiration)", "f.extra": "Anything else?",
      "f.gen": "✨ Generate my AI Business Summary",
      "f.eligible": "Yes, I'd like to be one of the <strong>100 New Digital Presences</strong>.",
      "f.consent": "I confirm my details are accurate and agree Khaaliq & the KOBIS Berhad team may contact me and use this info for digital empowerment purposes.",
      "btn.continue": "Continue →", "btn.submit": "Submit my business ✓"
    },

    bm: {
      "nav.mission": "Misi", "nav.offer": "Tawaran", "nav.how": "Cara Ia Berfungsi",
      "nav.support": "Sokong", "nav.back": "← Kembali", "cta.activate": "Aktifkan Perniagaan Saya",
      "hero.tag": "Mewakili Daerah Kuching · Jumlah 45 Daerah Sarawak",
      "hero.title": "Saya membantu <span class=\"accent\">100 perniagaan Sarawak</span> mendigital.",
      "hero.sub": "Nama saya Abdul Khaaliq bin Ahmad. Sebagai Calon Sarawak Digital Champion, misi saya mudah: mengaktifkan 100 laman web perniagaan baharu dan membantu usahawan tempatan ditemui, dipercayai, dan berkembang dalam talian.",
      "hero.activate": "Aktifkan Perniagaan Saya →", "hero.support": "Sokong Perjalanan Ini",
      "hero.trust": "Inisiatif oleh",
      "verify.title": "Sarawak Digital Champion Rasmi",
      "verify.sub": "Sahkan di laman web SDEC",
      "verify.chip": "Disahkan SDEC",
      "portrait.role": "Sarawak Digital Champion · Kuching",
      "brand.name": "Misi Khaaliq",
      "brand.tag": "Sarawak Digital Champion",
      "mission.title": "Memperkasa Sarawak. Secara Digital. Bersama.",
      "mission.sub": "Satu gerakan membina masa depan digital yang lebih kukuh dengan memberi inspirasi kepada komuniti, memperkasa usahawan, dan mengaktifkan perniagaan di seluruh 45 daerah.",
      "pillar.inspire.t": "Inspirasi", "pillar.inspire.d": "Memberi semangat komuniti menerima peluang digital.",
      "pillar.empower.t": "Memperkasa", "pillar.empower.d": "Melengkapkan usahawan dengan alat dan pengetahuan yang betul.",
      "pillar.activate.t": "Mengaktifkan", "pillar.activate.d": "Memacu kehadiran digital dan pertumbuhan perniagaan tempatan.",
      "pillar.impact.t": "Impak", "pillar.impact.d": "Mengukuhkan ekonomi digital Sarawak, satu perniagaan pada satu masa.",
      "pledge.suffix": "daripada 100 kehadiran perniagaan diaktifkan. Anda mungkin yang seterusnya.",
      "offer.flag": "Inisiatif Pemerkasaan Digital · 30 perniagaan pertama",
      "offer.title": "Aktifkan laman web anda dengan <span class=\"price-now\">RM500</span>",
      "offer.was": "Biasanya RM1,380 · <strong>diskaun 64%</strong> pengaktifan supaya kehadiran digital lebih mampu milik untuk usahawan tempatan.",
      "offer.claim": "Tuntut Pengaktifan Anda →",
      "offer.recv.title": "Apa yang setiap perniagaan terima",
      "offer.recv.sub": "Satu pakej lengkap. Inilah standard yang kami bina, supaya anda boleh menilai kerja kami sebelum mempercayai kami dengan laman anda.",
      "how.title": "Cara ia berfungsi", "how.sub": "Tiga langkah dari pendaftaran ke laman web langsung yang anda kawal.",
      "how.s1.t": "Daftar dalam beberapa minit", "how.s1.p": "Beritahu kami perkara asas, tampal pautan anda, lepas fail anda. AI kami membaca perniagaan anda dan merangka ringkasan serta-merta.",
      "how.s2.t": "Kami bina dengan AI + sentuhan manusia", "how.s2.p": "Profil anda menyuap saluran pembinaan hibrid kami. Kami tulis teks, reka halaman, dan sediakan laman anda untuk semakan.",
      "how.s3.t": "Anda langsung, dalam kawalan", "how.s3.p": "Pratonton, luluskan, dan terbitkan. Anda dapat papan pemuka untuk menyunting kandungan sendiri, bila-bila masa.",
      "support.q": "\"Saya telah bertemu ramai pemilik perniagaan dengan produk dan kisah yang hebat. Mereka tidak perlukan perniagaan yang lebih baik. Mereka hanya perlu ditemui.\"",
      "support.qby": "— Abdul Khaaliq bin Ahmad, Daerah Kuching",
      "support.title": "Sokong perjalanan ini",
      "support.p": "Setiap perniagaan yang kami aktifkan mengukuhkan ekonomi digital Sarawak. Jika anda percaya usahawan tempatan layak ditemui, berjalanlah bersama kami.",
      "support.activate": "Aktifkan Perniagaan", "support.share": "Kongsi Misi Ini",
      "final.title": "Masa depan anda, diperkasa secara digital.",
      "final.p": "Mari kita bina bersama. Pengaktifan mengambil beberapa minit untuk bermula.",
      "final.activate": "Aktifkan Perniagaan Saya →",
      "foot.tagline": "Abdul Khaaliq bin Ahmad, mewakili Daerah Kuching. Mengaktifkan 100 kehadiran digital perniagaan baharu di seluruh 45 daerah Sarawak.",
      "foot.initiative": "Inisiatif", "foot.partners": "Program SDC",
      "foot.programNote": "Sarawak Digital Champion (SDC) ialah program pemerkasaan digital yang dianjurkan oleh SDEC, AZAM Sarawak, Kamek Digital dan Sarawak Digital. Laman web ini ialah inisiatif bebas oleh seorang Calon SDC.",
      "foot.activate": "Aktifkan Perniagaan Saya", "foot.mission": "Misi", "foot.offer": "Tawaran", "foot.dash": "Papan Pemuka Pasukan",
      "act.title": "Mari buat perniagaan anda ditemui.",
      "act.sub": "Beberapa langkah pantas. Tiada borang panjang. AI kami membaca apa yang anda kongsi dan merangka profil perniagaan anda, di sini.",
      "p.step": "Langkah", "p.of": "daripada",
      "step.about": "Tentang anda", "step.links": "Pautan anda", "step.files": "Fail anda", "step.story": "Kisah anda",
      "f.about.title": "Pertama, perkara asas", "f.about.lead": "Cukup untuk menghubungi anda dan bermula. Tidak lebih.",
      "f.biz": "Nama perniagaan", "f.name": "Nama anda", "f.wa": "Nombor WhatsApp", "f.email": "E-mel",
      "f.cat": "Jenis perniagaan?", "f.dist": "Daerah",
      "f.links.title": "Tampal semua pautan anda di sini",
      "f.links.lead": "Laman web, Facebook, Instagram, TikTok, Shopee, Google Maps, apa sahaja. Tampal kesemuanya sekali gus, mana-mana susunan. AI kami menyusun dan melabel setiap satu.",
      "f.files.title": "Lepas fail anda di satu tempat",
      "f.files.lead": "Logo, profil perniagaan, gambar produk, sijil, PDF. Lepas semuanya bersama. AI kami menyusun setiap satu ke kategori yang betul.",
      "f.dz": "Seret & lepas semuanya di sini", "f.dz2": " atau ketik untuk pilih",
      "f.story.title": "Ceritakan kisah anda",
      "f.story.lead": "Beberapa baris sudah memadai. Lebih banyak anda kongsi, lebih bijak kami bina, tetapi hanya yang anda selesa.",
      "f.q1": "Apa yang perniagaan anda lakukan?", "f.q2": "Siapa pelanggan ideal anda?",
      "f.needs": "Apa yang anda perlukan bantuan?", "f.more": "Mahu hasil lebih tajam? Tambah sedikit lagi (pilihan)",
      "f.diff": "Apa yang membezakan anda?", "f.comp": "Satu dua pesaing yang anda perhati", "f.insp": "Laman web yang anda suka (inspirasi)", "f.extra": "Apa-apa lagi?",
      "f.gen": "✨ Jana Ringkasan Perniagaan AI saya",
      "f.eligible": "Ya, saya mahu menjadi salah satu daripada <strong>100 Kehadiran Digital Baharu</strong>.",
      "f.consent": "Saya mengesahkan butiran saya tepat dan bersetuju Khaaliq & pasukan KOBIS Berhad boleh menghubungi saya dan menggunakan maklumat ini untuk tujuan pemerkasaan digital.",
      "btn.continue": "Teruskan →", "btn.submit": "Hantar perniagaan saya ✓"
    },

    zh: {
      "nav.mission": "使命", "nav.offer": "优惠", "nav.how": "运作方式",
      "nav.support": "支持", "nav.back": "← 返回", "cta.activate": "启动我的业务",
      "hero.tag": "代表古晋县 · 砂拉越共45个县",
      "hero.title": "我正帮助 <span class=\"accent\">100家砂拉越企业</span> 迈向数字化。",
      "hero.sub": "我是 Abdul Khaaliq bin Ahmad。作为砂拉越数字大使候选人，我的使命很简单：启动100个新企业网站，帮助本地创业者被看见、被信任、在线上成长。",
      "hero.activate": "启动我的业务 →", "hero.support": "支持这段旅程",
      "hero.trust": "倡议方",
      "verify.title": "官方砂拉越数字大使",
      "verify.sub": "在 SDEC 官网验证",
      "verify.chip": "SDEC 认证",
      "portrait.role": "砂拉越数字大使 · 古晋",
      "brand.name": "Khaaliq 的使命",
      "brand.tag": "砂拉越数字大使",
      "mission.title": "赋能砂拉越。数字化。携手同行。",
      "mission.sub": "一项通过启发社区、赋能创业者、激活全部45个县企业，建设更强数字未来的运动。",
      "pillar.inspire.t": "启发", "pillar.inspire.d": "激励社区拥抱数字机遇。",
      "pillar.empower.t": "赋能", "pillar.empower.d": "为创业者提供正确的工具与知识。",
      "pillar.activate.t": "激活", "pillar.activate.d": "推动本地企业的真实数字存在与增长。",
      "pillar.impact.t": "影响", "pillar.impact.d": "逐一巩固砂拉越的数字经济。",
      "pledge.suffix": "/ 100 家企业数字存在已激活。下一个可能就是您。",
      "offer.flag": "数字赋能倡议 · 首30家企业",
      "offer.title": "以 <span class=\"price-now\">RM500</span> 启动您的网站",
      "offer.was": "原价 RM1,380 · 启动 <strong>立省超过60%</strong>，让本地创业者更易拥有数字存在。",
      "offer.claim": "领取您的启动 →",
      "offer.recv.title": "每家企业可获得",
      "offer.recv.sub": "一个完整配套。这是我们的建设标准，让您在托付之前先评估我们的做工。",
      "how.title": "运作方式", "how.sub": "从注册到您可掌控的上线网站，仅需三步。",
      "how.s1.t": "几分钟内注册", "how.s1.p": "告诉我们基本资料，粘贴链接，放入文件。我们的AI即时读取您的业务并草拟摘要。",
      "how.s2.t": "AI + 人工匠心共建", "how.s2.p": "您的资料进入我们的混合建设流程。我们撰写文案、设计页面，并准备好让您审阅。",
      "how.s3.t": "您上线，掌控在手", "how.s3.p": "预览、批准、发布。您将获得仪表板，随时自行编辑内容与更新。",
      "support.q": "\"我遇见许多拥有出色产品与故事的企业主。他们不需要更好的生意，只需要被发现。\"",
      "support.qby": "— Abdul Khaaliq bin Ahmad，古晋县",
      "support.title": "支持这段旅程",
      "support.p": "我们激活的每一家企业都在巩固砂拉越的数字经济。若您相信本地创业者值得被看见，请与我们同行。",
      "support.activate": "激活一家企业", "support.share": "分享这项使命",
      "final.title": "您的未来，数字赋能。",
      "final.p": "让我们携手共建。启动只需几分钟即可开始。",
      "final.activate": "启动我的业务 →",
      "foot.tagline": "Abdul Khaaliq bin Ahmad，代表古晋县。在砂拉越全部45个县激活100个新企业数字存在。",
      "foot.initiative": "倡议", "foot.partners": "关于计划",
      "foot.programNote": "砂拉越数字大使（SDC）是由 SDEC、AZAM Sarawak、Kamek Digital 和 Sarawak Digital 主办的数字赋能计划。本网站为一名 SDC 候选人的独立倡议。",
      "foot.activate": "启动我的业务", "foot.mission": "使命", "foot.offer": "优惠", "foot.dash": "团队仪表板",
      "act.title": "让您的企业被发现。",
      "act.sub": "几个快速步骤。没有冗长表格。我们的AI读取您分享的内容，当场为您草拟企业资料。",
      "p.step": "步骤", "p.of": "/",
      "step.about": "关于您", "step.links": "您的链接", "step.files": "您的文件", "step.story": "您的故事",
      "f.about.title": "首先，基本资料", "f.about.lead": "刚好够联系您并开始。仅此而已。",
      "f.biz": "企业名称", "f.name": "您的姓名", "f.wa": "WhatsApp 号码", "f.email": "电邮",
      "f.cat": "哪类业务？", "f.dist": "县",
      "f.links.title": "把您所有链接放这里",
      "f.links.lead": "网站、Facebook、Instagram、TikTok、Shopee、Google 地图，任何链接。一次粘贴全部，顺序不限。我们的AI会逐一分类并标注。",
      "f.files.title": "把文件集中放一处",
      "f.files.lead": "标志、企业简介、产品照片、证书、PDF。全部一起放入，我们的AI会逐一归类。",
      "f.dz": "把所有文件拖放到这里", "f.dz2": " 或点击浏览",
      "f.story.title": "讲讲您的故事",
      "f.story.lead": "几行字就足够。分享越多，我们建得越聪明，但只需您愿意分享的部分。",
      "f.q1": "您的企业做什么？", "f.q2": "谁是您的理想客户？",
      "f.needs": "您需要哪些帮助？", "f.more": "想要更精准的结果？再补充一点（可选）",
      "f.diff": "您的与众不同之处？", "f.comp": "一两个您关注的竞争对手", "f.insp": "您喜欢的网站（灵感）", "f.extra": "还有其他吗？",
      "f.gen": "✨ 生成我的 AI 企业摘要",
      "f.eligible": "是的，我想成为 <strong>100个新数字存在</strong> 之一。",
      "f.consent": "我确认我的资料属实，并同意 Khaaliq 与 KOBIS Berhad 团队可联系我，并将此信息用于数字赋能用途。",
      "btn.continue": "继续 →", "btn.submit": "提交我的企业 ✓"
    },

    ib: {
      "nav.mission": "Tujuah", "nav.offer": "Tawar", "nav.how": "Baka Iya Bejalai",
      "nav.support": "Sukung", "nav.back": "← Pulai", "cta.activate": "Idupka Pengawa Aku",
      "hero.tag": "Madahka Daerah Kuching · Jumlah 45 Daerah Sarawak",
      "hero.title": "Aku nulung <span class=\"accent\">100 pengawa Sarawak</span> nyadi digital.",
      "hero.sub": "Nama aku Abdul Khaaliq bin Ahmad. Nyadi Calon Sarawak Digital Champion, misi aku mudah: ngidupka 100 laman web pengawa baru lalu nulung orang bisnis ditemu, dipechaya, lalu mansang ba online.",
      "hero.activate": "Idupka Pengawa Aku →", "hero.support": "Sukung Pejalai Tu",
      "hero.trust": "Inisiatif ari",
      "verify.title": "Sarawak Digital Champion Resmi",
      "verify.sub": "Meretika ba laman web SDEC",
      "verify.chip": "Dikemendarka SDEC",
      "portrait.role": "Sarawak Digital Champion · Kuching",
      "brand.name": "Misi Khaaliq",
      "brand.tag": "Sarawak Digital Champion",
      "mission.title": "Ngemansangka Sarawak. Secara Digital. Sama-sama.",
      "mission.sub": "Siti gerak ngaga jelu digital ti kering agi ngena meri semangat ngagai komuniti, ngemansangka orang bisnis, lalu ngidupka pengawa ba semua 45 daerah.",
      "pillar.inspire.t": "Meri Semangat", "pillar.inspire.d": "Meri semangat komuniti nerima peluang digital.",
      "pillar.empower.t": "Ngemansang", "pillar.empower.d": "Meri orang bisnis perengka enggau penemu ti betul.",
      "pillar.activate.t": "Ngidupka", "pillar.activate.d": "Mansang pengidup digital enggau tumbuh pengawa menua.",
      "pillar.impact.t": "Impak", "pillar.impact.d": "Ngeringka ekonomi digital Sarawak, siti pengawa siti kali.",
      "pledge.suffix": "ari 100 pengidup pengawa udah diidupka. Nuan engka ti baru.",
      "offer.flag": "Inisiatif Pemansang Digital · 30 pengawa keterubah",
      "offer.title": "Idupka laman web nuan ngena <span class=\"price-now\">RM500</span>",
      "offer.was": "Biasa RM1,380 · <strong>diskaun 64%</strong> pengidup ngambika pengidup digital senang ulih orang bisnis menua.",
      "offer.claim": "Tuntut Pengidup Nuan →",
      "offer.recv.title": "Nama ti diterima genap pengawa",
      "offer.recv.sub": "Siti pakej lengkap. Tu standard ti dikaga kami, ngambika nuan ulih meresa pengawa kami sebedau merechaya kami.",
      "how.title": "Baka iya bejalai", "how.sub": "Tiga langkah ari daftar ngagai laman web idup ti dikemata nuan.",
      "how.s1.t": "Daftar dalam menit", "how.s1.p": "Padah ngagai kami utai dasar, tampal pautan nuan, lepas fail nuan. AI kami macha pengawa nuan lalu ngaga ringkas tekala nya.",
      "how.s2.t": "Kami ngaga ngena AI + pengawa mensia", "how.s2.p": "Profil nuan tama ngagai saluran pengaga hibrid kami. Kami nulis teks, ngaga laman, lalu nyendia laman nuan ke diteliti.",
      "how.s3.t": "Nuan idup, megai kuasa", "how.s3.p": "Peda dulu, kena, lalu terbit. Nuan bulih papan kawal ke nyunting kandung diri empu, sebarang maya.",
      "support.q": "\"Aku udah betemu mayuh tuan pengawa ti bisi barang enggau cerita ti manah. Sida nadai ibuh pengawa ti badas agi. Sida semina ibuh ditemu.\"",
      "support.qby": "— Abdul Khaaliq bin Ahmad, Daerah Kuching",
      "support.title": "Sukung pejalai tu",
      "support.p": "Genap pengawa ti diidupka kami ngeringka ekonomi digital Sarawak. Enti nuan arap orang bisnis menua patut ditemu, bejalai sama kami.",
      "support.activate": "Idupka Pengawa", "support.share": "Kongsi Tujuah Tu",
      "final.title": "Jemah ila nuan, dikemansang digital.",
      "final.p": "Aram kitai ngaga sama. Pengidup ngambi sekeda menit kena belabuh.",
      "final.activate": "Idupka Pengawa Aku →",
      "foot.tagline": "Abdul Khaaliq bin Ahmad, madahka Daerah Kuching. Ngidupka 100 pengidup digital pengawa baru ba semua 45 daerah Sarawak.",
      "foot.initiative": "Inisiatif", "foot.partners": "Program SDC",
      "foot.programNote": "Sarawak Digital Champion (SDC) nya program pemansang digital ti diatur ulih SDEC, AZAM Sarawak, Kamek Digital enggau Sarawak Digital. Laman web tu nya inisiatif bebas ari siku Calon SDC.",
      "foot.activate": "Idupka Pengawa Aku", "foot.mission": "Tujuah", "foot.offer": "Tawar", "foot.dash": "Papan Kawal Pasukan",
      "act.title": "Aram ngaga pengawa nuan ditemu.",
      "act.sub": "Sekeda langkah ti chepat. Nadai borang panjai. AI kami macha utai ti dikongsi nuan lalu ngaga profil pengawa nuan, ditu.",
      "p.step": "Langkah", "p.of": "ari",
      "step.about": "Pasal nuan", "step.links": "Pautan nuan", "step.files": "Fail nuan", "step.story": "Cerita nuan",
      "f.about.title": "Keterubah, utai dasar", "f.about.lead": "Chukup kena ngabas nuan lalu belabuh. Nadai lebih.",
      "f.biz": "Nama pengawa", "f.name": "Nama nuan", "f.wa": "Nombor WhatsApp", "f.email": "E-mel",
      "f.cat": "Jenis pengawa?", "f.dist": "Daerah",
      "f.links.title": "Tampal semua pautan nuan ditu",
      "f.links.lead": "Laman web, Facebook, Instagram, TikTok, Shopee, Google Maps, sebarang. Tampal semua sekali, sebarang urut. AI kami nyusun lalu nge-label genap siti.",
      "f.files.title": "Lepas fail nuan ba siti endur",
      "f.files.lead": "Logo, profil pengawa, gambar barang, sijil, PDF. Lepas semua sama. AI kami nyusun genap siti ngagai kategori ti betul.",
      "f.dz": "Seret & lepas semua ditu", "f.dz2": " tauka pilih",
      "f.story.title": "Padah cerita nuan",
      "f.story.lead": "Sekeda baris udah chukup. Lebih mayuh nuan kongsi, lebih pandai kami ngaga, tang semina ti dikedeka nuan.",
      "f.q1": "Nama dikereja pengawa nuan?", "f.q2": "Sapa pelanggan ti diharap nuan?",
      "f.needs": "Nama tulung ti dipinta nuan?", "f.more": "Deka hasil ti tajam agi? Tambah mimit (pilih)",
      "f.diff": "Nama ti nyadika nuan beda?", "f.comp": "Siti dua penyaing ti dipeda nuan", "f.insp": "Laman web ti dikerinduka nuan (inspirasi)", "f.extra": "Bisi utai bukai?",
      "f.gen": "✨ Ngaga Ringkas Pengawa AI aku",
      "f.eligible": "Au, aku deka nyadi siti ari <strong>100 Pengidup Digital Baru</strong>.",
      "f.consent": "Aku ngesahka utai aku amat lalu setuju Khaaliq & pasukan KOBIS Berhad ulih ngabas aku lalu ngena penerang tu kena tujuah pemansang digital.",
      "btn.continue": "Terus →", "btn.submit": "Kirim pengawa aku ✓"
    }
  };

  function t(key, lang) {
    lang = T[lang] ? lang : "en";
    return (T[lang] && T[lang][key] != null) ? T[lang][key] : (T.en[key] != null ? T.en[key] : null);
  }

  function applyLanguage(lang) {
    if (!T[lang]) lang = "en";
    document.documentElement.lang = lang === "zh" ? "zh" : lang === "bm" ? "ms" : lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const v = t(el.getAttribute("data-i18n"), lang);
      if (v == null) return;
      if (/<[a-z]/i.test(v)) el.innerHTML = v; else el.textContent = v;
    });
    localStorage.setItem("sdc-lang", lang);
    document.querySelectorAll(".lang-switch button").forEach(b =>
      b.classList.toggle("active", b.dataset.lang === lang));
    window.SDC_LANG = lang;
  }

  function mountSwitch() {
    document.querySelectorAll(".lang-switch").forEach(sw => {
      if (sw.dataset.mounted) return;
      sw.dataset.mounted = "1";
      sw.setAttribute("role", "group");
      sw.setAttribute("aria-label", "Language");
      sw.innerHTML = LANGS.map(([c, l]) =>
        `<button type="button" data-lang="${c}" aria-label="${c.toUpperCase()}">${l}</button>`).join("");
      sw.querySelectorAll("button").forEach(b => b.onclick = () => applyLanguage(b.dataset.lang));
    });
  }

  function current() {
    const saved = localStorage.getItem("sdc-lang");
    if (saved && T[saved]) return saved;
    const n = (navigator.language || "").toLowerCase();
    return n.startsWith("ms") ? "bm" : n.startsWith("zh") ? "zh" : "en";
  }

  function init() { mountSwitch(); applyLanguage(current()); }

  // public hooks (used by app.js after dynamic re-renders)
  window.applyLanguage = applyLanguage;
  window.SDC_I18N = { t, current, reapply: () => { mountSwitch(); applyLanguage(current()); } };

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
