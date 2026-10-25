// ==========================================================================
// Mannum Maramum Iyakkam — Admin Portal Client-Side Controller
// ==========================================================================

const API_BASE = '/api';
let currentUser = null;
let allProjectsCache = [];
let allEventsCache = [];

// API helper with Authorization header
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('mm_admin_token');
  if (!token) {
    window.location.href = '/admin/login';
    return null;
  }

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`
  };

  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const apiBase = window.API_BASE_URL || window.__API_URL__ || '';
  const url = (endpoint.startsWith('http') || !apiBase) ? endpoint : `${apiBase}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('mm_admin_token');
    localStorage.removeItem('mm_admin_user');
    window.location.href = '/admin/login';
    return null;
  }

  return response.json();
}

// Show Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' 
        ? '<polyline points="20 6 9 17 4 12"></polyline>' 
        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'}
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Modal Helpers
function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('open');
}

function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.remove('open');
}

// Reusable Confirmation Dialog
let onConfirmCallback = null;
function openConfirmModal(title, message, callback) {
  document.getElementById('confirmModalTitle').textContent = title || 'Confirm Action';
  document.getElementById('confirmModalMsg').textContent = message || 'Are you sure you want to proceed?';
  onConfirmCallback = callback;
  openModal('confirmModal');
}

document.getElementById('confirmModalBtn').addEventListener('click', () => {
  if (typeof onConfirmCallback === 'function') {
    onConfirmCallback();
  }
  closeModal('confirmModal');
  onConfirmCallback = null;
});

// Single File Upload Helper
async function uploadSingleFile(fileInput, targetInputId) {
  if (!fileInput.files || fileInput.files.length === 0) return;
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (res && res.success) {
      document.getElementById(targetInputId).value = res.url;
      showToast('Image uploaded successfully: ' + res.filename, 'success');
    } else {
      showToast(res ? res.message : 'Upload failed', 'error');
    }
  } catch (err) {
    showToast('Upload error', 'error');
  }
}

// ==========================================================================
// Initialization & Navigation
// ==========================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const token = localStorage.getItem('mm_admin_token');
  if (!token) {
    window.location.href = '/admin/login';
    return;
  }

  // Load user profile
  try {
    const userRes = await apiFetch('/api/auth/me');
    if (userRes && userRes.success && userRes.user) {
      currentUser = userRes.user;
      document.getElementById('currentUserName').textContent = currentUser.name || currentUser.username;
      document.getElementById('currentUserRole').textContent = currentUser.role === 'super_admin' ? 'Super Administrator' : (currentUser.role === 'editor' ? 'Content Editor' : 'Administrator');
      document.getElementById('userAvatar').textContent = (currentUser.name || currentUser.username).charAt(0).toUpperCase();

      document.getElementById('setName').textContent = currentUser.name || currentUser.username;
      document.getElementById('setEmail').textContent = currentUser.email;
      document.getElementById('setRole').textContent = currentUser.role;
      document.getElementById('setAvatar').textContent = (currentUser.name || currentUser.username).charAt(0).toUpperCase();
    } else {
      window.location.href = '/admin/login';
      return;
    }
  } catch (err) {
    window.location.href = '/admin/login';
    return;
  }

  // Setup navigation
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) switchView(view);
    });
  });

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
    });
  }

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    openConfirmModal('Sign Out', 'Are you sure you want to log out of the Mannum Maramum Admin Portal?', async () => {
      try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('mm_admin_token');
      localStorage.removeItem('mm_admin_user');
      window.location.href = '/admin/login';
    });
  });

  // Initial data load
  await loadDashboardData();
  await loadProjects();
  await loadEvents();
  await loadGallery();
  await loadVolunteers();
  await loadPartnerships();
  await loadDonations();
  await loadImpact();
  await loadContent();
  await loadStaffUsers();

  // Setup search & filter listeners
  setupFilters();
  setupForms();
});

// View switcher
function switchView(viewId) {
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === viewId);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewId}`);
  });

  // Title mappings
  const titles = {
    dashboard: { title: 'Dashboard', sub: 'Real-time overview of Mannum Maramum NGO operations' },
    projects: { title: 'Project Management', sub: 'Add, publish, and manage verified environmental restoration projects' },
    events: { title: 'Events Management', sub: 'Conduct seasonal seed sowing drives, nature walks & workshops' },
    gallery: { title: 'Gallery Management', sub: 'Upload, caption, and showcase authentic ecological field photography' },
    volunteers: { title: 'Volunteer Coordination', sub: 'Manage registered nature volunteers, assignments & contact data' },
    partnerships: { title: 'Institutional Partnerships', sub: 'Evaluate college, corporate CSR, and NGO collaboration applications' },
    donations: { title: 'Donation Records', sub: 'Track and verify environmental tree adoption and nursery contributions' },
    impact: { title: 'Verified Impact Reports', sub: 'Update approved palm seeds, trees planted, and locations covered' },
    content: { title: 'Website Content Management', sub: 'Manage Tamil and English bilingual website copy and announcements' },
    settings: { title: 'Admin Settings & Staff', sub: 'Update personal credentials and manage administrative staff roles' }
  };

  const current = titles[viewId] || { title: 'Dashboard', sub: '' };
  document.getElementById('pageTitle').textContent = current.title;
  document.getElementById('pageSubtitle').textContent = current.sub;

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');

  // Trigger data refreshes if needed
  if (viewId === 'dashboard') loadDashboardData();
}

// ==========================================================================
// 1. DASHBOARD CONTROLLER
// ==========================================================================

async function loadDashboardData() {
  try {
    const data = await apiFetch('/api/dashboard/summary');
    if (!data || !data.success) return;

    const s = data.summary;
    document.getElementById('kpiPalmSeeds').textContent = (s.palmSeedsPlanted || 50000).toLocaleString();
    document.getElementById('kpiTrees').textContent = (s.treesPlanted || 5000).toLocaleString();
    document.getElementById('kpiProjects').textContent = s.totalProjects;
    document.getElementById('kpiProjectsSub').textContent = `${s.publishedProjects} Published on Website`;
    document.getElementById('kpiEvents').textContent = s.totalEvents;
    document.getElementById('kpiEventsSub').textContent = `${s.upcomingEvents} Upcoming Drives`;
    document.getElementById('kpiVolunteers').textContent = s.totalVolunteers;
    document.getElementById('kpiVolunteersSub').textContent = `${s.pendingVolunteers} Pending Review`;
    document.getElementById('kpiPartnerships').textContent = s.totalPartnerships;
    document.getElementById('kpiPartnershipsSub').textContent = `${s.pendingPartnerships} Pending Review`;

    // Badges on sidebar
    document.getElementById('badgeProjects').textContent = s.totalProjects;
    document.getElementById('badgeEvents').textContent = s.totalEvents;
    document.getElementById('badgeGallery').textContent = s.totalGalleryPhotos;
    document.getElementById('badgeVolunteers').textContent = s.totalVolunteers;
    document.getElementById('badgePartnerships').textContent = s.totalPartnerships;
    const galCountDisp = document.getElementById('galleryCountDisplay');
    if (galCountDisp) galCountDisp.textContent = s.totalGalleryPhotos;

    // Render Recent Projects table
    const projTbody = document.getElementById('dashRecentProjectsBody');
    if (data.recentProjects && data.recentProjects.length > 0) {
      projTbody.innerHTML = data.recentProjects.map(p => `
        <tr>
          <td>
            <div style="font-weight:700; color:var(--forest-900);">${escapeHtml(p.title_en)}</div>
          </td>
          <td><span class="tpill" style="display:inline-block; background:rgba(183,226,58,0.2); padding:3px 8px; border-radius:99px; font-size:0.75rem; font-weight:700;">${p.category}</span></td>
          <td>${p.project_date}</td>
          <td><span class="badge badge-${p.status}">${p.status}</span></td>
          <td>
            <button class="icon-btn" onclick="editProject(${p.id})" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      projTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px;">No projects recorded yet.</td></tr>';
    }

    // Render Pending Community Requests
    const pendTbody = document.getElementById('dashPendingSubmissionsBody');
    const pendingList = [
      ...(data.recentPartnerships || []).filter(p => p.status === 'Pending').map(p => ({ ...p, isPart: true })),
      ...(data.recentVolunteers || []).filter(v => v.status === 'Pending').map(v => ({ ...v, isVol: true }))
    ];

    if (pendingList.length > 0) {
      pendTbody.innerHTML = pendingList.map(item => `
        <tr>
          <td><strong>${escapeHtml(item.isPart ? item.org_name : item.name)}</strong></td>
          <td>${item.isPart ? `Partnership (${item.org_type})` : 'Volunteer Application'}</td>
          <td>${(item.created_at || '').slice(0, 10)}</td>
          <td><span class="badge badge-pending">Pending</span></td>
          <td>
            <button class="btn btn-sm btn-outline" onclick="${item.isPart ? `reviewPartnership(${item.id})` : `reviewVolunteer(${item.id})`}">
              Review
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      pendTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px; color:var(--text-muted);">No pending requests requiring review.</td></tr>';
    }

    // Render Activity Logs
    const actList = document.getElementById('dashActivityLogList');
    if (data.recentActivities && data.recentActivities.length > 0) {
      actList.innerHTML = data.recentActivities.map(act => `
        <div style="border-left: 2px solid var(--forest-600); padding-left: 10px;">
          <div style="font-weight:700; color:var(--forest-900); font-size:0.82rem;">${escapeHtml(act.action)} <span style="font-weight:400; color:var(--text-muted);">by ${escapeHtml(act.username || 'Admin')}</span></div>
          <div style="font-size:0.78rem; color:var(--text-main); margin-top:2px;">${escapeHtml(act.details || '')}</div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;">${act.created_at}</div>
        </div>
      `).join('');
    } else {
      actList.innerHTML = '<div style="color:var(--text-muted);">No recent logs.</div>';
    }

  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

// ==========================================================================
// 2. PROJECTS CONTROLLER
// ==========================================================================

async function loadProjects() {
  try {
    const search = document.getElementById('projSearchInput').value;
    const category = document.getElementById('projCategoryFilter').value;
    const status = document.getElementById('projStatusFilter').value;

    let url = `/api/projects?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    allProjectsCache = res.projects || [];
    renderProjectsTable(allProjectsCache);
    updateProjectDropdowns(allProjectsCache);
  } catch (err) {
    console.error('Projects load error:', err);
  }
}

function renderProjectsTable(projects) {
  const tbody = document.getElementById('projectsTableBody');
  if (!projects || projects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No projects found matching the criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = projects.map(p => `
    <tr>
      <td>
        <img src="${p.cover_image || '/uploads/gallery/gallery-1.jpg'}" style="width:48px; height:48px; border-radius:10px; object-fit:cover;" onerror="this.src='/logo.png'">
      </td>
      <td>
        <div style="font-weight:700; color:var(--forest-900); font-size:0.95rem;">${escapeHtml(p.title_en)}</div>
        <div style="font-size:0.82rem; color:var(--forest-700);">${escapeHtml(p.title_ta || '')}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:3px;">${escapeHtml(p.participating_orgs || 'Independent project')}</div>
      </td>
      <td>${escapeHtml(p.location)}</td>
      <td>
        <div style="font-size:0.85rem; font-weight:700; color:var(--forest-900);">${p.palm_seeds_planted.toLocaleString()} seeds</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${p.saplings_planted.toLocaleString()} saplings</div>
      </td>
      <td>${p.project_date}</td>
      <td>
        <button class="badge badge-${p.status}" style="cursor:pointer; border:none;" onclick="toggleProjectPublish(${p.id}, '${p.status}')" title="Click to toggle publish status">
          ${p.status}
        </button>
      </td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" onclick="editProject(${p.id})" title="Edit Project">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteProject(${p.id})" title="Delete Project">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function updateProjectDropdowns(projects) {
  const assignProjSelect = document.getElementById('gAssignProject');
  const volProjSelect = document.getElementById('volModalProject');

  const options = '<option value="">None</option>' + projects.map(p => `<option value="${p.id}">${escapeHtml(p.title_en)}</option>`).join('');
  if (assignProjSelect) assignProjSelect.innerHTML = options;
  if (volProjSelect) volProjSelect.innerHTML = options;
}

function openCreateProjectModal() {
  document.getElementById('projectModalTitle').textContent = 'Create Environmental Project';
  document.getElementById('projEditId').value = '';
  document.getElementById('projectForm').reset();
  document.getElementById('pDate').value = new Date().toISOString().slice(0, 10);
  openModal('projectModal');
}

function editProject(id) {
  const p = allProjectsCache.find(x => x.id === id);
  if (!p) return;

  document.getElementById('projectModalTitle').textContent = 'Edit Project Details';
  document.getElementById('projEditId').value = p.id;
  document.getElementById('pTitleEn').value = p.title_en;
  document.getElementById('pTitleTa').value = p.title_ta || '';
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pDate').value = p.project_date;
  document.getElementById('pLocation').value = p.location;
  document.getElementById('pStatus').value = p.status;
  document.getElementById('pPalmSeeds').value = p.palm_seeds_planted;
  document.getElementById('pSaplings').value = p.saplings_planted;
  document.getElementById('pParticipatingOrgs').value = p.participating_orgs || '';
  document.getElementById('pSupportingOrgs').value = p.supporting_orgs || '';
  document.getElementById('pCoverImage').value = p.cover_image || '';
  document.getElementById('pDescEn').value = p.description_en;
  document.getElementById('pDescTa').value = p.description_ta || '';
  document.getElementById('pHighlights').value = (p.key_highlights || []).join(', ');

  openModal('projectModal');
}

async function toggleProjectPublish(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  try {
    const res = await apiFetch(`/api/projects/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res && res.success) {
      showToast(res.message, 'success');
      loadProjects();
      loadDashboardData();
    }
  } catch (err) {
    showToast('Failed to toggle status', 'error');
  }
}

function deleteProject(id) {
  const p = allProjectsCache.find(x => x.id === id);
  const title = p ? p.title_en : `Project #${id}`;
  openConfirmModal(
    'Delete Environmental Project',
    `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`,
    async () => {
      try {
        const res = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast(res.message, 'success');
          loadProjects();
          loadDashboardData();
        } else {
          showToast(res ? res.message : 'Delete failed', 'error');
        }
      } catch (err) {
        showToast('Error deleting project', 'error');
      }
    }
  );
}

// ==========================================================================
// 3. EVENTS CONTROLLER
// ==========================================================================

async function loadEvents() {
  try {
    const search = document.getElementById('eventsSearchInput').value;
    const status = document.getElementById('eventsStatusFilter').value;

    let url = `/api/events?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    allEventsCache = res.events || [];
    renderEventsTable(allEventsCache);

    const volEventSelect = document.getElementById('volModalEvent');
    if (volEventSelect) {
      volEventSelect.innerHTML = '<option value="">None</option>' + allEventsCache.map(e => `<option value="${e.id}">${escapeHtml(e.title_en)}</option>`).join('');
    }
  } catch (err) {
    console.error('Events load error:', err);
  }
}

function renderEventsTable(events) {
  const tbody = document.getElementById('eventsTableBody');
  if (!events || events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No events recorded.</td></tr>';
    return;
  }

  tbody.innerHTML = events.map(e => `
    <tr>
      <td>
        <div style="font-weight:700; color:var(--forest-900); font-size:0.95rem;">${escapeHtml(e.title_en)}</div>
        <div style="font-size:0.82rem; color:var(--forest-700);">${escapeHtml(e.title_ta || '')}</div>
      </td>
      <td>${e.event_date}</td>
      <td>${escapeHtml(e.location)}</td>
      <td>
        <div style="font-size:0.85rem; font-weight:700;">${e.registered_participants || 0} / ${e.target_participants || 0}</div>
      </td>
      <td><span class="badge badge-${e.status}">${e.status}</span></td>
      <td>
        <button class="badge ${e.is_published ? 'badge-published' : 'badge-draft'}" style="cursor:pointer; border:none;" onclick="toggleEventPublish(${e.id}, ${e.is_published})" title="Click to toggle publish status">
          ${e.is_published ? '✓ Live' : 'Hidden'}
        </button>
      </td>
      <td>
        <div class="table-actions">
          <button class="icon-btn" onclick="editEvent(${e.id})" title="Edit Event">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="icon-btn danger" onclick="deleteEvent(${e.id})" title="Delete Event">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function toggleEventPublish(id, currentPublished) {
  const newStatus = currentPublished ? 0 : 1;
  try {
    const res = await apiFetch(`/api/events/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: newStatus })
    });
    if (res && res.success) {
      showToast(res.message, 'success');
      loadEvents();
      loadDashboardData();
    }
  } catch (err) {
    showToast('Failed to toggle event publish status', 'error');
  }
}

function openCreateEventModal() {
  document.getElementById('eventModalTitle').textContent = 'Create NGO Event';
  document.getElementById('eventEditId').value = '';
  document.getElementById('eventForm').reset();
  document.getElementById('eDate').value = new Date().toISOString().slice(0, 10);
  openModal('eventModal');
}

function editEvent(id) {
  const e = allEventsCache.find(x => x.id === id);
  if (!e) return;

  document.getElementById('eventModalTitle').textContent = 'Edit Event Details';
  document.getElementById('eventEditId').value = e.id;
  document.getElementById('eTitleEn').value = e.title_en;
  document.getElementById('eTitleTa').value = e.title_ta || '';
  document.getElementById('eDate').value = e.event_date;
  document.getElementById('eLocation').value = e.location;
  document.getElementById('eStatus').value = e.status;
  document.getElementById('eTarget').value = e.target_participants;
  document.getElementById('eCoverImage').value = e.cover_image || '';
  document.getElementById('eDescEn').value = e.description_en;
  document.getElementById('eDescTa').value = e.description_ta || '';

  openModal('eventModal');
}

function deleteEvent(id) {
  const e = allEventsCache.find(x => x.id === id);
  const title = e ? e.title_en : `Event #${id}`;
  openConfirmModal(
    'Delete NGO Event',
    `Are you sure you want to delete event "${title}"?`,
    async () => {
      try {
        const res = await apiFetch(`/api/events/${id}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast(res.message, 'success');
          loadEvents();
          loadDashboardData();
        }
      } catch (err) {
        showToast('Error deleting event', 'error');
      }
    }
  );
}

// ==========================================================================
// 4. GALLERY CONTROLLER
// ==========================================================================

let galleryItemsCache = [];

async function loadGallery() {
  try {
    const category = document.getElementById('galleryCategoryFilter').value;
    let url = `/api/gallery?category=${encodeURIComponent(category)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    galleryItemsCache = res.gallery || [];
    renderGalleryGrid(galleryItemsCache);
  } catch (err) {
    console.error('Gallery load error:', err);
  }
}

function renderGalleryGrid(items) {
  const container = document.getElementById('galleryGridContainer');
  if (!items || items.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:30px;">No gallery photos found.</p>';
    return;
  }

  container.innerHTML = items.map(img => `
    <div class="gallery-card">
      <img src="${img.image_url}" class="gallery-card-img" onerror="this.src='/logo.png'">
      <div class="gallery-card-body">
        <div class="gallery-card-caption">${escapeHtml(img.caption_en)}</div>
        ${img.caption_ta ? `<div style="font-size:0.75rem; color:var(--forest-700);">${escapeHtml(img.caption_ta)}</div>` : ''}
        <div class="gallery-card-meta">
          <span class="tpill" style="display:inline-block; font-size:0.68rem; padding:2px 7px;">${img.category || 'field'}</span>
          <button class="badge ${img.is_published ? 'badge-published' : 'badge-draft'}" style="cursor:pointer; border:none; padding:2px 8px;" onclick="toggleGalleryPublish(${img.id}, ${img.is_published})" title="Click to toggle publish status">
            ${img.is_published ? '✓ Live' : 'Hidden'}
          </button>
        </div>
        <div class="gallery-card-actions">
          <button class="btn btn-sm btn-outline" style="flex:1;" onclick="editGalleryPhoto(${img.id})">Edit</button>
          <button class="icon-btn danger" onclick="deleteGalleryPhoto(${img.id})" title="Remove photo">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

async function toggleGalleryPublish(id, currentPublished) {
  const newStatus = currentPublished ? 0 : 1;
  try {
    const res = await apiFetch(`/api/gallery/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: newStatus })
    });
    if (res && res.success) {
      showToast(res.message, 'success');
      loadGallery();
      loadDashboardData();
    }
  } catch (err) {
    showToast('Failed to toggle photo publish status', 'error');
  }
}

function openUploadGalleryModal() {
  document.getElementById('galleryUploadForm').reset();
  document.getElementById('galleryPreviewStrip').innerHTML = '';
  openModal('galleryUploadModal');
}

// Multi-file preview in dropzone
document.getElementById('galleryFilesInput').addEventListener('change', function () {
  const previewStrip = document.getElementById('galleryPreviewStrip');
  previewStrip.innerHTML = '';
  if (this.files) {
    Array.from(this.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'preview-thumb';
        previewStrip.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  }
});

function editGalleryPhoto(id) {
  const item = galleryItemsCache.find(x => x.id === id);
  if (!item) return;

  document.getElementById('editGalId').value = item.id;
  document.getElementById('editGalPreviewImg').src = item.image_url;
  document.getElementById('editGalCaptionEn').value = item.caption_en;
  document.getElementById('editGalCaptionTa').value = item.caption_ta || '';
  document.getElementById('editGalCategory').value = item.category || 'general';
  document.getElementById('editGalPublished').value = item.is_published ? '1' : '0';

  openModal('galleryEditModal');
}

function deleteGalleryPhoto(id) {
  const item = galleryItemsCache.find(x => x.id === id);
  const caption = item ? item.caption_en : `Photo #${id}`;
  openConfirmModal(
    'Delete Gallery Photo',
    `Are you sure you want to remove photo "${caption}"?`,
    async () => {
      try {
        const res = await apiFetch(`/api/gallery/${id}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast(res.message, 'success');
          loadGallery();
          loadDashboardData();
        }
      } catch (err) {
        showToast('Error removing gallery photo', 'error');
      }
    }
  );
}

// ==========================================================================
// 5. VOLUNTEERS CONTROLLER
// ==========================================================================

let volunteersCache = [];

async function loadVolunteers() {
  try {
    const search = document.getElementById('volSearchInput').value;
    const status = document.getElementById('volStatusFilter').value;

    let url = `/api/volunteers?search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    volunteersCache = res.volunteers || [];
    renderVolunteersTable(volunteersCache);
  } catch (err) {
    console.error('Volunteers load error:', err);
  }
}

function renderVolunteersTable(volunteers) {
  const tbody = document.getElementById('volunteersTableBody');
  if (!volunteers || volunteers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No volunteers found.</td></tr>';
    return;
  }

  tbody.innerHTML = volunteers.map(v => `
    <tr>
      <td>
        <div style="font-weight:700; color:var(--forest-900);">${escapeHtml(v.name)}</div>
        <div style="font-size:0.78rem; color:var(--text-muted);">${v.created_at ? v.created_at.slice(0, 10) : ''}</div>
      </td>
      <td>
        <div style="font-size:0.85rem;">${escapeHtml(v.email)}</div>
        <div style="font-size:0.82rem; color:var(--forest-700);">${escapeHtml(v.phone)}</div>
      </td>
      <td>${escapeHtml(v.district || '—')}</td>
      <td>
        <div style="font-size:0.85rem; font-weight:600;">${escapeHtml(v.occupation || 'Volunteer')}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(v.skills || 'General')}</div>
      </td>
      <td>
        ${v.project_title ? `<span style="font-size:0.82rem; font-weight:600; color:var(--forest-900);">${escapeHtml(v.project_title)}</span>` : '<span style="color:var(--text-muted);">Unassigned</span>'}
      </td>
      <td><span class="badge badge-${v.status.toLowerCase()}">${v.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="reviewVolunteer(${v.id})">Review & Assign</button>
      </td>
    </tr>
  `).join('');
}

function reviewVolunteer(id) {
  const v = volunteersCache.find(x => x.id === id);
  if (!v) return;

  document.getElementById('volEditId').value = v.id;
  document.getElementById('volModalName').textContent = v.name;
  document.getElementById('volModalRegisteredDate').textContent = `Registered: ${v.created_at ? v.created_at.slice(0, 10) : ''}`;
  document.getElementById('volModalEmail').textContent = v.email;
  document.getElementById('volModalPhone').textContent = v.phone;
  document.getElementById('volModalDistrict').textContent = v.district || 'Not specified';
  document.getElementById('volModalOccupation').textContent = v.occupation || 'Not specified';
  document.getElementById('volModalSkills').textContent = v.skills || 'General';
  document.getElementById('volModalStatus').value = v.status;
  document.getElementById('volModalProject').value = v.assigned_project_id || '';
  document.getElementById('volModalEvent').value = v.assigned_event_id || '';
  document.getElementById('volModalNotes').value = v.notes || '';

  openModal('volunteerModal');
}

function exportVolunteersCSV() {
  const token = localStorage.getItem('mm_admin_token');
  window.open(`/api/volunteers/export?token=${token}`, '_blank');
}

// ==========================================================================
// 6. PARTNERSHIPS CONTROLLER
// ==========================================================================

let partnershipsCache = [];

async function loadPartnerships() {
  try {
    const search = document.getElementById('partSearchInput').value;
    const org_type = document.getElementById('partTypeFilter').value;
    const status = document.getElementById('partStatusFilter').value;

    let url = `/api/partnerships?search=${encodeURIComponent(search)}&org_type=${encodeURIComponent(org_type)}&status=${encodeURIComponent(status)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    partnershipsCache = res.partnerships || [];
    renderPartnershipsTable(partnershipsCache);
  } catch (err) {
    console.error('Partnerships load error:', err);
  }
}

function renderPartnershipsTable(list) {
  const tbody = document.getElementById('partnershipsTableBody');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;">No partnership requests found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(p => {
    const focusSummary = (p.focus_areas || []).slice(0, 2).join(', ');
    return `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--forest-900); font-size:0.95rem;">${escapeHtml(p.org_name)}</div>
          ${p.website ? `<a href="${p.website}" target="_blank" style="font-size:0.75rem; color:var(--forest-700); text-decoration:none;">${p.website}</a>` : ''}
        </td>
        <td><span class="tpill" style="display:inline-block; font-size:0.75rem; padding:3px 8px;">${p.org_type}</span></td>
        <td>
          <div style="font-weight:600;">${escapeHtml(p.contact_name)}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">${escapeHtml(p.contact_email)} | ${escapeHtml(p.contact_mobile)}</div>
        </td>
        <td>${escapeHtml(p.district)} ${p.pincode ? `(${p.pincode})` : ''}</td>
        <td>
          <div style="font-size:0.85rem; font-weight:600;">${escapeHtml(p.duration || 'Flexible')}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(focusSummary)}</div>
        </td>
        <td><span class="badge badge-${p.status.toLowerCase()}">${p.status}</span></td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="reviewPartnership(${p.id})">Evaluate</button>
        </td>
      </tr>
    `;
  }).join('');
}

function reviewPartnership(id) {
  const p = partnershipsCache.find(x => x.id === id);
  if (!p) return;

  document.getElementById('partEditId').value = p.id;
  document.getElementById('partModalOrgName').textContent = p.org_name;
  document.getElementById('partModalTypeBadge').textContent = p.org_type;
  document.getElementById('partModalContact').textContent = p.contact_name;
  document.getElementById('partModalDesignation').textContent = p.contact_designation || 'Representative';
  document.getElementById('partModalMobile').textContent = p.contact_mobile;
  document.getElementById('partModalEmail').textContent = p.contact_email;
  document.getElementById('partModalAddress').textContent = `${p.address || ''}, ${p.district || ''} - ${p.pincode || ''}`;
  document.getElementById('partModalDuration').textContent = p.duration || 'Not specified';
  document.getElementById('partModalFocus').textContent = (p.focus_areas || []).join('; ') || 'General Environmental Protection';
  document.getElementById('partModalDistricts').textContent = (p.districts_selected || []).join(', ') || 'District wide';
  document.getElementById('partModalStatus').value = p.status;
  document.getElementById('partModalNotes').value = p.internal_notes || '';

  openModal('partnershipModal');
}

function exportPartnershipsCSV() {
  const token = localStorage.getItem('mm_admin_token');
  window.open(`/api/partnerships/export?token=${token}`, '_blank');
}

// ==========================================================================
// 7. DONATIONS CONTROLLER
// ==========================================================================

async function loadDonations() {
  try {
    const search = document.getElementById('donSearchInput').value;
    let url = `/api/donations?search=${encodeURIComponent(search)}`;
    const res = await apiFetch(url);
    if (!res || !res.success) return;

    renderDonationsTable(res.donations || []);
  } catch (err) {
    console.error('Donations load error:', err);
  }
}

function renderDonationsTable(list) {
  const tbody = document.getElementById('donationsTableBody');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px;">No donation records.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(d => `
    <tr>
      <td><strong>${escapeHtml(d.donor_name)}</strong></td>
      <td>
        <div>${escapeHtml(d.donor_email)}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(d.donor_phone)}</div>
      </td>
      <td>${escapeHtml(d.donor_pan || '—')}</td>
      <td>
        <strong style="color:var(--forest-900); font-size:1.05rem;">₹${Number(d.amount).toLocaleString('en-IN')}</strong>
      </td>
      <td>${d.donation_type}</td>
      <td><span class="badge badge-${(d.payment_status || 'verified').toLowerCase()}">${d.payment_status}</span></td>
      <td><code style="font-size:0.78rem; background:rgba(15,45,26,0.06); padding:2px 6px; border-radius:4px;">${escapeHtml(d.transaction_ref || '—')}</code></td>
      <td>${(d.created_at || '').slice(0, 10)}</td>
    </tr>
  `).join('');
}

function exportDonationsCSV() {
  const token = localStorage.getItem('mm_admin_token');
  window.open(`/api/donations/export?token=${token}`, '_blank');
}

// ==========================================================================
// 8. IMPACT CONTROLLER
// ==========================================================================

async function loadImpact() {
  try {
    const res = await apiFetch('/api/impact');
    if (!res || !res.success || !res.impact) return;

    const imp = res.impact;
    document.getElementById('impPalmSeeds').value = imp.palm_seeds_planted;
    document.getElementById('impTrees').value = imp.trees_planted;
    document.getElementById('impProjects').value = imp.projects_completed;
    document.getElementById('impEvents').value = imp.events_conducted;
    document.getElementById('impLocations').value = imp.locations_covered;
    document.getElementById('impVolunteers').value = imp.volunteers_participated;
    document.getElementById('impActiveSince').value = imp.active_since;
  } catch (err) {
    console.error('Impact load error:', err);
  }
}

// ==========================================================================
// 9. WEBSITE CONTENT CONTROLLER
// ==========================================================================

let contentListCache = [];

async function loadContent() {
  try {
    const res = await apiFetch('/api/content');
    if (!res || !res.success) return;

    contentListCache = res.list || [];
    renderContentTable(contentListCache);
  } catch (err) {
    console.error('Content load error:', err);
  }
}

function renderContentTable(list) {
  const tbody = document.getElementById('contentTableBody');
  if (!list || list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">No content blocks found.</td></tr>';
    return;
  }

  tbody.innerHTML = list.map(item => `
    <tr>
      <td><span class="tpill" style="display:inline-block; font-size:0.75rem; padding:3px 8px;">${item.section}</span></td>
      <td><code style="font-weight:700; color:var(--forest-900); font-size:0.82rem;">${item.key}</code></td>
      <td style="max-width:320px; line-height:1.4;">${escapeHtml(item.content_en)}</td>
      <td style="max-width:320px; line-height:1.4; color:var(--forest-800);">${escapeHtml(item.content_ta || '—')}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editContentBlock('${item.key}')">Edit Copy</button>
      </td>
    </tr>
  `).join('');
}

function editContentBlock(key) {
  const item = contentListCache.find(x => x.key === key);
  if (!item) return;

  document.getElementById('contentEditKey').value = item.key;
  document.getElementById('contentEditDesc').textContent = `Block: ${item.key} (${item.section}) — ${item.description || ''}`;
  document.getElementById('contentEditEn').value = item.content_en;
  document.getElementById('contentEditTa').value = item.content_ta || '';

  openModal('contentEditModal');
}

// ==========================================================================
// 10. ADMIN SETTINGS CONTROLLER
// ==========================================================================

async function loadStaffUsers() {
  try {
    const res = await apiFetch('/api/auth/users');
    if (!res || !res.success) {
      document.getElementById('staffTableBody').innerHTML = '<tr><td colspan="3" style="text-align:center; padding:12px; color:var(--text-muted);">Staff management requires Super Admin privilege.</td></tr>';
      return;
    }

    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = (res.users || []).map(u => `
      <tr>
        <td>
          <div style="font-weight:700; color:var(--forest-900);">${escapeHtml(u.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(u.username)} (${escapeHtml(u.email)})</div>
        </td>
        <td><span class="badge badge-published">${u.role}</span></td>
        <td>
          ${u.id !== currentUser.id ? `
            <button class="icon-btn danger" onclick="deleteStaffUser(${u.id})" title="Remove staff account">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : '<span style="font-size:0.75rem; color:var(--lime-dark); font-weight:700;">Active Account</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Staff load error:', err);
  }
}

function openCreateUserModal() {
  document.getElementById('userForm').reset();
  openModal('userModal');
}

function deleteStaffUser(id) {
  openConfirmModal(
    'Delete Staff Account',
    'Are you sure you want to remove this administrative user account?',
    async () => {
      try {
        const res = await apiFetch(`/api/auth/users/${id}`, { method: 'DELETE' });
        if (res && res.success) {
          showToast(res.message, 'success');
          loadStaffUsers();
        } else {
          showToast(res ? res.message : 'Delete failed', 'error');
        }
      } catch (err) {
        showToast('Error deleting staff', 'error');
      }
    }
  );
}

// ==========================================================================
// Form Submission Handlers
// ==========================================================================

function setupForms() {
  // Project Form
  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('projEditId').value;
    const isEdit = Boolean(id);

    const highlightsRaw = document.getElementById('pHighlights').value;
    const highlights = highlightsRaw ? highlightsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

    const payload = {
      title_en: document.getElementById('pTitleEn').value,
      title_ta: document.getElementById('pTitleTa').value,
      category: document.getElementById('pCategory').value,
      project_date: document.getElementById('pDate').value,
      location: document.getElementById('pLocation').value,
      status: document.getElementById('pStatus').value,
      palm_seeds_planted: parseInt(document.getElementById('pPalmSeeds').value, 10) || 0,
      saplings_planted: parseInt(document.getElementById('pSaplings').value, 10) || 0,
      participating_orgs: document.getElementById('pParticipatingOrgs').value,
      supporting_orgs: document.getElementById('pSupportingOrgs').value,
      cover_image: document.getElementById('pCoverImage').value,
      description_en: document.getElementById('pDescEn').value,
      description_ta: document.getElementById('pDescTa').value,
      key_highlights: highlights
    };

    try {
      const res = await apiFetch(isEdit ? `/api/projects/${id}` : '/api/projects', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('projectModal');
        loadProjects();
        loadDashboardData();
      } else {
        showToast(res ? res.message : 'Failed to save project', 'error');
      }
    } catch (err) {
      showToast('Error saving project', 'error');
    }
  });

  // Event Form
  document.getElementById('eventForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('eventEditId').value;
    const isEdit = Boolean(id);

    const payload = {
      title_en: document.getElementById('eTitleEn').value,
      title_ta: document.getElementById('eTitleTa').value,
      event_date: document.getElementById('eDate').value,
      location: document.getElementById('eLocation').value,
      status: document.getElementById('eStatus').value,
      target_participants: parseInt(document.getElementById('eTarget').value, 10) || 0,
      cover_image: document.getElementById('eCoverImage').value,
      description_en: document.getElementById('eDescEn').value,
      description_ta: document.getElementById('eDescTa').value
    };

    try {
      const res = await apiFetch(isEdit ? `/api/events/${id}` : '/api/events', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('eventModal');
        loadEvents();
        loadDashboardData();
      } else {
        showToast(res ? res.message : 'Failed to save event', 'error');
      }
    } catch (err) {
      showToast('Error saving event', 'error');
    }
  });

  // Gallery Upload Form
  document.getElementById('galleryUploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('galleryFilesInput');
    if (!fileInput.files || fileInput.files.length === 0) {
      showToast('Please select at least one image file', 'error');
      return;
    }

    const formData = new FormData();
    Array.from(fileInput.files).forEach(f => formData.append('images', f));
    formData.append('caption_en', document.getElementById('gCaptionEn').value);
    formData.append('caption_ta', document.getElementById('gCaptionTa').value);
    formData.append('category', document.getElementById('gCategory').value);
    if (document.getElementById('gAssignProject').value) {
      formData.append('project_id', document.getElementById('gAssignProject').value);
    }

    try {
      const res = await apiFetch('/api/gallery', {
        method: 'POST',
        body: formData
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('galleryUploadModal');
        loadGallery();
        loadDashboardData();
      } else {
        showToast(res ? res.message : 'Upload failed', 'error');
      }
    } catch (err) {
      showToast('Error uploading images', 'error');
    }
  });

  // Gallery Edit Form
  document.getElementById('galleryEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editGalId').value;
    const payload = {
      caption_en: document.getElementById('editGalCaptionEn').value,
      caption_ta: document.getElementById('editGalCaptionTa').value,
      category: document.getElementById('editGalCategory').value,
      is_published: parseInt(document.getElementById('editGalPublished').value, 10)
    };

    try {
      const res = await apiFetch(`/api/gallery/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('galleryEditModal');
        loadGallery();
      }
    } catch (err) {
      showToast('Error updating photo', 'error');
    }
  });

  // Volunteer Review Form
  document.getElementById('volunteerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('volEditId').value;
    const payload = {
      status: document.getElementById('volModalStatus').value,
      assigned_project_id: document.getElementById('volModalProject').value || null,
      assigned_event_id: document.getElementById('volModalEvent').value || null,
      notes: document.getElementById('volModalNotes').value
    };

    try {
      const res = await apiFetch(`/api/volunteers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('volunteerModal');
        loadVolunteers();
        loadDashboardData();
      }
    } catch (err) {
      showToast('Error updating volunteer', 'error');
    }
  });

  // Partnership Review Form
  document.getElementById('partnershipForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('partEditId').value;
    const payload = {
      status: document.getElementById('partModalStatus').value,
      internal_notes: document.getElementById('partModalNotes').value
    };

    try {
      const res = await apiFetch(`/api/partnerships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('partnershipModal');
        loadPartnerships();
        loadDashboardData();
      }
    } catch (err) {
      showToast('Error updating partnership', 'error');
    }
  });

  // Impact Form
  document.getElementById('impactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      palm_seeds_planted: parseInt(document.getElementById('impPalmSeeds').value, 10),
      trees_planted: parseInt(document.getElementById('impTrees').value, 10),
      projects_completed: parseInt(document.getElementById('impProjects').value, 10),
      events_conducted: parseInt(document.getElementById('impEvents').value, 10),
      locations_covered: parseInt(document.getElementById('impLocations').value, 10),
      volunteers_participated: parseInt(document.getElementById('impVolunteers').value, 10),
      active_since: parseInt(document.getElementById('impActiveSince').value, 10)
    };

    try {
      const res = await apiFetch('/api/impact', {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        loadDashboardData();
      }
    } catch (err) {
      showToast('Error updating impact metrics', 'error');
    }
  });

  // Content Edit Form
  document.getElementById('contentEditForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = document.getElementById('contentEditKey').value;
    const payload = {
      content_en: document.getElementById('contentEditEn').value,
      content_ta: document.getElementById('contentEditTa').value
    };

    try {
      const res = await apiFetch(`/api/content/${key}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast(res.message, 'success');
        closeModal('contentEditModal');
        loadContent();
      }
    } catch (err) {
      showToast('Error updating content', 'error');
    }
  });

  // Password Change Form
  document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res && res.success) {
        showToast('Password changed successfully!', 'success');
        document.getElementById('changePasswordForm').reset();
      } else {
        showToast(res ? res.message : 'Password change failed', 'error');
      }
    } catch (err) {
      showToast('Error changing password', 'error');
    }
  });

  // User / Staff Creation Form
  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('uName').value,
      username: document.getElementById('uUsername').value,
      email: document.getElementById('uEmail').value,
      password: document.getElementById('uPassword').value,
      role: document.getElementById('uRole').value
    };

    try {
      const res = await apiFetch('/api/auth/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res && res.success) {
        showToast('Staff user created successfully', 'success');
        closeModal('userModal');
        loadStaffUsers();
      } else {
        showToast(res ? res.message : 'Failed to create user', 'error');
      }
    } catch (err) {
      showToast('Error creating user', 'error');
    }
  });
}

function setupFilters() {
  // Search inputs with debounce
  ['projSearchInput', 'eventsSearchInput', 'volSearchInput', 'partSearchInput', 'donSearchInput'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    let timer = null;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (id === 'projSearchInput') loadProjects();
        else if (id === 'eventsSearchInput') loadEvents();
        else if (id === 'volSearchInput') loadVolunteers();
        else if (id === 'partSearchInput') loadPartnerships();
        else if (id === 'donSearchInput') loadDonations();
      }, 300);
    });
  });

  // Dropdown filter changes
  ['projCategoryFilter', 'projStatusFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadProjects);
  });

  document.getElementById('eventsStatusFilter').addEventListener('change', loadEvents);
  document.getElementById('galleryCategoryFilter').addEventListener('change', loadGallery);
  document.getElementById('volStatusFilter').addEventListener('change', loadVolunteers);
  ['partTypeFilter', 'partStatusFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', loadPartnerships);
  });
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
