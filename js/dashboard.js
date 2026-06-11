/* ===== BRANDSHOW — DASHBOARD JS ===== */

const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

function getToken() { return localStorage.getItem('bs-token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('bs-user')); } catch(e) { return null; }
}

async function supaFetch(endpoint, method = 'GET', body = null) {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + (getToken() || SUPABASE_ANON_KEY),
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
  const res = await fetch(SUPABASE_URL + endpoint, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error(await res.text());
  return res.status === 204 ? null : res.json();
}

// Get current month-year key e.g. "2024-05"
function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function daysLeftInMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth()+1, 0);
  return last.getDate() - now.getDate();
}

// Format date
function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Status display map
const statusMap = {
  pending: { label: 'Pending', labelFa: 'در انتظار', cls: 'pending', hint: 'Awaiting review', hintFa: 'در انتظار بررسی' },
  under_review: { label: 'Under Review', labelFa: 'در حال بررسی', cls: 'under-review', hint: 'Judges are reviewing your idea.', hintFa: 'داوران در حال بررسی ایده شما هستند.' },
  reviewed: { label: 'Reviewed', labelFa: 'بررسی شد', cls: 'reviewed', hint: 'Good luck! Results coming soon.', hintFa: 'موفق باشید! نتایج به زودی اعلام می‌شود.' }
};

// ===== LOAD USER PROFILE =====
async function loadProfile() {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const rows = await supaFetch(`/rest/v1/users?id=eq.${user.id}&select=*`);
    const profile = rows?.[0];
    if (profile) {
      const nameEl = document.getElementById('profile-name');
      const roleEl = document.getElementById('profile-role');
      const sinceEl = document.getElementById('profile-since');
      const navNameEl = document.getElementById('nav-user-name');

      if (nameEl) nameEl.textContent = profile.username || 'User';
      if (roleEl) roleEl.textContent = profile.role || 'Member';
      if (navNameEl) navNameEl.textContent = profile.username || 'User';
      if (sinceEl) sinceEl.textContent = fmtDate(profile.created_at);
    }
  } catch(e) {}
}

// ===== LOAD THIS MONTH'S USAGE =====
async function loadUsage() {
  const user = getUser();
  if (!user) return;
  try {
    const ideas = await supaFetch(
      `/rest/v1/ideas?user_id=eq.${user.id}&month_year=eq.${currentMonthKey()}&select=id`
    );
    const used = ideas?.length || 0;
    const badge = document.getElementById('usage-badge');
    if (badge) badge.textContent = `${used} / 3 used`;
    return used;
  } catch(e) { return 0; }
}

// ===== SUBMIT IDEA =====
async function handleSubmitIdea(e) {
  e.preventDefault();
  const user = getUser();
  if (!user) { showToast('Please log in first.', 'error'); return; }

  const used = await loadUsage();
  if (used >= 3) {
    showToast('You have reached the limit of 3 ideas this month.', 'error');
    return;
  }

  const payload = {
    user_id: user.id,
    month_year: currentMonthKey(),
    company_name: document.getElementById('f-company').value.trim(),
    idea_title: document.getElementById('f-title').value.trim(),
    idea_description: document.getElementById('f-desc').value.trim(),
    competitors: document.getElementById('f-competitors').value.trim(),
    revenue_model: document.getElementById('f-revenue').value.trim(),
    funding_required: document.getElementById('f-funding').value.trim(),
    status: 'pending'
  };

  if (!payload.company_name || !payload.idea_title || !payload.idea_description) {
    showToast('Please fill in required fields.', 'error');
    return;
  }

  try {
    await supaFetch('/rest/v1/ideas', 'POST', payload);
    showToast('Idea submitted successfully!', 'success');

    // Clear form
    ['f-company','f-title','f-desc','f-competitors','f-revenue','f-funding'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    await loadUsage();
    await loadIdeas();
  } catch(err) {
    showToast('Failed to submit idea. Try again.', 'error');
  }
}

// ===== LOAD SUBMITTED IDEAS =====
async function loadIdeas() {
  const user = getUser();
  if (!user) return;
  const lang = localStorage.getItem('bs-lang') || 'en';

  try {
    const ideas = await supaFetch(
      `/rest/v1/ideas?user_id=eq.${user.id}&order=submitted_at.desc&select=*`
    );
    const list = document.getElementById('idea-list');
    if (!list) return;

    if (!ideas || ideas.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"/></svg>
          <p>${lang === 'fa' ? 'هنوز ایده‌ای ثبت نشده.' : 'No ideas submitted yet.'}</p>
        </div>`;
      return;
    }

    list.innerHTML = ideas.map(idea => {
      const s = statusMap[idea.status] || statusMap.pending;
      const label = lang === 'fa' ? s.labelFa : s.label;
      const hint = lang === 'fa' ? s.hintFa : s.hint;
      return `
        <div class="idea-row">
          <div class="idea-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 1 7 7c0 2.5-1.3 4.7-3.3 6l-.7.4V17a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1.6l-.7-.4A7 7 0 0 1 5 9a7 7 0 0 1 7-7zm-2 18h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1z"/></svg>
          </div>
          <div class="idea-info">
            <h4>${idea.company_name}</h4>
            <p>${idea.idea_title}</p>
          </div>
          <div class="idea-status-block">
            <span class="status-pill ${s.cls}">${label}</span>
            <span class="status-hint">${hint}</span>
          </div>
          <div class="idea-date">
            <div style="font-size:0.72rem;color:var(--text-light);margin-bottom:2px">${lang==='fa'?'ثبت شده در':'Submitted On'}</div>
            <div style="font-size:0.8rem;font-weight:600;color:var(--text-dark)">${fmtDate(idea.submitted_at)}</div>
          </div>
          <svg class="idea-arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </div>`;
    }).join('');
  } catch(e) {}
}

// ===== LOAD RESULTS =====
async function loadResults() {
  const user = getUser();
  if (!user) return;
  const lang = localStorage.getItem('bs-lang') || 'en';

  try {
    const results = await supaFetch(
      `/rest/v1/ideas?user_id=eq.${user.id}&rank=not.is.null&order=submitted_at.desc&select=*`
    );
    const list = document.getElementById('results-list');
    if (!list) return;

    if (!results || results.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
          <p>${lang==='fa'?'هنوز نتیجه‌ای ثبت نشده.':'No results yet.'}</p>
        </div>`;
      return;
    }

    list.innerHTML = results.map(idea => {
      const monthName = new Date(idea.month_year + '-01').toLocaleDateString('en-US', { month:'long', year:'numeric' });
      return `
        <div class="result-row">
          <div class="result-icon">
            <svg viewBox="0 0 24 24"><path d="M6 9H2L7 4v3h8l5-5v3h3l-5 5h-3v3l-5-3zm8 6l5 3-5 5v-3H6l5-3H8L3 9l5 5H6v3z" opacity=".2"/><path d="M8 21l3.5-3.5L15 21l-3.5-8.5zm2-9.5a6 6 0 1 0 0-9 6 6 0 0 0 0 9z"/></svg>
          </div>
          <div class="result-info">
            <h4>${monthName} ${lang==='fa'?'مسابقه':'Competition'}</h4>
            <p>${lang==='fa'?'ایده شما':'Your idea'} "${idea.company_name}" ${lang==='fa'?'رتبه‌بندی شد:':'ranked:'}</p>
            ${idea.judge_notes ? `<p style="margin-top:4px;color:var(--text-mid);font-size:0.78rem">💬 ${idea.judge_notes}</p>` : ''}
          </div>
          <div class="result-rank">
            <div class="rank-num">#${idea.rank}</div>
            <div class="rank-sub">${lang==='fa'?'از ۱۰۰ برتر':'Out of Top 100'}</div>
          </div>
          <button class="btn-view-details btn" data-sound="click">${lang==='fa'?'مشاهده جزئیات':'VIEW DETAILS'}</button>
        </div>`;
    }).join('');
  } catch(e) {}
}

// ===== COMPETITION TIMER =====
function initCompetition() {
  const days = daysLeftInMonth();
  const daysEl = document.getElementById('comp-days');
  const deadlineEl = document.getElementById('comp-deadline');
  if (daysEl) daysEl.innerHTML = `${days} <span>${document.documentElement.lang === 'fa' ? 'روز' : 'Days Left'}</span>`;
  if (deadlineEl) {
    const last = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0);
    deadlineEl.textContent = `Until ${last.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}`;
  }

  // Progress ring
  const totalDays = new Date(new Date().getFullYear(), new Date().getMonth()+1, 0).getDate();
  const progress = document.querySelector('.comp-ring circle.progress');
  if (progress) {
    const pct = (totalDays - days) / totalDays;
    const circumference = 150;
    progress.style.strokeDashoffset = circumference - (pct * circumference);
  }
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem('bs-token');
  localStorage.removeItem('bs-refresh');
  localStorage.removeItem('bs-user');
  window.location.href = 'login.html';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  const user = getUser();
  if (!user) { window.location.href = 'login.html'; return; }

  initCompetition();
  await loadProfile();
  await loadUsage();
  await loadIdeas();
  await loadResults();

  const ideaForm = document.getElementById('ideaForm');
  if (ideaForm) ideaForm.addEventListener('submit', handleSubmitIdea);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Status filter
  const filter = document.getElementById('status-filter');
  if (filter) {
    filter.addEventListener('change', async () => {
      await loadIdeas(filter.value);
    });
  }
});
