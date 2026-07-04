/**
 * CloudScale SaaS Dashboard - Application Interaction Logic
 * Handles sidebar drawer toggling, navigation active states, and icon initialization.
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

    /**
     * Toggles the mobile drawer sidebar menu.
     */
    function toggleSidebar() {
        const isOpen = appBody.classList.toggle('sidebar-open');

        // Update accessibility attributes
        menuToggle.setAttribute('aria-expanded', isOpen);
        sidebarOverlay.setAttribute('aria-hidden', !isOpen);
    }

    /**
     * Closes the mobile drawer sidebar menu.
     */
    function closeSidebar() {
        appBody.classList.remove('sidebar-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        sidebarOverlay.setAttribute('aria-hidden', 'true');
    }

    // Event Listeners for Mobile Menu
    if (menuToggle && sidebarOverlay) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSidebar();
        });

        sidebarOverlay.addEventListener('click', closeSidebar);

        // Close sidebar if window is resized above mobile breakpoint (991px)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 991) {
                closeSidebar();
            }
        });
    }

    // Interactive Navigation Links Active States
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remove active class from all links
            navLinks.forEach(item => item.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // On mobile, close sidebar drawer after navigating
            if (window.innerWidth <= 991) {
                closeSidebar();
            }
        });
    });

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
    // Performance Analytics Chart (Chart.js)
    // =========================================================================

    /**
     * Dataset definitions keyed by time period.
     * Each entry has labels, CPU data, and Memory data.
     */
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

        /**
         * Builds a vertical gradient fill for a chart dataset.
         * @param {string} color - Base rgba colour string.
         * @returns {CanvasGradient}
         */
        function buildGradient(color) {
            const grad = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
            grad.addColorStop(0, color.replace('OPACITY', '0.25'));
            grad.addColorStop(1, color.replace('OPACITY', '0'));
            return grad;
        }

        // Chart.js global defaults – target dark theme look
        Chart.defaults.color = '#94A3B8';
        Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

        // Initial period
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
                    legend: { display: false }, // We use custom HTML legend above the chart
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

        /**
         * Updates the chart when a filter tab is clicked.
         * Also refreshes the HTML legend values with the latest data points.
         * @param {string} period - 'day' | 'week' | 'month'
         */
        function updateChart(period) {
            const dataset = chartDatasets[period];

            performanceChart.data.labels = dataset.labels;
            performanceChart.data.datasets[0].data = dataset.cpu;
            performanceChart.data.datasets[1].data = dataset.memory;

            // Rebuild gradients after data swap (canvas dimensions may differ)
            performanceChart.data.datasets[0].backgroundColor = buildGradient('rgba(59,130,246,OPACITY)');
            performanceChart.data.datasets[1].backgroundColor = buildGradient('rgba(139,92,246,OPACITY)');

            performanceChart.update('active');

            // Update HTML legend with latest (last) data point values
            const cpuLast = dataset.cpu[dataset.cpu.length - 1];
            const memLast = dataset.memory[dataset.memory.length - 1];
            const cpuEl = document.getElementById('legend-cpu');
            const memEl = document.getElementById('legend-mem');
            if (cpuEl) cpuEl.textContent = cpuLast + '%';
            if (memEl) memEl.textContent = memLast + '%';
        }

        // Wire up the Day / Week / Month filter buttons
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

