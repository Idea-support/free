/* ===== BRANDSHOW — MAIN JS ===== */

// ===== SOUND SYSTEM =====
const Sounds = {
  _cache: {},
  
  async load(name, path) {
    try {
      const audio = new Audio(path);
      audio.preload = 'auto';
      this._cache[name] = audio;
    } catch(e) {}
  },

  play(name) {
    try {
      const src = this._cache[name];
      if (!src) return;
      const clone = src.cloneNode();
      clone.volume = 0.45;
      clone.play().catch(() => {});
    } catch(e) {}
  },

  init() {
    this.load('click', '../assets/sounds/click.mp3');
    this.load('submit', '../assets/sounds/submit.mp3');
    this.load('focus', '../assets/sounds/input-focus.mp3');
  },

  initRoot() {
    this.load('click', 'assets/sounds/click.mp3');
    this.load('submit', 'assets/sounds/submit.mp3');
    this.load('focus', 'assets/sounds/input-focus.mp3');
  }
};

// ===== BIND SOUNDS TO ELEMENTS =====
function bindSounds(root = document) {
  // All buttons
  root.querySelectorAll('button, .btn, [data-sound]').forEach(el => {
    if (el._soundBound) return;
    el._soundBound = true;
    el.addEventListener('click', () => {
      const type = el.dataset.sound || 
        (el.classList.contains('btn-submit-idea') || el.classList.contains('btn-auth') ? 'submit' : 'click');
      Sounds.play(type);
    });
  });

  // All inputs / textareas
  root.querySelectorAll('input, textarea, select').forEach(el => {
    if (el._focusBound) return;
    el._focusBound = true;
    el.addEventListener('focus', () => Sounds.play('focus'));
  });
}

// Observe dynamic DOM changes
function observeAndBind() {
  bindSounds();
  const mo = new MutationObserver(() => bindSounds());
  mo.observe(document.body, { childList: true, subtree: true });
}

// ===== LANGUAGE / TRANSLATION =====
const i18n = {
  en: {
    home: 'Home',
    aboutUs: 'About Us',
    judges: 'Judges',
    contact: 'Contact',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    viewWinners: 'View Winners',
    welcomeTitle: 'Welcome to',
    welcomeSub: 'The platform for creative minds to showcase, compete and be discovered.',
    signUpCard: 'Sign Up',
    signUpDesc: 'Create an account to get started and join our community.',
    winnersCard: 'Last Month Winners',
    winnersDesc: "See who stood out and won last month's BrandShow.",
    aboutTitle: 'About',
    aboutText: 'BrandShow is a platform that brings together creativity and innovation. We believe in the power of ideas and the talent of individuals. Join us to showcase your work, get feedback, and grow with a community that inspires and supports you.',
    ourJudges: 'Our Judges',
    copyright: '© 2024 BrandShow. All rights reserved.',
    lang: 'فارسی',
    // Auth
    helloFriend: 'Hello, friend!',
    gladToSee: 'Glad to see You!',
    createAccount: 'CREATE ACCOUNT',
    alreadyAccount: 'Already have an account?',
    namePlaceholder: 'Name',
    emailPlaceholder: 'Email',
    phonePlaceholder: 'Phone Number',
    verifyPlaceholder: 'Verify Phone Number',
    passwordPlaceholder: 'Password',
    confirmPasswordPlaceholder: 'Confirm Password',
    terms: "I've read and agree to",
    termsLink: 'Terms & Conditions',
    welcomeBack: 'Welcome back!',
    usernamePlaceholder: 'Username or Email',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signInBtn: 'SIGN IN',
    noAccount: "Don't have an account?",
    // Dashboard
    submitYourIdea: 'Submit Your Idea',
    submitSub: 'Share your innovative idea with us! Every month, we select the best ideas and invest in their full potential.',
    ideaInfo: 'Idea Information',
    companyName: 'Company / Brand Name',
    companyPlaceholder: 'Enter your company or brand name',
    ideaTitle: 'Idea Title / Category',
    ideaTitlePlaceholder: 'What is your idea about?',
    ideaDesc: 'Idea Description',
    ideaDescPlaceholder: 'Describe your idea in detail. What problem does it solve? How does it work?',
    competitors: 'Current Competitors & How to Compete',
    competitorsPlaceholder: 'Who are your main competitors? How will you compete and stand out?',
    revenueModel: 'Revenue Model',
    revenuePlaceholder: 'How will your idea generate income? What is your business model?',
    fundingRequired: 'Funding Required',
    fundingPlaceholder: 'How much funding do you need? Explain the reasons and how it will be used.',
    submitIdea: 'SUBMIT IDEA',
    submittedIdeas: 'Your Submitted Ideas',
    resultsFrom: 'Results From Previous Competitions',
    howItWorks: 'How It Works',
    step1: 'Submit Your Idea',
    step1desc: 'Fill out the form and share your innovative idea.',
    step2: 'Our Judges Review',
    step2desc: 'Our expert judges will review your idea carefully.',
    step3: 'Monthly Selection',
    step3desc: 'Top 10 ideas each month receive full funding.',
    step4: 'Results & Rankings',
    step4desc: 'Check your dashboard after each competition.',
    thisMonthComp: "This Month's Competition",
    submissionsOpen: 'Submissions Open',
    daysLeft: 'Days Left',
    viewCurrentIdeas: 'VIEW CURRENT IDEAS',
    allStatus: 'All Status',
    memberSince: 'Member Since',
    ideasSubmitted: 'Ideas Submitted',
  },
  fa: {
    home: 'خانه',
    aboutUs: 'درباره ما',
    judges: 'داوران',
    contact: 'تماس',
    signIn: 'ورود',
    signUp: 'ثبت‌نام',
    viewWinners: 'مشاهده برندگان',
    welcomeTitle: 'به',
    welcomeSub: 'پلتفرمی برای ذهن‌های خلاق تا ایده‌هایشان را نمایش دهند، رقابت کنند و دیده شوند.',
    signUpCard: 'ثبت‌نام',
    signUpDesc: 'یک حساب کاربری بسازید و به جامعه ما بپیوندید.',
    winnersCard: 'برندگان ماه گذشته',
    winnersDesc: 'ببینید چه کسانی برجسته بودند و ماه گذشته برنده شدند.',
    aboutTitle: 'درباره',
    aboutText: 'برندشو پلتفرمی است که خلاقیت و نوآوری را به هم پیوند می‌دهد. ما به قدرت ایده‌ها و استعداد افراد ایمان داریم. به ما بپیوندید تا کارهایتان را به نمایش بگذارید، بازخورد بگیرید و با جامعه‌ای که الهام‌بخش است رشد کنید.',
    ourJudges: 'داوران ما',
    copyright: '© ۱۴۰۳ برندشو. تمامی حقوق محفوظ است.',
    lang: 'English',
    helloFriend: 'سلام دوست!',
    gladToSee: 'خوشحالیم که می‌بینیمت!',
    createAccount: 'ساخت حساب کاربری',
    alreadyAccount: 'قبلاً حساب دارید؟',
    namePlaceholder: 'نام',
    emailPlaceholder: 'ایمیل',
    phonePlaceholder: 'شماره موبایل',
    verifyPlaceholder: 'تأیید شماره موبایل',
    passwordPlaceholder: 'رمز عبور',
    confirmPasswordPlaceholder: 'تأیید رمز عبور',
    terms: 'شرایط و قوانین را خوانده‌ام و موافقم',
    termsLink: '',
    welcomeBack: 'خوش برگشتید!',
    usernamePlaceholder: 'نام کاربری یا ایمیل',
    rememberMe: 'مرا به خاطر بسپار',
    forgotPassword: 'رمز عبور را فراموش کردید؟',
    signInBtn: 'ورود',
    noAccount: 'حساب کاربری ندارید؟',
    submitYourIdea: 'ایده خود را ثبت کنید',
    submitSub: 'ایده نوآورانه خود را با ما به اشتراک بگذارید! هر ماه بهترین ایده‌ها را انتخاب می‌کنیم و در پتانسیل کامل آن‌ها سرمایه‌گذاری می‌کنیم.',
    ideaInfo: 'اطلاعات ایده',
    companyName: 'نام شرکت / برند',
    companyPlaceholder: 'نام شرکت یا برند خود را وارد کنید',
    ideaTitle: 'عنوان / دسته‌بندی ایده',
    ideaTitlePlaceholder: 'ایده شما درباره چیست؟',
    ideaDesc: 'شرح ایده',
    ideaDescPlaceholder: 'ایده خود را با جزئیات شرح دهید. چه مشکلی را حل می‌کند؟',
    competitors: 'رقبای فعلی و روش رقابت',
    competitorsPlaceholder: 'رقبای اصلی شما چه کسانی هستند؟ چطور متمایز خواهید شد؟',
    revenueModel: 'مدل درآمدزایی',
    revenuePlaceholder: 'ایده شما چطور درآمد ایجاد می‌کند؟ مدل کسب‌وکار شما چیست؟',
    fundingRequired: 'سرمایه مد نظر',
    fundingPlaceholder: 'به چه مقدار سرمایه نیاز دارید؟ دلایل و نحوه استفاده را توضیح دهید.',
    submitIdea: 'ثبت ایده',
    submittedIdeas: 'ایده‌های ثبت‌شده شما',
    resultsFrom: 'نتایج مسابقات قبلی',
    howItWorks: 'چطور کار می‌کند',
    step1: 'ایده خود را ثبت کنید',
    step1desc: 'فرم را پر کنید و ایده نوآورانه‌تان را به اشتراک بگذارید.',
    step2: 'داوران بررسی می‌کنند',
    step2desc: 'داوران متخصص ما ایده شما را با دقت بررسی می‌کنند.',
    step3: 'انتخاب ماهانه',
    step3desc: '۱۰ ایده برتر هر ماه سرمایه کامل دریافت می‌کنند.',
    step4: 'نتایج و رتبه‌بندی',
    step4desc: 'پس از هر مسابقه داشبورد خود را بررسی کنید.',
    thisMonthComp: 'مسابقه این ماه',
    submissionsOpen: 'ثبت‌نام باز است',
    daysLeft: 'روز باقی‌مانده',
    viewCurrentIdeas: 'مشاهده ایده‌های جاری',
    allStatus: 'همه وضعیت‌ها',
    memberSince: 'عضو از',
    ideasSubmitted: 'ایده ثبت‌شده',
  }
};

let currentLang = localStorage.getItem('bs-lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('bs-lang', lang);
  const t = i18n[lang];

  document.body.classList.toggle('rtl', lang === 'fa');

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  // Update lang button label
  const lb = document.getElementById('langBtn');
  if (lb) lb.querySelector('.lang-label').textContent = t.lang;

  // html dir
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
}

function toggleLang() {
  applyLang(currentLang === 'en' ? 'fa' : 'en');
}

// ===== TOAST =====
function showToast(msg, type = '') {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Detect if root or subpage for sound paths
  const isRoot = !window.location.pathname.includes('/pages/');
  if (isRoot) Sounds.initRoot(); else Sounds.init();

  observeAndBind();
  applyLang(currentLang);

  // Lang button
  const lb = document.getElementById('langBtn');
  if (lb) lb.addEventListener('click', toggleLang);
});
