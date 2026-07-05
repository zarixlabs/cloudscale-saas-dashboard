/**
 * CloudScale SaaS Dashboard — script.js
 * Extended interactive layer: dropdowns, micro-animations, button feedback,
 * table filtering, ripple effects, server deployments, log terminals, and global search.
 * Runs after app.js and Chart.js.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. Activity Filter Dropdown
    //    Opens/closes via the "Filter" button.
    //    Filters table rows by data-status attribute.
    // =========================================================================

    const filterBtn = document.getElementById('activityFilterBtn');
    const dropdown = document.getElementById('activityDropdown');
    const tableRows = document.querySelectorAll('#activitiesTableBody .table-row');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    function toggleDropdown(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        filterBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    function closeDropdownOutside(e) {
        if (filterBtn && !filterBtn.contains(e.target)) {
            dropdown.classList.remove('open');
            filterBtn.setAttribute('aria-expanded', 'false');
        }
    }

    function filterTable(filter) {
        tableRows.forEach(row => {
            const status = row.dataset.status;
            const visible = filter === 'all' || status === filter;
            row.classList.toggle('hidden', !visible);

            if (visible) {
                row.style.animationDelay = '0ms';
                row.style.animation = 'none';
                void row.offsetWidth;
                row.style.animation = 'rowFadeIn 0.25s ease forwards';
            }
        });
    }

    if (filterBtn && dropdown) {
        filterBtn.addEventListener('click', toggleDropdown);
        document.addEventListener('click', closeDropdownOutside);

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                filterBtn.setAttribute('aria-expanded', 'false');
            }
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', e => {
                e.stopPropagation();

                dropdownItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                filterTable(item.dataset.filter);

                dropdown.classList.remove('open');
                filterBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // =========================================================================
    // 2. Ripple Effect on Buttons
    // =========================================================================
    function createRipple(e) {
        const button = e.currentTarget;

        button.querySelectorAll('.ripple').forEach(r => r.remove());

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255,255,255,0.12);
            transform: scale(0);
            animation: rippleAnim 0.5s linear forwards;
            pointer-events: none;
        `;

        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    }

    document.querySelectorAll('.btn, .row-action-btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });

    if (!document.getElementById('rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = `
            @keyframes rippleAnim {
                to { transform: scale(1); opacity: 0; }
            }
            @keyframes rowFadeIn {
                from { opacity: 0; transform: translateY(4px); }
                to   { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // 3. Row Action Button Tooltip (row chevron ">")
    // =========================================================================
    document.querySelectorAll('.row-action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('.table-row');
            if (!row) return;

            row.style.transition = 'background-color 0.1s ease';
            row.style.backgroundColor = 'rgba(99,102,241,0.06)';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 600);
        });
    });

    // =========================================================================
    // 4. Notification Bell Badge Clear
    // =========================================================================
    const notifBtn = document.getElementById('notificationBtn');
    const notifBadge = notifBtn ? notifBtn.querySelector('.notification-badge') : null;

    if (notifBtn && notifBadge) {
        notifBtn.addEventListener('click', () => {
            notifBadge.style.transition = 'opacity 0.3s, transform 0.3s';
            notifBadge.style.opacity = '0';
            notifBadge.style.transform = 'scale(0)';
            setTimeout(() => notifBadge.remove(), 300);
        });
    }

    // =========================================================================
    // 5. Logout Button Confirmation
    // =========================================================================
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            this.style.color = 'var(--color-danger)';
            this.style.opacity = '0.6';
            this.title = 'Signing out…';
            setTimeout(() => {
                this.style.opacity = '1';
                this.title = '';
            }, 1500);
        });
    }

    // =========================================================================
    // 6. Team Member Card — Hover Tilt Micro-animation
    // =========================================================================
    document.querySelectorAll('.team-member-card').forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = (e.clientX - cx) / (rect.width / 2);
            const dy = (e.clientY - cy) / (rect.height / 2);
            const rotX = (-dy * 6).toFixed(2);
            const rotY = (dx * 6).toFixed(2);

            this.style.transform = `translateY(-2px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            this.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform = '';
            this.style.transition = 'transform 0.3s ease';
        });
    });

    // =========================================================================
    // 7. Chart Filter Tabs — Add ARIA pressed state
    // =========================================================================
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const siblingGroup = this.parentElement;
            if (siblingGroup) {
                siblingGroup.querySelectorAll('.chart-filter-btn').forEach(b => {
                    b.setAttribute('aria-pressed', 'false');
                });
            }
            this.setAttribute('aria-pressed', 'true');
        });

        if (btn.classList.contains('active')) {
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // =========================================================================
    // 8. Metric Cards — Count-up animation on load
    // =========================================================================
    function animateCounter(el, rawText, duration = 900) {
        const prefix = rawText.match(/^[^0-9]*/)?.[0] ?? '';
        const numStr = rawText.replace(/[^0-9.]/g, '');
        const target = parseFloat(numStr);
        // Find the suffix by locating the end of the numeric portion in rawText
        // We scan from prefix.length, skip past any digit/comma/dot chars
        let scanIdx = prefix.length;
        while (scanIdx < rawText.length && /[0-9,.]/.test(rawText[scanIdx])) scanIdx++;
        const suffix = rawText.slice(scanIdx);

        if (isNaN(target)) return;

        const isFloat = numStr.includes('.');
        const decimalPart = numStr.split('.')[1];
        const precision = decimalPart ? decimalPart.length : 0;
        const hasCommas = rawText.includes(',');
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;

            let display = isFloat ? current.toFixed(precision) : Math.floor(current).toString();
            if (hasCommas) {
                display = parseFloat(display).toLocaleString('en-US');
            }

            el.textContent = prefix + display + suffix;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                const finalDisplay = hasCommas
                    ? target.toLocaleString('en-US')
                    : (isFloat ? target.toFixed(precision) : target.toString());
                el.textContent = prefix + finalDisplay + suffix;
            }
        }

        requestAnimationFrame(step);
    }

    document.querySelectorAll('.metric-value').forEach(el => {
        const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (!textNode) return;
        const original = textNode.textContent.trim();
        if (!original || !/[0-9]/.test(original)) return;

        textNode.textContent = '0';
        setTimeout(() => {
            animateCounter({
                get textContent() { return textNode.textContent; },
                set textContent(v) { textNode.textContent = v; }
            }, original, 900);
        }, 100);
    });

    // =========================================================================
    // 9. SEARCH FILTERING
    // =========================================================================
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            // Filter Activities logs rows
            document.querySelectorAll('#activitiesTableBody .table-row').forEach(row => {
                const taskName = row.querySelector('.task-name')?.textContent.toLowerCase() || '';
                const projectTag = row.querySelector('.project-tag')?.textContent.toLowerCase() || '';
                const visible = taskName.includes(query) || projectTag.includes(query);
                row.classList.toggle('hidden', !visible);
            });

            // Filter servers if active
            if (window.location.hash === '#servers') {
                const activeFilterBtn = document.querySelector('#serverFilterGroup .chart-filter-btn.active');
                const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.serverFilter : 'all';
                window.renderServersList(activeFilter, query);
            }
        });
    }

    // =========================================================================
    // 10. INFRASTRUCTURE REFRESH SIMULATION
    // =========================================================================
    const refreshBtn = document.querySelector('.section-header-row button.btn-secondary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.style.transition = 'transform 0.8s ease';
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transform = '';
                    icon.style.transition = 'none';
                }, 800);
            }

            window.state.servers.forEach(srv => {
                if (srv.status !== 'offline') {
                    srv.cpu = Math.floor(Math.random() * 50) + 15;
                    srv.ram = Math.floor(Math.random() * 40) + 40;
                    if (srv.cpu > 80) srv.status = 'warning';
                    else srv.status = 'online';
                }
            });
            localStorage.setItem('cloudscale_servers', JSON.stringify(window.state.servers));

            if (window.location.hash === '#servers') {
                const activeFilterBtn = document.querySelector('#serverFilterGroup .chart-filter-btn.active');
                const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.serverFilter : 'all';
                const query = document.getElementById('serversViewSearch')?.value || '';
                window.renderServersList(activeFilter, query);
            }

            document.querySelectorAll('.infra-grid .server-card').forEach(card => {
                const srvId = card.id;
                const stateSrv = window.state.servers.find(s => s.id === srvId);
                if (stateSrv) {
                    const cpuVal = card.querySelector('.server-metric-row:nth-child(1) .server-metric-value');
                    const cpuFill = card.querySelector('.server-metric-row:nth-child(1) .progress-fill');
                    const ramVal = card.querySelector('.server-metric-row:nth-child(2) .server-metric-value');
                    const ramFill = card.querySelector('.server-metric-row:nth-child(2) .progress-fill');

                    if (cpuVal) cpuVal.textContent = `${stateSrv.cpu}%`;
                    if (cpuFill) cpuFill.style.width = `${stateSrv.cpu}%`;
                    if (ramVal) ramVal.textContent = `${stateSrv.ram}%`;
                    if (ramFill) ramFill.style.width = `${stateSrv.ram}%`;
                }
            });

            window.showToast('Infrastructure status refreshed!', 'info');
        });
    }

    // =========================================================================
    // 11. SERVER CONTROL AND TERMINAL LOGS DRAWER
    // =========================================================================
    const consoleDrawer = document.getElementById('serverTerminalDrawer');
    let logInterval = null;

    function runConsoleLogs(serverName) {
        const terminalBody = document.getElementById('serverTerminalBody');
        if (!terminalBody) return;

        terminalBody.innerHTML = '';
        const lines = [
            'Connecting to host via SSH-RSA...',
            'Access granted. Initializing shell session...',
            'Loading Linux kernel modules...',
            'Mounting root device /dev/sda1 (ext4)...',
            'Configuring loopback interface...',
            'Starting system telemetry monitoring service...',
            'Checking CPU cache registers... OK',
            'Allocating system memory buffer... OK',
            'Binding daemon to TCP port 8000...',
            'Server initialization sequence complete. Status: ONLINE.'
        ];

        let index = 0;
        if (logInterval) clearInterval(logInterval);

        logInterval = setInterval(() => {
            if (index < lines.length) {
                const time = new Date().toTimeString().split(' ')[0];
                terminalBody.innerHTML += `<div class="terminal-line"><span class="terminal-time">[${time}]</span> ${lines[index]}</div>`;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                index++;
            } else {
                clearInterval(logInterval);
            }
        }, 400);
    }

    const closeTerminalBtn = document.getElementById('closeTerminalDrawerBtn');
    if (closeTerminalBtn && consoleDrawer) {
        closeTerminalBtn.addEventListener('click', () => {
            consoleDrawer.style.display = 'none';
            if (logInterval) clearInterval(logInterval);
        });
    }

    window.setupServerControlListeners = function () {
        document.querySelectorAll('.infra-grid .server-card').forEach(card => {
            const srvId = card.id;
            const srv = window.state.servers.find(s => s.id === srvId);
            if (!srv) return;

            const deployBtn = card.querySelector('.server-btn:nth-child(1)');
            const restartBtn = card.querySelector('.server-btn:nth-child(2)');
            const consoleBtn = card.querySelector('.server-console-btn');

            if (deployBtn) {
                deployBtn.addEventListener('click', () => {
                    deployBtn.disabled = true;
                    if (restartBtn) restartBtn.disabled = true;

                    const badge = card.querySelector('.server-status-badge');
                    if (badge) {
                        badge.textContent = 'Deploying...';
                        badge.className = 'server-status-badge status-warning';
                    }

                    window.showToast(`Queued build release for ${srv.name}...`, 'info');

                    const cpuVal = card.querySelector('.server-metric-row:nth-child(1) .server-metric-value');
                    const cpuFill = card.querySelector('.server-metric-row:nth-child(1) .progress-fill');
                    if (cpuVal) cpuVal.textContent = '95%';
                    if (cpuFill) cpuFill.style.width = '95%';

                    setTimeout(() => {
                        srv.cpu = Math.floor(Math.random() * 30) + 20;
                        srv.ram = Math.floor(Math.random() * 20) + 50;
                        srv.status = 'online';
                        srv.history = '99.99%';
                        localStorage.setItem('cloudscale_servers', JSON.stringify(window.state.servers));

                        const query = document.getElementById('serversViewSearch')?.value || '';
                        const filterVal = document.querySelector('#serverFilterGroup .chart-filter-btn.active')?.dataset.serverFilter || 'all';
                        window.renderServersList(filterVal, query);

                        window.showToast(`Server ${srv.name} deployed successfully!`, 'success');
                    }, 2500);
                });
            }

            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    restartBtn.disabled = true;
                    if (deployBtn) deployBtn.disabled = true;

                    const badge = card.querySelector('.server-status-badge');
                    if (badge) {
                        badge.textContent = 'Rebooting...';
                        badge.className = 'server-status-badge status-offline';
                    }

                    window.showToast(`Sending reboot signal to ${srv.name}...`, 'info');

                    const cpuVal = card.querySelector('.server-metric-row:nth-child(1) .server-metric-value');
                    const cpuFill = card.querySelector('.server-metric-row:nth-child(1) .progress-fill');
                    const ramVal = card.querySelector('.server-metric-row:nth-child(2) .server-metric-value');
                    const ramFill = card.querySelector('.server-metric-row:nth-child(2) .progress-fill');
                    if (cpuVal) cpuVal.textContent = '0%';
                    if (cpuFill) cpuFill.style.width = '0%';
                    if (ramVal) ramVal.textContent = '0%';
                    if (ramFill) ramFill.style.width = '0%';

                    setTimeout(() => {
                        srv.cpu = 15;
                        srv.ram = 30;
                        srv.status = 'online';
                        localStorage.setItem('cloudscale_servers', JSON.stringify(window.state.servers));

                        const query = document.getElementById('serversViewSearch')?.value || '';
                        const filterVal = document.querySelector('#serverFilterGroup .chart-filter-btn.active')?.dataset.serverFilter || 'all';
                        window.renderServersList(filterVal, query);

                        window.showToast(`Server ${srv.name} restarted successfully!`, 'success');
                    }, 3000);
                });
            }

            if (consoleBtn && consoleDrawer) {
                consoleBtn.addEventListener('click', () => {
                    consoleDrawer.style.display = 'block';
                    const serverTitle = document.getElementById('terminalDrawerServerName');
                    if (serverTitle) serverTitle.textContent = srv.name;
                    runConsoleLogs(srv.name);
                });
            }
        });
    };

    // =========================================================================
    // 12. PROJECT BUILD TRIGGER ACTIONS
    // =========================================================================
    window.setupProjectBuildListeners = function () {
        document.querySelectorAll('.project-build-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const projName = btn.dataset.projectName;
                const project = window.state.projects.find(p => p.name === projName);
                if (!project) return;

                project.status = 'running';
                project.time = 'Just now';
                localStorage.setItem('cloudscale_projects', JSON.stringify(window.state.projects));
                window.renderProjectsList();
                window.showToast(`Build triggered for ${projName}...`, 'info');

                setTimeout(() => {
                    const isSuccess = Math.random() > 0.15;
                    project.status = isSuccess ? 'completed' : 'failed';
                    project.hash = Math.floor(Math.random() * 16777215).toString(16);
                    project.commit = isSuccess ? 'Perf: Optimized asset loading' : 'Error: Build failed in unit tests';
                    localStorage.setItem('cloudscale_projects', JSON.stringify(window.state.projects));
                    window.renderProjectsList();

                    if (isSuccess) {
                        window.showToast(`Build for ${projName} completed successfully!`, 'success');
                    } else {
                        window.showToast(`Build for ${projName} failed!`, 'error');
                    }
                }, 3500);
            });
        });
    };

    // =========================================================================
    // 13. WORKSPACE, NOTIFICATIONS, PROFILE DROPDOWNS
    // =========================================================================
    function setupTopNavDropdowns() {
        const workspaceBtn = document.getElementById('workspaceSwitcherBtn');
        const workspaceDropdown = document.getElementById('workspaceDropdown');
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationDropdown = document.getElementById('notificationDropdown');
        const topAvatarBtn = document.getElementById('topAvatarBtn');
        const profileDropdown = document.getElementById('profileDropdown');

        function closeAll() {
            if (workspaceDropdown) workspaceDropdown.style.display = 'none';
            if (notificationDropdown) notificationDropdown.style.display = 'none';
            if (profileDropdown) profileDropdown.style.display = 'none';
        }

        if (workspaceBtn && workspaceDropdown) {
            workspaceBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isShown = workspaceDropdown.style.display === 'block';
                closeAll();
                workspaceDropdown.style.display = isShown ? 'none' : 'block';
            });
        }

        if (notificationBtn && notificationDropdown) {
            notificationBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isShown = notificationDropdown.style.display === 'block';
                closeAll();
                notificationDropdown.style.display = isShown ? 'none' : 'block';
            });
        }

        if (topAvatarBtn && profileDropdown) {
            topAvatarBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isShown = profileDropdown.style.display === 'block';
                closeAll();
                profileDropdown.style.display = isShown ? 'none' : 'block';
            });
        }

        document.addEventListener('click', () => {
            closeAll();
        });

        // Clear all notifications
        const clearNotificationsBtn = document.getElementById('clearAllNotificationsBtn');
        const notificationsList = document.getElementById('notificationsList');
        const badge = document.querySelector('#notificationBtn .notification-badge');
        if (clearNotificationsBtn && notificationsList) {
            clearNotificationsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationsList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-secondary); font-size: 0.8125rem;">No new notifications</div>';
                if (badge) badge.style.display = 'none';
                window.showToast('Notifications cleared', 'success');
            });
        }
    }
    setupTopNavDropdowns();

    // =========================================================================
    // 14. THEME TOGGLE
    // =========================================================================
    function setupThemeToggle() {
        const toggleBtn = document.getElementById('themeToggleBtn');
        const sunIcon = document.getElementById('themeToggleIconSun');
        const moonIcon = document.getElementById('themeToggleIconMoon');
        if (!toggleBtn) return;

        // Check local storage or default to dark
        let currentTheme = localStorage.getItem('cloudscale_theme') || 'dark';
        applyTheme(currentTheme);

        toggleBtn.addEventListener('click', () => {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme);
            localStorage.setItem('cloudscale_theme', currentTheme);
            window.showToast(`Switched to ${currentTheme} theme`, 'success');
        });

        function applyTheme(theme) {
            if (theme === 'light') {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
                // Override root colors for light mode dynamically
                document.documentElement.style.setProperty('--bg-primary', '#F1F5F9');
                document.documentElement.style.setProperty('--bg-sidebar', '#FFFFFF');
                document.documentElement.style.setProperty('--bg-card', '#FFFFFF');
                document.documentElement.style.setProperty('--text-primary', '#0F172A');
                document.documentElement.style.setProperty('--text-secondary', '#475569');
                document.documentElement.style.setProperty('--border-color', 'rgba(15, 23, 42, 0.08)');
            } else {
                document.body.classList.remove('light-theme');
                document.body.classList.add('dark-theme');
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
                // Restore dark mode values
                document.documentElement.style.setProperty('--bg-primary', '#08090F');
                document.documentElement.style.setProperty('--bg-sidebar', '#111827');
                document.documentElement.style.setProperty('--bg-card', '#131826');
                document.documentElement.style.setProperty('--text-primary', '#F8FAFC');
                document.documentElement.style.setProperty('--text-secondary', '#94A3B8');
                document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.06)');
            }
        }
    }
    setupThemeToggle();

    // =========================================================================
    // 15. COMMAND PALETTE
    // =========================================================================
    function setupCommandPalette() {
        const palette = document.getElementById('commandPalette');
        const paletteInput = document.getElementById('commandPaletteInput');
        const globalSearchContainer = document.getElementById('globalSearchContainer');

        if (!palette) return;

        function openPalette() {
            palette.style.display = 'flex';
            paletteInput.value = '';
            paletteInput.focus();
            filterCommands('');
        }

        function closePalette() {
            palette.style.display = 'none';
        }

        if (globalSearchContainer) {
            globalSearchContainer.addEventListener('click', (e) => {
                e.stopPropagation();
                openPalette();
            });
        }

        // Toggle on Ctrl+K or Cmd+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (palette.style.display === 'flex') {
                    closePalette();
                } else {
                    openPalette();
                }
            } else if (e.key === 'Escape') {
                closePalette();
            }
        });

        // Close on backdrop click
        palette.addEventListener('click', (e) => {
            if (e.target === palette) {
                closePalette();
            }
        });

        // Filter items
        paletteInput.addEventListener('input', (e) => {
            filterCommands(e.target.value);
        });

        function filterCommands(query) {
            const items = palette.querySelectorAll('.command-item');
            const cleanQuery = query.toLowerCase().trim();
            let firstVisible = null;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const matches = text.includes(cleanQuery);
                item.style.display = matches ? 'flex' : 'none';
                item.classList.remove('active');
                if (matches && !firstVisible) {
                    firstVisible = item;
                }
            });

            if (firstVisible) {
                firstVisible.classList.add('active');
            }
        }

        // Trigger action on item click
        palette.querySelectorAll('.command-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                const target = item.dataset.target;

                closePalette();

                if (action === 'nav') {
                    window.location.hash = target;
                } else if (action === 'trigger') {
                    if (target === 'new-server') {
                        const modal = document.getElementById('newServerModal');
                        if (modal) modal.classList.add('open');
                    } else if (target === 'invite-member') {
                        const modal = document.getElementById('inviteMemberModal');
                        if (modal) modal.classList.add('open');
                    }
                }
            });
        });
    }
    setupCommandPalette();

    // =========================================================================
    // 16. PROJECTS SEARCH & FILTER BINDINGS
    // =========================================================================
    function setupProjectsFilters() {
        const searchInput = document.getElementById('projectsSearchInput');
        const filterDropdown = document.getElementById('projectsFilterDropdown');
        const branchFilter = document.getElementById('projectsBranchFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                if (typeof window.renderProjectsList === 'function') {
                    window.renderProjectsList();
                }
            });
        }

        if (filterDropdown) {
            filterDropdown.addEventListener('change', () => {
                if (typeof window.renderProjectsList === 'function') {
                    window.renderProjectsList();
                }
            });
        }

        if (branchFilter) {
            branchFilter.addEventListener('change', () => {
                if (typeof window.renderProjectsList === 'function') {
                    window.renderProjectsList();
                }
            });
        }

        const createProjBtn = document.getElementById('createProjectBtn');
        if (createProjBtn) {
            createProjBtn.addEventListener('click', () => {
                const name = prompt('Enter project name:');
                if (!name) return;
                const repo = prompt('Enter repository (e.g. org/repo):', `zarixlabs/${name}`);
                if (!repo) return;

                const newProj = {
                    name: name,
                    branch: 'main',
                    commit: 'Initial commit',
                    hash: Math.floor(Math.random() * 16777215).toString(16),
                    status: 'completed',
                    time: 'Just now',
                    repository: repo,
                    framework: 'React / Next.js',
                    environment: 'Production',
                    buildDuration: '45s',
                    cpu: '0%',
                    memory: '0%',
                    storage: '0.1 GB',
                    region: 'us-east-1',
                    uptime: '100%'
                };

                window.state.projects.push(newProj);
                localStorage.setItem('cloudscale_projects', JSON.stringify(window.state.projects));
                if (typeof window.renderProjectsList === 'function') {
                    window.renderProjectsList();
                }
                window.showToast(`Project ${name} created successfully!`, 'success');
            });
        }

        const addEnvVarBtn = document.getElementById('addEnvVarBtn');
        if (addEnvVarBtn) {
            addEnvVarBtn.addEventListener('click', () => {
                const key = prompt('Enter Variable Key:');
                if (!key) return;
                const val = prompt('Enter Variable Value:');
                if (!val) return;

                const list = document.querySelector('.env-vars-list');
                if (list) {
                    const row = document.createElement('div');
                    row.className = 'env-var-row';
                    row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.02); padding: 10px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-top: var(--space-2);';
                    row.innerHTML = `
                        <div style="display: flex; align-items: center; gap: var(--space-4);">
                            <span class="text-mono" style="font-weight: 700; color: var(--accent-blue);">${key}</span>
                            <span class="text-mono text-muted" style="color: var(--text-secondary);">••••••••••••••••••••••••••••••••</span>
                        </div>
                        <button class="icon-action-btn" style="background: none; border: none; color: var(--text-secondary); cursor: pointer;"><i data-lucide="eye" style="width: 16px; height: 16px;"></i></button>
                    `;
                    list.appendChild(row);
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    window.showToast(`Environment variable ${key} added`, 'success');
                }
            });
        }
    }
    setupProjectsFilters();

    // =========================================================================
    // 17. FAQ ACCORDION & SUPPORT TICKETS
    // =========================================================================
    function setupHelpCenter() {
        // FAQ Accordion
        const triggers = document.querySelectorAll('.faq-trigger');
        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const panel = trigger.nextElementSibling;
                const icon = trigger.querySelector('.faq-icon');
                const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';

                // Close all other panels
                document.querySelectorAll('.faq-panel').forEach(p => {
                    p.style.maxHeight = '0px';
                });
                document.querySelectorAll('.faq-icon').forEach(i => {
                    if (i) i.style.transform = 'rotate(0deg)';
                });

                if (!isOpen) {
                    panel.style.maxHeight = panel.scrollHeight + 'px';
                    if (icon) icon.style.transform = 'rotate(180deg)';
                } else {
                    panel.style.maxHeight = '0px';
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
        });

        // Ticket Submission
        const ticketForm = document.getElementById('supportTicketForm');
        const historyList = document.getElementById('ticketHistoryList');
        if (ticketForm && historyList) {
            ticketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const subject = document.getElementById('ticketSubject').value;
                const priority = document.getElementById('ticketPriority').value;
                const message = document.getElementById('ticketMessage').value;

                // Create new ticket element
                const ticketId = 'TC-' + Math.floor(1000 + Math.random() * 9000);
                const item = document.createElement('div');
                item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: var(--radius-sm); font-size: var(--text-xs); margin-top: var(--space-2);';
                item.innerHTML = `
                    <div>
                        <strong style="color: var(--text-primary);">${ticketId}: ${subject}</strong>
                        <span style="display: block; color: var(--text-secondary); margin-top: 2px;">Submitted just now &mdash; ${priority.toUpperCase()} severity</span>
                    </div>
                    <span class="status-pill pill-running" style="font-size: 9px; padding: 2px 6px;">Open</span>
                `;

                historyList.appendChild(item);
                ticketForm.reset();
                window.showToast(`Ticket ${ticketId} created!`, 'success');
            });
        }

        // Live Chat Button
        const chatBtn = document.getElementById('startLiveChatBtn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                window.showToast('Connecting to support engineer...', 'info');
                setTimeout(() => {
                    window.showToast('Support engineer connected in chat console.', 'success');
                }, 1500);
            });
        }
    }
    setupHelpCenter();

    // Initial listener binding
    window.setupServerControlListeners();
    window.setupProjectBuildListeners();
});
