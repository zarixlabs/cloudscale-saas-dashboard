/**
 * CloudScale SaaS Dashboard - Application Interaction Logic
 * Handles sidebar drawer toggling, navigation active states, view routing,
 * state management, modals, form submissions, and dynamic rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.error('Lucide icons library failed to load.');
    }

    // Sidebar Mobile Toggle Elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const appBody = document.body;

    function toggleSidebar() {
        const isOpen = appBody.classList.toggle('sidebar-open');
        menuToggle.setAttribute('aria-expanded', isOpen);
        sidebarOverlay.setAttribute('aria-hidden', !isOpen);
    }

    function closeSidebar() {
        appBody.classList.remove('sidebar-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        sidebarOverlay.setAttribute('aria-hidden', 'true');
    }

    if (menuToggle && sidebarOverlay) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });
        sidebarOverlay.addEventListener('click', closeSidebar);
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                closeSidebar();
            }
        });
    }

    // Global Search Focus Event Listener (Keyboard shortcut ⌘K or Ctrl + K)
    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Dynamic System Date Update
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // =========================================================================
    // STATE STORE MANAGEMENT (localStorage backed)
    // =========================================================================
    const defaultServers = [
        { id: 'server-prod-01', name: 'prod-server-01', region: 'us-east-1', type: 't3.xlarge', ip: '10.0.1.24', cpu: 42, ram: 68, uptime: '127 days', status: 'online', history: '99.97%' },
        { id: 'server-staging-02', name: 'staging-02', region: 'eu-west-2', type: 't3.large', ip: '192.168.2.11', cpu: 87, ram: 91, uptime: '84 days', status: 'warning', history: '98.2%' },
        { id: 'server-backup-03', name: 'backup-03', region: 'ap-southeast-1', type: 't3.medium', ip: '10.8.0.5', cpu: 18, ram: 34, uptime: '212 days', status: 'online', history: '100%' },
        { id: 'server-db-04', name: 'prod-database-01', region: 'us-east-1', type: 'c5.2xlarge', ip: '10.0.2.55', cpu: 56, ram: 79, uptime: '310 days', status: 'online', history: '99.99%' },
        { id: 'server-worker-05', name: 'analytics-worker-05', region: 'us-west-2', type: 't3.xlarge', ip: '10.20.5.90', cpu: 0, ram: 0, uptime: '0 days', status: 'offline', history: '95.4%' }
    ];

    const defaultTeam = [
        { name: 'Alex Rivera', email: 'alex.rivera@cloudscale.io', role: 'Admin', status: 'online-dot', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop' },
        { name: 'Sam Chen', email: 'sam.chen@cloudscale.io', role: 'DevOps Lead', status: 'online-dot', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=80&auto=format&fit=crop' },
        { name: 'Priya Patel', email: 'priya.patel@cloudscale.io', role: 'Backend Eng.', status: 'away-dot', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop' },
        { name: 'Marco Liu', email: 'marco.liu@cloudscale.io', role: 'Frontend Eng.', status: 'offline-dot', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=80&auto=format&fit=crop' }
    ];

    const defaultProjects = [
        { name: 'prod-frontend', branch: 'main', commit: 'Fix: memory leak in WebSocket handler', hash: 'e0e540e', status: 'completed', time: '2m ago' },
        { name: 'api-gateway', branch: 'staging', commit: 'Feat: new billing dashboard UI', hash: '614b3d1', status: 'running', time: '28m ago' },
        { name: 'data-warehouse', branch: 'main', commit: 'Chore: DB index optimisation', hash: 'a10f92b', status: 'failed', time: '1h ago' },
        { name: 'cdn-edge', branch: 'main', commit: 'Perf: CDN cache headers tuning', hash: 'f56c71a', status: 'completed', time: '3h ago' }
    ];

    const defaultInvoices = [
        { id: 'INV-2026-006', date: 'Jul 1, 2026', amount: '$299.00', status: 'Paid' },
        { id: 'INV-2026-005', date: 'Jun 1, 2026', amount: '$299.00', status: 'Paid' },
        { id: 'INV-2026-004', date: 'May 1, 2026', amount: '$299.00', status: 'Paid' },
        { id: 'INV-2026-003', date: 'Apr 1, 2026', amount: '$250.00', status: 'Paid' }
    ];

    function getStore(key, fallback) {
        const val = localStorage.getItem(`cloudscale_${key}`);
        return val ? JSON.parse(val) : fallback;
    }
    function setStore(key, data) {
        localStorage.setItem(`cloudscale_${key}`, JSON.stringify(data));
    }

    window.state = {
        servers: getStore('servers', defaultServers),
        team: getStore('team', defaultTeam),
        projects: getStore('projects', defaultProjects),
        invoices: getStore('invoices', defaultInvoices),
        profile: getStore('profile', {
            name: 'Alex Rivera',
            email: 'alex.rivera@cloudscale.io',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop'
        })
    };

    // Apply Profile data on load
    function syncProfileDetails() {
        document.querySelectorAll('.user-avatar, .top-avatar').forEach(img => {
            img.src = window.state.profile.avatar;
        });
        document.querySelectorAll('.user-name').forEach(nameEl => {
            nameEl.textContent = window.state.profile.name;
        });
        const welcomeTitle = document.querySelector('.dashboard-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Welcome back, ${window.state.profile.name.split(' ')[0]} 👋`;
        }
        
        // Sync values to settings form
        const profileNameInput = document.getElementById('profileName');
        const profileEmailInput = document.getElementById('profileEmail');
        const profileAvatarInput = document.getElementById('profileAvatar');
        if (profileNameInput) profileNameInput.value = window.state.profile.name;
        if (profileEmailInput) profileEmailInput.value = window.state.profile.email;
        if (profileAvatarInput) profileAvatarInput.value = window.state.profile.avatar;
    }
    syncProfileDetails();

    // =========================================================================
    // TOAST NOTIFICATIONS
    // =========================================================================
    window.showToast = function(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let iconName = 'check-circle';
        if (type === 'error') iconName = 'x-circle';
        if (type === 'info') iconName = 'info';

        toast.innerHTML = `
            <span class="toast-icon"><i data-lucide="${iconName}"></i></span>
            <span class="toast-text">${message}</span>
        `;
        
        container.appendChild(toast);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    // =========================================================================
    // DYNAMIC RENDERING FUNCTIONS
    // =========================================================================
    window.renderServersList = function(filterVal = 'all', query = '') {
        const grid = document.getElementById('serversViewGrid');
        if (!grid) return;

        grid.innerHTML = '';
        const filtered = window.state.servers.filter(srv => {
            const matchesFilter = filterVal === 'all' || srv.status === filterVal;
            const matchesQuery = query === '' || 
                srv.name.toLowerCase().includes(query.toLowerCase()) || 
                srv.region.toLowerCase().includes(query.toLowerCase()) || 
                srv.ip.includes(query);
            return matchesFilter && matchesQuery;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No servers match your criteria.</div>`;
            return;
        }

        filtered.forEach(srv => {
            const card = document.createElement('div');
            card.className = 'server-card';
            card.id = srv.id;

            const isOnline = srv.status === 'online';
            const isWarning = srv.status === 'warning';
            const isOffline = srv.status === 'offline';
            
            const badgeClass = isOnline ? 'status-online' : isWarning ? 'status-warning' : 'status-offline';
            const badgeLabel = isOnline ? 'Online' : isWarning ? 'High Load' : 'Offline';
            const dotClass = isOnline ? 'uptime-online' : isWarning ? 'uptime-warning' : 'uptime-offline';
            const fillClass = isOnline ? 'fill-blue' : isWarning ? 'fill-warning' : 'fill-danger';

            card.innerHTML = `
                <div class="server-card-header">
                    <div class="server-card-identity">
                        <div class="server-uptime-indicator">
                            <span class="uptime-dot ${dotClass}"></span>
                            ${isOnline ? '<span class="uptime-pulse-ring"></span>' : ''}
                        </div>
                        <div>
                            <h3 class="server-name">${srv.name}</h3>
                            <div class="server-region">
                                <i data-lucide="map-pin"></i>
                                <span>${srv.region} &mdash; ${srv.type} (${srv.ip})</span>
                            </div>
                        </div>
                    </div>
                    <span class="server-status-badge ${badgeClass}">${badgeLabel}</span>
                </div>

                <div class="server-metrics">
                    <div class="server-metric-row">
                        <div class="server-metric-label-row">
                            <span class="server-metric-label">CPU</span>
                            <span class="server-metric-value ${isWarning ? 'text-warning' : ''}">${srv.cpu}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill ${fillClass}" style="width: ${srv.cpu}%;"></div>
                        </div>
                    </div>
                    <div class="server-metric-row">
                        <div class="server-metric-label-row">
                            <span class="server-metric-label">RAM</span>
                            <span class="server-metric-value ${isWarning ? 'text-warning' : ''}">${srv.ram}%</span>
                        </div>
                        <div class="progress-track">
                            <div class="progress-fill ${fillClass}" style="width: ${srv.ram}%;"></div>
                        </div>
                    </div>
                </div>

                <div class="server-uptime-row">
                    <i data-lucide="clock" class="server-uptime-icon"></i>
                    <span class="server-uptime-label">Uptime: <strong>${srv.history}</strong> &mdash; ${srv.uptime}</span>
                </div>

                <div class="server-actions">
                    <button class="btn btn-secondary btn-sm server-btn" aria-label="Deploy ${srv.name}" ${isOffline ? 'disabled' : ''}>
                        <i data-lucide="rocket"></i>
                        <span>Deploy</span>
                    </button>
                    <button class="btn btn-danger btn-sm server-btn" aria-label="Restart ${srv.name}">
                        <i data-lucide="rotate-ccw"></i>
                        <span>Restart</span>
                    </button>
                    <button class="btn btn-secondary btn-sm server-console-btn" data-srv-name="${srv.name}" aria-label="Console ${srv.name}">
                        <i data-lucide="terminal"></i>
                        <span>Console</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.setupServerControlListeners();
    };

    window.renderProjectsList = function() {
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        grid.innerHTML = '';
        window.state.projects.forEach(p => {
            const card = document.createElement('div');
            card.className = 'project-card';

            let statusClass = 'pill-completed';
            let statusLabel = 'Completed';
            if (p.status === 'running') {
                statusClass = 'pill-running';
                statusLabel = 'Building';
            } else if (p.status === 'failed') {
                statusClass = 'pill-failed';
                statusLabel = 'Failed';
            }

            card.innerHTML = `
                <div class="project-card-header">
                    <div class="project-card-title-group">
                        <span class="project-card-name">${p.name}</span>
                        <span class="project-card-branch">
                            <i data-lucide="git-branch" style="width: 12px; height: 12px;"></i>
                            <span>${p.branch}</span>
                        </span>
                    </div>
                    <span class="status-pill ${statusClass}">${statusLabel}</span>
                </div>
                <div class="project-card-commit">
                    <strong>${p.hash}</strong> &mdash; ${p.commit}
                </div>
                <div class="project-card-footer">
                    <span class="project-card-meta">Updated ${p.time}</span>
                    <button class="btn btn-secondary btn-sm project-build-btn" data-project-name="${p.name}">
                        <i data-lucide="play" style="width: 12px; height: 12px; margin-right: 4px;"></i>
                        <span>Trigger Build</span>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
        window.setupProjectBuildListeners();
    };

    window.renderTeamList = function() {
        const tbody = document.getElementById('teamViewTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        window.state.team.forEach(m => {
            const tr = document.createElement('tr');
            tr.className = 'table-row';

            const statusDot = m.status === 'online-dot' ? 'status-online-dot' : m.status === 'away-dot' ? 'status-away-dot' : 'status-offline-dot';
            const statusText = m.status === 'online-dot' ? 'Online' : m.status === 'away-dot' ? 'Away' : 'Offline';
            const statusLabelClass = m.status === 'online-dot' ? 'pill-completed' : m.status === 'away-dot' ? 'pill-running' : 'pill-failed';

            tr.innerHTML = `
                <td>
                    <div class="task-cell">
                        <div style="position: relative;">
                            <img src="${m.avatar}" alt="${m.name}" class="timeline-avatar" style="width: 28px; height: 28px;">
                            <span class="team-status-dot ${statusDot}" style="top: -2px; right: -2px; border: 1.5px solid var(--bg-card); width: 8px; height: 8px;"></span>
                        </div>
                        <span class="task-name" style="font-weight: 600;">${m.name}</span>
                    </div>
                </td>
                <td><span style="color: var(--text-secondary); font-size: 0.875rem;">${m.email}</span></td>
                <td><span class="project-tag">${m.role}</span></td>
                <td><span class="status-pill ${statusLabelClass}">${statusText}</span></td>
                <td>
                    <button class="row-action-btn remove-team-btn" data-email="${m.email}" aria-label="Remove member" style="color: var(--color-danger);">
                        <i data-lucide="trash-2"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Setup remove actions
        document.querySelectorAll('.remove-team-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const email = btn.dataset.email;
                if (email === 'alex.rivera@cloudscale.io') {
                    showToast('Cannot remove system administrator!', 'error');
                    return;
                }
                window.state.team = window.state.team.filter(m => m.email !== email);
                setStore('team', window.state.team);
                renderTeamList();
                showToast(`Team member removed.`, 'info');
            });
        });
    };

    window.renderBillingInvoices = function() {
        const tbody = document.getElementById('invoicesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        window.state.invoices.forEach(inv => {
            const tr = document.createElement('tr');
            tr.className = 'table-row';
            tr.innerHTML = `
                <td><span style="font-family: monospace; font-weight: 600;">${inv.id}</span></td>
                <td><span style="color: var(--text-secondary); font-size: 0.875rem;">${inv.date}</span></td>
                <td><span style="font-weight: 600;">${inv.amount}</span></td>
                <td><span class="status-pill pill-completed">${inv.status}</span></td>
                <td>
                    <button class="row-action-btn invoice-dl-btn" data-inv-id="${inv.id}" aria-label="Download Invoice">
                        <i data-lucide="download"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
        document.querySelectorAll('.invoice-dl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast(`Downloading PDF for ${btn.dataset.invId}...`, 'info');
            });
        });
    };

    // =========================================================================
    // SPA CLIENT ROUTER
    // =========================================================================
    function handleRoute() {
        let hash = window.location.hash || '#dashboard';
        
        // Redirect #team hash to #users mapping
        if (hash === '#team') {
            hash = '#users';
            window.location.hash = '#users';
        }
        
        const viewId = `view-${hash.substring(1)}`;
        
        // Hide all views
        document.querySelectorAll('.app-view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show target view
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.add('active');
        } else {
            const fallback = document.getElementById('view-dashboard');
            if (fallback) fallback.classList.add('active');
        }
        
        // Sync Sidebar Navigation states
        document.querySelectorAll('.nav-link').forEach(link => {
            const targetHash = link.id.replace('nav-', '');
            if (`#${targetHash}` === hash || (hash === '#dashboard' && targetHash === 'dashboard')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Sync Top Breadcrumbs
        const breadcrumbActive = document.querySelector('.breadcrumb-container .breadcrumb-item.active');
        if (breadcrumbActive) {
            let viewName = hash.substring(1);
            if (viewName === 'users') viewName = 'Team';
            else if (viewName === 'help') viewName = 'Help Center';
            else if (viewName) viewName = viewName.charAt(0).toUpperCase() + viewName.slice(1);
            else viewName = 'Dashboard';
            breadcrumbActive.textContent = viewName;
        }

        // Initialize view specific layouts or charts
        if (hash === '#analytics') {
            initAnalyticsCharts();
        } else if (hash === '#servers') {
            renderServersList();
        } else if (hash === '#projects') {
            renderProjectsList();
        } else if (hash === '#users') {
            renderTeamList();
        } else if (hash === '#billing') {
            renderBillingInvoices();
        }
    }

    // Bind route events
    window.addEventListener('hashchange', handleRoute);
    
    // Intercept navbar link clicks to set Hash
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.id.replace('nav-', '');
            window.location.hash = `#${viewName}`;
            
            // On mobile, close sidebar drawer after navigating
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });

    // Run router on load
    handleRoute();

    // =========================================================================
    // ANALYTICS VIEW CHART INITIALIZATION
    // =========================================================================
    let responseChartInst = null;
    let trafficChartInst = null;

    function initAnalyticsCharts() {
        const respCanvas = document.getElementById('responseTimeChart');
        const trafCanvas = document.getElementById('trafficDistributionChart');

        if (respCanvas && typeof Chart !== 'undefined' && !responseChartInst) {
            const ctx = respCanvas.getContext('2d');
            
            const grad = ctx.createLinearGradient(0, 0, 0, 200);
            grad.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
            grad.addColorStop(1, 'rgba(59, 130, 246, 0)');

            responseChartInst = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
                    datasets: [{
                        label: 'P90 Latency (ms)',
                        data: [210, 230, 195, 280, 245, 190, 220],
                        borderColor: '#3B82F6',
                        backgroundColor: grad,
                        borderWidth: 2.5,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: 'rgba(255,255,255,0.04)' } },
                        y: { min: 100, max: 400, grid: { color: 'rgba(255,255,255,0.04)' } }
                    }
                }
            });
        }

        if (trafCanvas && typeof Chart !== 'undefined' && !trafficChartInst) {
            const ctx = trafCanvas.getContext('2d');
            trafficChartInst = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['/auth', '/users', '/billing', '/telemetry', '/assets'],
                    datasets: [{
                        label: 'Requests (Thousands)',
                        data: [320, 180, 95, 640, 480],
                        backgroundColor: '#8B5CF6',
                        borderRadius: 6,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: 'rgba(255,255,255,0.04)' } }
                    }
                }
            });
        }
    }

    // =========================================================================
    // MODALS & FORMS BINDINGS
    // =========================================================================
    setupModals();

    function setupModals() {
        const newServerModal = document.getElementById('newServerModal');
        const inviteModal = document.getElementById('inviteMemberModal');

        const addBtns = [
            document.getElementById('addServerBtnMain'),
            document.querySelector('.dashboard-actions button.btn-primary') // Also wire Welcome Header "New Server"
        ];
        
        const inviteBtn = document.getElementById('inviteMemberBtnMain');

        addBtns.forEach(btn => {
            if (btn && newServerModal) {
                btn.addEventListener('click', () => {
                    newServerModal.classList.add('open');
                    newServerModal.setAttribute('aria-hidden', 'false');
                });
            }
        });
        
        if (inviteBtn && inviteModal) {
            inviteBtn.addEventListener('click', () => {
                inviteModal.classList.add('open');
                inviteModal.setAttribute('aria-hidden', 'false');
            });
        }

        document.querySelectorAll('.modal-close-btn, [id*="cancel"]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modal-overlay').forEach(m => {
                    m.classList.remove('open');
                    m.setAttribute('aria-hidden', 'true');
                });
            });
        });

        document.querySelectorAll('.modal-overlay').forEach(m => {
            m.addEventListener('click', (e) => {
                if (e.target === m) {
                    m.classList.remove('open');
                    m.setAttribute('aria-hidden', 'true');
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay').forEach(m => {
                    m.classList.remove('open');
                    m.setAttribute('aria-hidden', 'true');
                });
            }
        });

        // Form Submit: New Server
        const newServerForm = document.getElementById('newServerForm');
        if (newServerForm) {
            newServerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('serverNameInput').value.trim();
                const region = document.getElementById('serverRegionInput').value;
                const type = document.getElementById('serverTypeInput').value;

                if (!name) return;

                const newServer = {
                    id: `server-${Date.now()}`,
                    name: name,
                    region: region,
                    type: type,
                    ip: `10.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
                    cpu: 15,
                    ram: 28,
                    uptime: '1 day',
                    status: 'online',
                    history: '100%'
                };

                window.state.servers.push(newServer);
                setStore('servers', window.state.servers);
                
                // Add success log to global logs console if open
                const logTerminal = document.getElementById('globalLogsTerminal');
                if (logTerminal) {
                    const time = new Date().toTimeString().split(' ')[0];
                    logTerminal.innerHTML += `<div class="terminal-line"><span class="terminal-time">[${time}]</span> <span class="text-success">[INFO]</span> Provisioning successful: ${name} (${region}).</div>`;
                }

                if (window.location.hash === '#servers') {
                    renderServersList();
                }

                newServerForm.reset();
                newServerModal.classList.remove('open');
                showToast(`Server ${name} provisioned successfully!`, 'success');
            });
        }

        // Form Submit: Invite Member
        const inviteForm = document.getElementById('inviteMemberForm');
        if (inviteForm && inviteModal) {
            inviteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('memberNameInput').value.trim();
                const email = document.getElementById('memberEmailInput').value.trim();
                const role = document.getElementById('memberRoleInput').value;

                if (!name || !email) return;

                const newMember = {
                    name: name,
                    email: email,
                    role: role,
                    status: 'online-dot',
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80&auto=format&fit=crop'
                };

                window.state.team.push(newMember);
                setStore('team', window.state.team);
                
                if (window.location.hash === '#users') {
                    renderTeamList();
                }

                inviteForm.reset();
                inviteModal.classList.remove('open');
                showToast(`Invitation sent to ${email}`, 'success');
            });
        }

        // Form Submit: Settings Profile
        const profileForm = document.getElementById('profileSettingsForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('profileName').value.trim();
                const email = document.getElementById('profileEmail').value.trim();
                const avatar = document.getElementById('profileAvatar').value.trim();

                if (!name || !email) return;

                window.state.profile = { name, email, avatar };
                setStore('profile', window.state.profile);
                syncProfileDetails();

                showToast('Profile settings saved!', 'success');
            });
        }

        // Form Submit: Notifications Form
        const notifForm = document.getElementById('notificationSettingsForm');
        if (notifForm) {
            notifForm.addEventListener('submit', (e) => {
                e.preventDefault();
                showToast('Notification preferences updated!', 'success');
            });
        }

        // Form Submit: Support Ticket
        const supportForm = document.getElementById('supportTicketForm');
        if (supportForm) {
            supportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const subject = document.getElementById('ticketSubject').value.trim();
                if (!subject) return;

                supportForm.reset();
                showToast('Support ticket filed successfully!', 'success');
            });
        }

        // Settings Tabs navigation
        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const tab = btn.dataset.settingsTab;
                document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
                const targetPanel = document.getElementById(`settings-panel-${tab}`);
                if (targetPanel) targetPanel.classList.add('active');
            });
        });

        // API Credentials Actions
        const apiKeyVal = document.getElementById('apiKeyVal');
        const toggleApiKeyBtn = document.getElementById('toggleApiKeyBtn');
        const copyApiKeyBtn = document.getElementById('copyApiKeyBtn');
        const regenerateApiKeyBtn = document.getElementById('regenerateApiKeyBtn');

        if (toggleApiKeyBtn && apiKeyVal) {
            toggleApiKeyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const isPass = apiKeyVal.type === 'password';
                apiKeyVal.type = isPass ? 'text' : 'password';
                toggleApiKeyBtn.innerHTML = isPass ? '<i data-lucide="eye-off"></i>' : '<i data-lucide="eye"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            });
        }

        if (copyApiKeyBtn && apiKeyVal) {
            copyApiKeyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(apiKeyVal.value).then(() => {
                    showToast('API Key copied to clipboard!', 'info');
                });
            });
        }

        if (regenerateApiKeyBtn && apiKeyVal) {
            regenerateApiKeyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const randomHex = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
                apiKeyVal.value = `sk_live_${randomHex}`;
                showToast('API Key regenerated!', 'success');
            });
        }

        // FAQ accordion trigger
        document.querySelectorAll('.faq-trigger').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const item = trigger.closest('.faq-item');
                const isOpen = item.classList.contains('active');

                document.querySelectorAll('.faq-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.faq-panel').style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('active');
                    const panel = item.querySelector('.faq-panel');
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                }
            });
        });
    }

    // =========================================================================
    // PERFORMANCE ANALYTICS CHART (Chart.js)
    // =========================================================================
    const chartDatasets = {
        day: {
            labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
            cpu: [28, 22, 18, 24, 38, 55, 62, 48, 42, 50, 44, 36, 30],
            memory: [45, 42, 40, 44, 55, 68, 75, 70, 61, 65, 60, 55, 50],
        },
        week: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            cpu: [44, 52, 61, 48, 55, 38, 30],
            memory: [60, 65, 72, 68, 70, 55, 48],
        },
        month: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            cpu: [50, 58, 47, 52],
            memory: [64, 70, 62, 67],
        },
    };

    const canvasEl = document.getElementById('performanceChart');

    if (canvasEl && typeof Chart !== 'undefined') {
        const ctx = canvasEl.getContext('2d');

        function buildGradient(color) {
            const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 300);
            grad.addColorStop(0, color.replace('OPACITY', '0.25'));
            grad.addColorStop(1, color.replace('OPACITY', '0'));
            return grad;
        }

        Chart.defaults.color = '#94A3B8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

        let activePeriod = 'day';
        const initial = chartDatasets[activePeriod];

        const performanceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: initial.labels,
                datasets: [
                    {
                        label: 'CPU Usage',
                        data: initial.cpu,
                        borderColor: '#3B82F6',
                        backgroundColor: buildGradient('rgba(59,130,246,OPACITY)'),
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#1E293B',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                        tension: 0.45,
                        fill: true,
                    },
                    {
                        label: 'Memory Usage',
                        data: initial.memory,
                        borderColor: '#8B5CF6',
                        backgroundColor: buildGradient('rgba(139,92,246,OPACITY)'),
                        borderWidth: 2.5,
                        pointRadius: 4,
                        pointBackgroundColor: '#8B5CF6',
                        pointBorderColor: '#1E293B',
                        pointBorderWidth: 2,
                        pointHoverRadius: 6,
                        tension: 0.45,
                        fill: true,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1E293B',
                        borderColor: 'rgba(255,255,255,0.08)',
                        borderWidth: 1,
                        padding: 12,
                        titleColor: '#FFFFFF',
                        bodyColor: '#94A3B8',
                        titleFont: { size: 12, weight: '700' },
                        bodyFont: { size: 12 },
                        callbacks: {
                            label(ctx) {
                                return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255,255,255,0.04)',
                            drawTicks: false,
                        },
                        ticks: {
                            padding: 8,
                            font: { size: 11 },
                        },
                        border: { display: false },
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: 'rgba(255,255,255,0.04)',
                            drawTicks: false,
                        },
                        ticks: {
                            stepSize: 25,
                            padding: 10,
                            font: { size: 11 },
                            callback: (val) => val + '%',
                        },
                        border: { display: false },
                    },
                },
                animation: {
                    duration: 600,
                    easing: 'easeInOutCubic',
                },
            },
        });

        function updateChart(period) {
            const dataset = chartDatasets[period];

            performanceChart.data.labels = dataset.labels;
            performanceChart.data.datasets[0].data = dataset.cpu;
            performanceChart.data.datasets[1].data = dataset.memory;

            performanceChart.data.datasets[0].backgroundColor = buildGradient('rgba(59,130,246,OPACITY)');
            performanceChart.data.datasets[1].backgroundColor = buildGradient('rgba(139,92,246,OPACITY)');

            performanceChart.update('active');

            const cpuLast = dataset.cpu[dataset.cpu.length - 1];
            const memLast = dataset.memory[dataset.memory.length - 1];
            const cpuEl = document.getElementById('legend-cpu');
            const memEl = document.getElementById('legend-mem');
            if (cpuEl) cpuEl.textContent = cpuLast + '%';
            if (memEl) memEl.textContent = memLast + '%';
        }

        const filterBtns = document.querySelectorAll('.chart-filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activePeriod = btn.dataset.period;
                updateChart(activePeriod);
            });
        });
    }
});
