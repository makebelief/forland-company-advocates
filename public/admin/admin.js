const views = [...document.querySelectorAll('.view')];
const statusBox = document.getElementById('status');
const emailInput = document.getElementById('email');
const forgotEmail = document.getElementById('forgot-email');
const signedInEmail = document.getElementById('signed-in-email');
const setSignedInEmail = (value) => { if (signedInEmail) signedInEmail.textContent = value; };
let sessionEmail = '';
let voluntaryPasswordChange = false;
const sessionChannel = 'BroadcastChannel' in window ? new BroadcastChannel('forland-admin-session') : null;

const goDashboard = () => window.location.assign('/admin/dashboard.html');

const show = (id) => {
  views.forEach((view) => view.classList.toggle('active', view.id === id));
};

const notice = (message = '', type = '') => {
  statusBox.hidden = !message;
  statusBox.textContent = message;
  statusBox.className = `status${type ? ` ${type}` : ''}`;
};

async function api(path, options = {}) {
  const response = await fetch(`/api/admin/${path}`, {
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  let data = {};
  try { data = await response.json(); } catch { data = {}; }
  return { response, data };
}

function busy(form, value) {
  [...form.querySelectorAll('button, input')].forEach((node) => { node.disabled = value; });
}

function recoveryTokensFromHash() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (params.get('type') !== 'recovery') return null;
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
    expiresIn: Number(params.get('expires_in')) || 3600,
  };
}

async function completeRecoveryFromUrl() {
  const tokens = recoveryTokensFromHash();
  if (!tokens) return false;
  history.replaceState({}, document.title, '/admin?recovery=1');
  const { response, data } = await api('complete-recovery', { method: 'POST', body: JSON.stringify(tokens) });
  if (!response.ok) {
    notice(data.message || 'This recovery link is invalid or expired.', 'error');
    show('login-view');
    return true;
  }
  voluntaryPasswordChange = false;
  document.getElementById('change-copy').textContent = 'Your recovery link is verified. Choose a new administrator password to continue.';
  notice('Recovery link verified. Set a new password now.', 'success');
  show('change-view');
  return true;
}

async function loadSession() {
  if (await completeRecoveryFromUrl()) return;
  const { response, data } = await api('session', { method: 'GET' });
  if (!response.ok || !data.authenticated) {
    show('login-view');
    if (new URLSearchParams(window.location.search).get('expired') === '1') notice('Your session expired. Please sign in again.', 'error');
    return;
  }
  sessionEmail = data.email || '';
  setSignedInEmail(sessionEmail);
  if (data.mustChangePassword) {
    voluntaryPasswordChange = false;
    document.getElementById('change-copy').textContent = 'For your security, the administrator password must be changed before the portal can be used.';
    show('change-view');
  } else {
    const params = new URLSearchParams(window.location.search);
    if (params.get('change') === '1') {
      voluntaryPasswordChange = true;
      document.getElementById('change-copy').textContent = 'Choose a strong new password for the administrator account.';
      show('change-view');
    } else {
      goDashboard();
    }
  }
}

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  notice();
  const form = event.currentTarget;
  busy(form, true);
  const email = emailInput.value.trim();
  const password = document.getElementById('password').value;
  const { response, data } = await api('login', { method: 'POST', body: JSON.stringify({ email, password }) }).catch(() => ({ response: { ok: false }, data: {} }));
  busy(form, false);
  document.getElementById('password').value = '';
  if (!response.ok) return notice(data.message || 'Unable to sign in.', 'error');
  sessionEmail = data.email || email;
  setSignedInEmail(sessionEmail);
  if (data.mustChangePassword) {
    voluntaryPasswordChange = false;
    document.getElementById('change-copy').textContent = 'For your security, the administrator password must be changed before the portal can be used.';
    notice('Sign-in successful. A new password is required before continuing.', 'success');
    show('change-view');
  } else {
    goDashboard();
  }
});

document.getElementById('forgot-link').addEventListener('click', () => {
  forgotEmail.value = emailInput.value.trim();
  notice();
  show('forgot-view');
});

document.getElementById('back-to-login').addEventListener('click', () => { notice(); show('login-view'); });

document.getElementById('forgot-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  notice();
  const form = event.currentTarget;
  busy(form, true);
  const { data } = await api('forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: forgotEmail.value.trim() }),
  }).catch(() => ({ data: {} }));
  busy(form, false);
  notice(data.message || 'If the administrator account is eligible, a password reset email will be sent.', 'success');
});

document.getElementById('change-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  notice();
  const form = event.currentTarget;
  const password = document.getElementById('new-password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  if (password !== confirmPassword) return notice('The two passwords do not match.', 'error');
  busy(form, true);
  const { response, data } = await api('change-password', { method: 'POST', body: JSON.stringify({ password }) }).catch(() => ({ response: { ok: false }, data: {} }));
  busy(form, false);
  if (!response.ok) return notice(data.message || 'Unable to change the password.', 'error');
  form.reset();
  notice(data.message || 'Password changed successfully.', 'success');
  if (voluntaryPasswordChange) voluntaryPasswordChange = false;
  setSignedInEmail(sessionEmail);
  goDashboard();
});

async function logout() {
  await api('logout', { method: 'POST', body: '{}' }).catch(() => null);
  sessionEmail = '';
  sessionChannel?.postMessage('logout');
  notice('Signed out.', 'success');
  show('login-view');
}

sessionChannel?.addEventListener('message', (event) => { if (event.data === 'logout' || event.data === 'expired') { sessionEmail = ''; show('login-view'); notice('You have been signed out.', 'success'); } });

const logoutButton = document.getElementById('logout');
if (logoutButton) logoutButton.addEventListener('click', logout);

const changeLogoutButton = document.getElementById('change-logout');
if (changeLogoutButton) changeLogoutButton.addEventListener('click', logout);

const openChangePasswordButton = document.getElementById('open-change-password');
if (openChangePasswordButton) {
  openChangePasswordButton.addEventListener('click', () => {
    voluntaryPasswordChange = true;
    document.getElementById('change-copy').textContent = 'Choose a strong new password for the administrator account.';
    notice();
    show('change-view');
  });
}

document.querySelectorAll('[data-toggle-password]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.togglePassword);
    const visible = input.type === 'text';
    input.type = visible ? 'password' : 'text';
    button.textContent = visible ? 'Show' : 'Hide';
  });
});

loadSession().catch(() => {
  notice('The administrator service is temporarily unavailable.', 'error');
  show('login-view');
});
