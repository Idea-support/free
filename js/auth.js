/* ===== BRANDSHOW — AUTH JS ===== */

// ===== SUPABASE CONFIG — جایگزین کنید =====
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

async function supaFetch(endpoint, method, body) {
  const res = await fetch(SUPABASE_URL + endpoint, {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

// ===== PHONE VERIFICATION LOGIC =====
let verifyTimer = null;
let verifyCode = null;
let timerSeconds = 0;

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function startVerifyTimer(hintEl, codeDisplayEl) {
  clearInterval(verifyTimer);
  timerSeconds = 60;
  verifyCode = null;
  codeDisplayEl.style.display = 'none';

  hintEl.textContent = `Sending code... (${timerSeconds}s)`;

  verifyTimer = setInterval(() => {
    timerSeconds--;
    if (timerSeconds > 0) {
      hintEl.textContent = `Waiting for code... ${timerSeconds}s`;

      // After 10 seconds in the second 60s window, show random code
      if (timerSeconds <= 50 && !verifyCode) {
        verifyCode = generateCode();
        codeDisplayEl.textContent = `📱 Your code: ${verifyCode}`;
        codeDisplayEl.style.display = 'block';
        hintEl.textContent = 'Use the code shown above to verify.';
      }
    } else {
      clearInterval(verifyTimer);
      hintEl.textContent = 'Code shown above. Enter it to verify.';
    }
  }, 1000);
}

// ===== TOGGLE PASSWORD VISIBILITY =====
function setupEyeToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;
  btn.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
}

// ===== SIGN UP =====
async function handleSignUp(e) {
  e.preventDefault();
  const name = document.getElementById('su-name').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const codeInput = document.getElementById('su-verify').value.trim();
  const password = document.getElementById('su-password').value;
  const confirm = document.getElementById('su-confirm').value;
  const terms = document.getElementById('su-terms').checked;
  const msgEl = document.getElementById('su-msg');

  const setMsg = (txt, type) => {
    msgEl.textContent = txt;
    msgEl.className = 'form-msg ' + type;
  };

  msgEl.className = 'form-msg';

  if (!name || !email || !phone || !codeInput || !password || !confirm) {
    return setMsg('Please fill in all fields.', 'error');
  }
  if (password.length < 6) {
    return setMsg('Password must be at least 6 characters.', 'error');
  }
  if (password !== confirm) {
    return setMsg('Passwords do not match.', 'error');
  }
  if (!terms) {
    return setMsg('Please agree to the Terms & Conditions.', 'error');
  }

  // Verify code
  if (!verifyCode || codeInput !== verifyCode) {
    return setMsg('Invalid verification code. Please try again.', 'error');
  }

  try {
    // 1. Register with Supabase Auth
    const authRes = await fetch(SUPABASE_URL + '/auth/v1/signup', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    const authData = await authRes.json();

    if (authData.error) {
      return setMsg(authData.error.message || 'Registration failed.', 'error');
    }

    const userId = authData.user?.id;

    // 2. Insert user profile into users table
    if (userId) {
      await supaFetch('/rest/v1/users', 'POST', {
        id: userId,
        username: name,
        email,
        phone,
        role: 'user'
      });
    }

    setMsg('Account created successfully! Redirecting to login...', 'success');
    setTimeout(() => { window.location.href = 'login.html'; }, 2000);
  } catch(err) {
    setMsg('Network error. Please try again.', 'error');
  }
}

// ===== SIGN IN =====
async function handleSignIn(e) {
  e.preventDefault();
  const usernameOrEmail = document.getElementById('li-username').value.trim();
  const password = document.getElementById('li-password').value;
  const msgEl = document.getElementById('li-msg');

  const setMsg = (txt, type) => {
    msgEl.textContent = txt;
    msgEl.className = 'form-msg ' + type;
  };

  msgEl.className = 'form-msg';

  if (!usernameOrEmail || !password) {
    return setMsg('Please enter your credentials.', 'error');
  }

  try {
    const res = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: usernameOrEmail, password })
    });
    const data = await res.json();

    if (data.error || !data.access_token) {
      return setMsg(data.error_description || 'Invalid credentials.', 'error');
    }

    // Save session
    localStorage.setItem('bs-token', data.access_token);
    localStorage.setItem('bs-refresh', data.refresh_token);
    localStorage.setItem('bs-user', JSON.stringify(data.user));

    setMsg('Login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
  } catch(err) {
    setMsg('Network error. Please try again.', 'error');
  }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  setupEyeToggle('su-password', 'su-eye1');
  setupEyeToggle('su-confirm', 'su-eye2');
  setupEyeToggle('li-password', 'li-eye');

  // Phone field — start timer on blur/change
  const phoneField = document.getElementById('su-phone');
  const hintEl = document.getElementById('verify-hint');
  const codeDisplayEl = document.getElementById('verify-code-display');

  if (phoneField && hintEl && codeDisplayEl) {
    phoneField.addEventListener('blur', () => {
      if (phoneField.value.trim().length >= 10) {
        startVerifyTimer(hintEl, codeDisplayEl);
      }
    });
  }

  // Forms
  const signupForm = document.getElementById('signupForm');
  if (signupForm) signupForm.addEventListener('submit', handleSignUp);

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleSignIn);
});
