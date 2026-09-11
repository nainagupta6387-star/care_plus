/**
 * CarePlus HMS Backend Command Center & API Console
 * Visual Theme & Interactive Operations Engine
 */

(function () {
  'use strict';

  // Demo Credentials & Role Definitions matching Frontend
  const DEMO_ACCOUNTS = [
    { role: 'patient', name: 'Alexander Wright', email: 'patient@careplus-hms.com', key: 'patient', icon: '🩺', badge: 'Patient' },
    { role: 'doctor', name: 'Dr. Sarah Jenkins, MD', email: 'dr.jenkins@careplus-hms.com', key: 'doctor', icon: '👨‍⚕️', badge: 'Doctor' },
    { role: 'receptionist', name: 'Sarah Davis', email: 'staff@careplus-hms.com', key: 'receptionist', icon: '📋', badge: 'Receptionist' }
  ];

  // Global State
  const state = {
    activeTab: 'overview',
    authToken: localStorage.getItem('careplus_backend_token') || '',
    authUser: JSON.parse(localStorage.getItem('careplus_backend_user') || 'null'),
    patients: [],
    appointments: [],
    invoices: [],
    patientFilter: 'all',
    patientSearch: '',
    appointmentFilter: 'all',
    appointmentSearch: '',
    billingFilter: 'all',
    billingSearch: '',
    telemetry: {
      uptime: 0,
      memory: '48.5 MB',
      dbStatus: 'Hybrid In-Memory & DB Fallback Active',
      status: 'Healthy',
      port: window.location.port || '5000'
    }
  };

  // Toast Helper
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'success') {
      toast.style.borderLeftColor = 'var(--color-emerald-500)';
    } else if (type === 'error') {
      toast.style.borderLeftColor = 'var(--color-rose-500)';
    } else if (type === 'warning') {
      toast.style.borderLeftColor = 'var(--color-amber-500)';
    }
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function createToastContainer() {
    const el = document.createElement('div');
    el.id = 'toastContainer';
    el.className = 'toast-container';
    document.body.appendChild(el);
    return el;
  }

  // Syntax highlight JSON
  function syntaxHighlightJson(json) {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'color: #38bdf8;'; // string light blue
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #a78bfa; font-weight: 600;'; // key purple
        } else {
          cls = 'color: #34d399;'; // string emerald
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #fbbf24; font-weight: 700;'; // boolean amber
      } else if (/null/.test(match)) {
        cls = 'color: #f87171;'; // null red
      } else {
        cls = 'color: #f472b6;'; // number pink
      }
      return '<span style="' + cls + '">' + match + '</span>';
    });
  }

  // Fetch initial telemetry & data
  async function loadInitialData() {
    try {
      // 1. Health check
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const data = await healthRes.json();
        state.telemetry.status = data.status || 'Healthy';
        updateHeaderStatus(true);
      }
    } catch (e) {
      updateHeaderStatus(false);
    }

    // Auto-login with default demo if not logged in
    if (!state.authToken) {
      await performDemoLogin('receptionist', false);
    } else {
      updateUserUI();
    }

    // Load data stores
    await refreshAppointments();
    await refreshInvoices();
    renderPatients();
    updateKpiMetrics();
  }

  function updateHeaderStatus(isHealthy) {
    const el = document.getElementById('headerStatusBadge');
    if (!el) return;
    if (isHealthy) {
      el.className = 'status-pill status-emerald';
      el.innerHTML = '<span class="animate-pulse-glow">🟢</span> 100% Operational';
    } else {
      el.className = 'status-pill status-rose';
      el.innerHTML = '<span>🔴</span> Server Offline';
    }
  }

  function updateUserUI() {
    const roleBadge = document.getElementById('headerRoleBadge');
    const userDisplay = document.getElementById('activeUserDisplay');
    if (state.authUser && state.authToken) {
      if (roleBadge) {
        roleBadge.className = 'status-pill status-blue';
        roleBadge.textContent = '👑 ' + (state.authUser.role || 'USER').toUpperCase();
        roleBadge.style.display = 'inline-flex';
      }
      if (userDisplay) {
        userDisplay.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.5rem; background: var(--color-blue-50); border: 1px solid var(--color-blue-200); padding: 0.35rem 0.75rem; border-radius: var(--radius-xl);">
            <div style="width: 1.75rem; height: 1.75rem; border-radius: 9999px; background: var(--color-blue-600); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">
              ${(state.authUser.name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style="font-size: 0.75rem; font-weight: 800; color: var(--color-slate-900);">${state.authUser.name || 'User'}</div>
              <div style="font-size: 0.625rem; font-weight: 700; color: var(--color-blue-600); text-transform: uppercase;">${state.authUser.role}</div>
            </div>
          </div>
        `;
      }
    }
  }

  // Demo Login
  async function performDemoLogin(roleKey, notify = true) {
    const account = DEMO_ACCOUNTS.find(a => a.key === roleKey) || DEMO_ACCOUNTS[0];
    try {
      const res = await fetch('/api/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: 'demo12345', role: account.key })
      });
      const data = await res.json();
      if (data.success && data.token) {
        state.authToken = data.token;
        state.authUser = data.patient || { name: account.name, email: account.email, role: account.key };
        localStorage.setItem('careplus_backend_token', state.authToken);
        localStorage.setItem('careplus_backend_user', JSON.stringify(state.authUser));
        updateUserUI();
        if (notify) {
          showToast(`Authenticated as ${state.authUser.name} (${state.authUser.role.toUpperCase()})`, 'success');
        }
        refreshAppointments();
        refreshInvoices();
      } else {
        if (notify) showToast(data.message || 'Authentication failed', 'error');
      }
    } catch (err) {
      if (notify) showToast('Login error: ' + err.message, 'error');
    }
  }

  // Appointments Data
  async function refreshAppointments() {
    try {
      const res = await fetch('/api/appointments/all', {
        headers: { 'Authorization': state.authToken ? `Bearer ${state.authToken}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        state.appointments = data.appointments || [];
        renderAppointments();
        updateKpiMetrics();
      }
    } catch (e) {
      console.warn('Failed fetching appointments:', e);
    }
  }

  // Billing Data
  async function refreshInvoices() {
    try {
      const res = await fetch('/api/billing', {
        headers: { 'Authorization': state.authToken ? `Bearer ${state.authToken}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        state.invoices = data.invoices || [];
        renderBilling();
        updateKpiMetrics();
      }
    } catch (e) {
      console.warn('Failed fetching invoices:', e);
    }
  }

  // Update Status for Appointment
  async function updateAppointmentStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': state.authToken ? `Bearer ${state.authToken}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Appointment status changed to: ${newStatus}`, 'success');
        await refreshAppointments();
      } else {
        showToast(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  // Update Status for Invoice
  async function updateInvoiceStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/billing/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': state.authToken ? `Bearer ${state.authToken}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Invoice marked as ${newStatus}!`, 'success');
        await refreshInvoices();
      } else {
        showToast(data.message || 'Failed to update invoice', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  // Render KPI Metrics
  function updateKpiMetrics() {
    const aptCountEl = document.getElementById('metricAppointmentsCount');
    const aptCompletedEl = document.getElementById('metricAppointmentsCompleted');
    const revenueEl = document.getElementById('metricRevenueTotal');
    const patientsCountEl = document.getElementById('metricPatientsCount');

    if (aptCountEl) aptCountEl.textContent = state.appointments.length;
    if (aptCompletedEl) {
      const completed = state.appointments.filter(a => a.status === 'Completed').length;
      aptCompletedEl.textContent = `${completed} Completed`;
    }

    if (revenueEl) {
      const totalRev = state.invoices
        .filter(i => i.status === 'Paid')
        .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      revenueEl.textContent = `$${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }

    if (patientsCountEl) {
      patientsCountEl.textContent = '3 Pre-seeded + Live';
    }
  }

  // Render Patients Table
  function renderPatients() {
    const tbody = document.getElementById('patientsTableBody');
    if (!tbody) return;

    const defaultPatients = [
      { id: 'PT-9801', name: 'Alexander Wright', email: 'patient@careplus-hms.com', role: 'patient', phone: '+1 (555) 234-5678', blood: 'O+', age: 34 },
      { id: 'DOC-9001', name: 'Dr. Sarah Jenkins, MD', email: 'dr.jenkins@careplus-hms.com', role: 'doctor', phone: '+1 (555) 345-6789', blood: 'A+', age: 42 },
      { id: 'REC-4091', name: 'Sarah Davis', email: 'staff@careplus-hms.com', role: 'receptionist', phone: '+1 (555) 456-7890', blood: 'B+', age: 29 }
    ];

    const q = state.patientSearch.toLowerCase();
    const filtered = defaultPatients.filter(p => {
      const matchRole = state.patientFilter === 'all' || p.role === state.patientFilter;
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-slate-400);">No patients found matching your search.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const roleBadge = p.role === 'doctor'
        ? '<span class="status-pill status-blue">👨‍⚕️ Doctor</span>'
        : p.role === 'receptionist'
        ? '<span class="status-pill status-amber">📋 Receptionist</span>'
        : '<span class="status-pill status-emerald">🩺 Patient</span>';

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="width: 2.25rem; height: 2.25rem; border-radius: var(--radius-xl); background: var(--color-blue-100); color: var(--color-blue-700); font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem;">
                ${p.name[0]}
              </div>
              <div>
                <div style="font-weight: 700; color: var(--color-slate-900);">${p.name}</div>
                <div style="font-size: 0.6875rem; color: var(--color-slate-500); font-family: var(--font-mono);">${p.id}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-slate-700);">${p.email}</span></td>
          <td>${roleBadge}</td>
          <td><span style="font-weight: 600; color: var(--color-slate-700);">${p.phone}</span></td>
          <td><span class="status-pill status-slate">${p.blood}</span></td>
          <td style="text-align: right;">
            <button class="btn btn-outline btn-sm" onclick="window.carePlusApp.quickTestPatient('${p.email}')">
              ⚡ Test Auth
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Appointments Table
  function renderAppointments() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;

    const q = state.appointmentSearch.toLowerCase();
    const filtered = state.appointments.filter(a => {
      const matchStatus = state.appointmentFilter === 'all' || a.status === state.appointmentFilter;
      const matchSearch = !q || (a.patientName && a.patientName.toLowerCase().includes(q)) || (a.tokenNumber && a.tokenNumber.toLowerCase().includes(q)) || (a.doctor && a.doctor.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--color-slate-400);">No appointments in queue.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(a => {
      let statusPill = `<span class="status-pill status-blue">${a.status}</span>`;
      if (a.status === 'Completed') statusPill = `<span class="status-pill status-emerald">✓ Completed</span>`;
      else if (a.status === 'Cancelled') statusPill = `<span class="status-pill status-rose">✕ Cancelled</span>`;
      else if (a.status === 'In Consultation') statusPill = `<span class="status-pill status-amber">⏳ In Consultation</span>`;
      else if (a.status === 'Confirmed' || a.status === 'Upcoming') statusPill = `<span class="status-pill status-blue">📅 ${a.status}</span>`;

      const aptId = a._id || a.id || a.tokenNumber;

      return `
        <tr>
          <td><span style="font-weight: 800; font-family: var(--font-mono); color: var(--color-blue-600);">${a.tokenNumber || 'OPD-1000'}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--color-slate-900);">${a.patientName || 'Alexander Wright'}</div>
            <div style="font-size: 0.6875rem; color: var(--color-slate-500);">${a.type || 'Consultation'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-slate-800);">${a.doctor || 'Dr. Sarah Jenkins, MD'}</div>
            <div style="font-size: 0.6875rem; color: var(--color-slate-500);">${a.department || 'General OPD'}</div>
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-slate-700);">${a.date || 'Today'}</div>
            <div style="font-size: 0.6875rem; color: var(--color-slate-500);">${a.timeSlot || '10:00 AM'}</div>
          </td>
          <td>${statusPill}</td>
          <td style="text-align: right;">
            <select class="select-control" style="width: auto; padding: 0.35rem 1.5rem 0.35rem 0.6rem; font-size: 0.75rem;" onchange="window.carePlusApp.updateAppointmentStatus('${aptId}', this.value)">
              <option value="" disabled selected>Update Status...</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Render Billing Table
  function renderBilling() {
    const tbody = document.getElementById('billingTableBody');
    if (!tbody) return;

    const q = state.billingSearch.toLowerCase();
    const filtered = state.invoices.filter(i => {
      const matchStatus = state.billingFilter === 'all' || i.status === state.billingFilter;
      const matchSearch = !q || (i.patientName && i.patientName.toLowerCase().includes(q)) || (i.invoiceId && i.invoiceId.toLowerCase().includes(q)) || (i.description && i.description.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--color-slate-400);">No invoices recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(i => {
      const isPaid = i.status === 'Paid';
      const statusPill = isPaid
        ? '<span class="status-pill status-emerald">✓ Paid</span>'
        : '<span class="status-pill status-amber">⏳ Pending</span>';

      const invId = i._id || i.id || i.invoiceId;

      return `
        <tr>
          <td><span style="font-family: var(--font-mono); font-weight: 800; color: var(--color-purple-600);">${i.invoiceId || 'INV-0000'}</span></td>
          <td>
            <div style="font-weight: 700; color: var(--color-slate-900);">${i.patientName || 'Patient'}</div>
            <div style="font-size: 0.6875rem; color: var(--color-slate-500);">${i.patientId || 'PT-9801'}</div>
          </td>
          <td><span style="font-weight: 600; color: var(--color-slate-700);">${i.description}</span></td>
          <td><span style="font-weight: 800; color: var(--color-slate-900); font-size: 0.9375rem;">$${parseFloat(i.amount).toFixed(2)}</span></td>
          <td><span class="status-pill status-slate">${i.method || 'Cash / Reception'}</span></td>
          <td>${statusPill}</td>
          <td style="text-align: right;">
            ${!isPaid ? `
              <button class="btn btn-emerald btn-sm" onclick="window.carePlusApp.updateInvoiceStatus('${invId}', 'Paid')">
                💵 Collect Payment
              </button>
            ` : `
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--color-emerald-600);">Receipt Issued</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  // Interactive Live Endpoint Runner
  async function executeEndpoint(endpointId) {
    const runner = document.getElementById(`runner-${endpointId}`);
    if (!runner) return;

    const method = runner.dataset.method || 'GET';
    const pathTemplate = runner.dataset.path || '/api/health';
    const reqBodyInput = runner.querySelector('.req-body-input');
    const authCheckbox = runner.querySelector('.req-auth-checkbox');
    const responseContainer = runner.querySelector('.response-container');
    const responseStatus = runner.querySelector('.response-status');
    const responseTime = runner.querySelector('.response-time');
    const responseBody = runner.querySelector('.response-body');

    // Headers
    const headers = {
      'Content-Type': 'application/json'
    };

    if (authCheckbox && authCheckbox.checked) {
      if (!state.authToken) {
        showToast('Please login or generate an auth token first!', 'warning');
      } else {
        headers['Authorization'] = `Bearer ${state.authToken}`;
      }
    }

    let url = pathTemplate;
    if (url.includes(':id')) {
      const sampleId = state.appointments[0]?._id || 'mem-apt-1082';
      url = url.replace(':id', sampleId);
    }

    const options = {
      method,
      headers
    };

    if (method !== 'GET' && method !== 'HEAD' && reqBodyInput) {
      try {
        options.body = JSON.stringify(JSON.parse(reqBodyInput.value));
      } catch (err) {
        showToast('Invalid JSON in request payload!', 'error');
        return;
      }
    }

    responseContainer.style.display = 'block';
    responseBody.innerHTML = '<span style="color: var(--color-slate-400);">Executing HTTP request...</span>';

    const startTime = performance.now();

    try {
      const res = await fetch(url, options);
      const elapsed = Math.round(performance.now() - startTime);

      let data;
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      responseTime.textContent = `${elapsed}ms`;

      if (res.ok) {
        responseStatus.className = 'status-pill status-emerald';
        responseStatus.textContent = `${res.status} ${res.statusText || 'OK'}`;
      } else {
        responseStatus.className = 'status-pill status-rose';
        responseStatus.textContent = `${res.status} ${res.statusText || 'Error'}`;
      }

      responseBody.innerHTML = syntaxHighlightJson(data);

      // If login endpoint, capture token
      if (pathTemplate === '/api/patient/login' && data.success && data.token) {
        state.authToken = data.token;
        state.authUser = data.patient;
        localStorage.setItem('careplus_backend_token', state.authToken);
        localStorage.setItem('careplus_backend_user', JSON.stringify(state.authUser));
        updateUserUI();
        showToast('JWT session token captured for interactive testing!', 'success');
      }

    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      responseTime.textContent = `${elapsed}ms`;
      responseStatus.className = 'status-pill status-rose';
      responseStatus.textContent = 'Network Error';
      responseBody.innerHTML = `<span style="color: var(--color-rose-500);">${err.message}</span>`;
    }
  }

  // Copy cURL helper
  function copyCurl(endpointId) {
    const runner = document.getElementById(`runner-${endpointId}`);
    if (!runner) return;
    const method = runner.dataset.method || 'GET';
    const path = runner.dataset.path || '/api/health';
    const host = window.location.origin;
    const authCheckbox = runner.querySelector('.req-auth-checkbox');
    const reqBodyInput = runner.querySelector('.req-body-input');

    let curl = `curl -X ${method} "${host}${path}" \\\n  -H "Content-Type: application/json"`;
    if (authCheckbox && authCheckbox.checked && state.authToken) {
      curl += ` \\\n  -H "Authorization: Bearer ${state.authToken}"`;
    }
    if (method !== 'GET' && reqBodyInput && reqBodyInput.value) {
      curl += ` \\\n  -d '${reqBodyInput.value.replace(/'/g, "\\'")}'`;
    }

    navigator.clipboard.writeText(curl);
    showToast('cURL command copied to clipboard!', 'success');
  }

  // Copy Token Helper
  function copyActiveToken() {
    if (!state.authToken) {
      showToast('No active token. Please login first.', 'warning');
      return;
    }
    navigator.clipboard.writeText(state.authToken);
    showToast('JWT Token copied to clipboard!', 'success');
  }

  // Tab Switching
  function switchTab(tabName) {
    state.activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    document.querySelectorAll('.tab-content-pane').forEach(pane => {
      if (pane.id === `tabPane-${tabName}`) {
        pane.style.display = 'block';
        pane.classList.add('animate-fade-in');
      } else {
        pane.style.display = 'none';
        pane.classList.remove('animate-fade-in');
      }
    });

    // Refresh tab specific data
    if (tabName === 'patients') renderPatients();
    if (tabName === 'appointments') refreshAppointments();
    if (tabName === 'billing') refreshInvoices();
  }

  // Modal Handlers
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  // Form Submissions
  async function handleCreateAppointment(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      patientName: form.patientName.value,
      patientEmail: form.patientEmail.value,
      doctor: form.doctor.value,
      department: form.department.value,
      date: form.date.value || new Date().toISOString().split('T')[0],
      timeSlot: form.timeSlot.value,
      type: form.type.value,
      reason: form.reason.value
    };

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': state.authToken ? `Bearer ${state.authToken}` : ''
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Appointment booked successfully! Token issued.', 'success');
        closeModal('modalNewAppointment');
        form.reset();
        await refreshAppointments();
      } else {
        showToast(data.message || 'Failed to book appointment', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    const form = e.target;
    const payload = {
      patientName: form.patientName.value,
      patientId: form.patientId.value,
      patientEmail: form.patientEmail.value,
      description: form.description.value,
      amount: parseFloat(form.amount.value) || 100,
      status: form.status.value,
      method: form.method.value
    };

    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': state.authToken ? `Bearer ${state.authToken}` : ''
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Invoice created successfully!', 'success');
        closeModal('modalNewInvoice');
        form.reset();
        await refreshInvoices();
      } else {
        showToast(data.message || 'Failed to create invoice', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    }
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // Tab event listeners
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Endpoint accordion toggles
    document.querySelectorAll('.endpoint-head').forEach(head => {
      head.addEventListener('click', () => {
        const body = head.nextElementSibling;
        if (body && body.classList.contains('endpoint-body')) {
          body.classList.toggle('open');
        }
      });
    });

    // Patient search & filter
    const pSearch = document.getElementById('patientSearchInput');
    if (pSearch) {
      pSearch.addEventListener('input', (e) => {
        state.patientSearch = e.target.value;
        renderPatients();
      });
    }

    // Appointment search & filter
    const aptSearch = document.getElementById('appointmentSearchInput');
    if (aptSearch) {
      aptSearch.addEventListener('input', (e) => {
        state.appointmentSearch = e.target.value;
        renderAppointments();
      });
    }
    const aptFilter = document.getElementById('appointmentStatusFilter');
    if (aptFilter) {
      aptFilter.addEventListener('change', (e) => {
        state.appointmentFilter = e.target.value;
        renderAppointments();
      });
    }

    // Billing search & filter
    const billSearch = document.getElementById('billingSearchInput');
    if (billSearch) {
      billSearch.addEventListener('input', (e) => {
        state.billingSearch = e.target.value;
        renderBilling();
      });
    }
    const billFilter = document.getElementById('billingStatusFilter');
    if (billFilter) {
      billFilter.addEventListener('change', (e) => {
        state.billingFilter = e.target.value;
        renderBilling();
      });
    }

    // Forms
    const aptForm = document.getElementById('formNewAppointment');
    if (aptForm) aptForm.addEventListener('submit', handleCreateAppointment);

    const invForm = document.getElementById('formNewInvoice');
    if (invForm) invForm.addEventListener('submit', handleCreateInvoice);

    // Initial Load
    loadInitialData();
  });

  // Global Exports for inline onclick handlers
  window.carePlusApp = {
    state,
    performDemoLogin,
    executeEndpoint,
    copyCurl,
    copyActiveToken,
    switchTab,
    openModal,
    closeModal,
    updateAppointmentStatus,
    updateInvoiceStatus,
    refreshAppointments,
    refreshInvoices,
    quickTestPatient: (email) => {
      switchTab('explorer');
      const loginBody = document.querySelector('#runner-auth-login .req-body-input');
      if (loginBody) {
        loginBody.value = JSON.stringify({ email, password: 'demo12345', role: 'patient' }, null, 2);
        showToast(`Pre-filled login payload for ${email}`, 'info');
        const loginAccordion = document.getElementById('endpoint-auth-login');
        if (loginAccordion) {
          const body = loginAccordion.querySelector('.endpoint-body');
          if (body) body.classList.add('open');
          loginAccordion.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

})();
