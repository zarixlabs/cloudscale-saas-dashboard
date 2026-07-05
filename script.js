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

    // Initial listener binding
    window.setupServerControlListeners();
    window.setupProjectBuildListeners();
});
