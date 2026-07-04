/**
 * CloudScale SaaS Dashboard — script.js
 * Extended interactive layer: dropdowns, micro-animations, button feedback,
 * table filtering, and ripple effects. Runs after app.js and Chart.js.
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. Activity Filter Dropdown
    //    Opens/closes via the "Filter" button.
    //    Filters table rows by data-status attribute.
    // =========================================================================

    const filterBtn      = document.getElementById('activityFilterBtn');
    const dropdown       = document.getElementById('activityDropdown');
    const tableRows      = document.querySelectorAll('#activitiesTableBody .table-row');
    const dropdownItems  = document.querySelectorAll('.dropdown-item');

    /**
     * Toggles the filter dropdown open/closed.
     */
    function toggleDropdown(e) {
        e.stopPropagation();
        const isOpen = dropdown.classList.toggle('open');
        filterBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    /**
     * Closes the dropdown if a click lands outside it.
     */
    function closeDropdownOutside(e) {
        if (filterBtn && !filterBtn.contains(e.target)) {
            dropdown.classList.remove('open');
            filterBtn.setAttribute('aria-expanded', 'false');
        }
    }

    /**
     * Filters the activities table rows to match the chosen status.
     * @param {string} filter - 'all' | 'completed' | 'running' | 'failed'
     */
    function filterTable(filter) {
        tableRows.forEach(row => {
            const status = row.dataset.status;
            const visible = filter === 'all' || status === filter;
            row.classList.toggle('hidden', !visible);

            // Stagger fade-in for newly visible rows
            if (visible) {
                row.style.animationDelay = '0ms';
                row.style.animation = 'none';
                // Force reflow to restart animation
                void row.offsetWidth;
                row.style.animation = 'rowFadeIn 0.25s ease forwards';
            }
        });
    }

    if (filterBtn && dropdown) {
        filterBtn.addEventListener('click', toggleDropdown);
        document.addEventListener('click', closeDropdownOutside);

        // Close on Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                filterBtn.setAttribute('aria-expanded', 'false');
            }
        });

        dropdownItems.forEach(item => {
            item.addEventListener('click', e => {
                e.stopPropagation();

                // Update active state on items
                dropdownItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                // Apply filter
                filterTable(item.dataset.filter);

                // Close dropdown after selection
                dropdown.classList.remove('open');
                filterBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // =========================================================================
    // 2. Ripple Effect on Buttons
    //    Creates a radial CSS ripple animation on every .btn click.
    // =========================================================================

    /**
     * Injects a ripple <span> into a button at the click coordinates.
     * @param {MouseEvent} e
     */
    function createRipple(e) {
        const button = e.currentTarget;

        // Remove previous ripples
        button.querySelectorAll('.ripple').forEach(r => r.remove());

        const rect   = button.getBoundingClientRect();
        const size   = Math.max(rect.width, rect.height) * 2;
        const x      = e.clientX - rect.left - size / 2;
        const y      = e.clientY - rect.top  - size / 2;

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

        // Ensure button is a positioning parent
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    }

    // Attach ripple to all action buttons
    document.querySelectorAll('.btn, .row-action-btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });

    // Inject ripple keyframe once
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
    // 3. Server Action Button Feedback
    //    Shows a temporary confirmation label after clicking Deploy / Restart.
    // =========================================================================

    document.querySelectorAll('.server-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const icon   = this.querySelector('i');
            const label  = this.querySelector('span');
            const isDeploy  = label && label.textContent.trim() === 'Deploy';
            const isRestart = label && label.textContent.trim() === 'Restart';

            if (!label) return;

            const original = label.textContent;
            const feedback  = isDeploy ? 'Queued ✓' : isRestart ? 'Sent ✓' : '✓';

            this.disabled = true;
            label.textContent = feedback;
            if (icon) icon.setAttribute('data-lucide', isDeploy ? 'check' : 'check-circle');
            lucide.createIcons();

            setTimeout(() => {
                label.textContent = original;
                if (icon) icon.setAttribute('data-lucide', isDeploy ? 'rocket' : 'rotate-ccw');
                lucide.createIcons();
                this.disabled = false;
            }, 2000);
        });
    });

    // =========================================================================
    // 4. Row Action Button Tooltip (row chevron ">")
    //    Highlights the row and shows a subtle ring when the action is clicked.
    // =========================================================================

    document.querySelectorAll('.row-action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const row = this.closest('.table-row');
            if (!row) return;

            // Flash-highlight the row
            row.style.transition = 'background-color 0.1s ease';
            row.style.backgroundColor = 'rgba(99,102,241,0.06)';
            setTimeout(() => {
                row.style.backgroundColor = '';
            }, 600);
        });
    });

    // =========================================================================
    // 5. Notification Bell Badge Clear
    //    Clicking the notification button clears the purple badge dot.
    // =========================================================================

    const notifBtn   = document.getElementById('notificationBtn');
    const notifBadge = notifBtn ? notifBtn.querySelector('.notification-badge') : null;

    if (notifBtn && notifBadge) {
        notifBtn.addEventListener('click', () => {
            notifBadge.style.transition = 'opacity 0.3s, transform 0.3s';
            notifBadge.style.opacity    = '0';
            notifBadge.style.transform  = 'scale(0)';
            setTimeout(() => notifBadge.remove(), 300);
        });
    }

    // =========================================================================
    // 6. Logout Button Confirmation
    //    Shows a brief "Signing out…" state on the sidebar logout button.
    // =========================================================================

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            this.style.color   = 'var(--color-danger)';
            this.style.opacity = '0.6';
            this.title         = 'Signing out…';
            setTimeout(() => {
                this.style.opacity = '1';
                this.title         = '';
            }, 1500);
        });
    }

    // =========================================================================
    // 7. Team Member Card — Hover Tilt Micro-animation
    //    Adds a subtle 3D tilt on mousemove for each team member card.
    // =========================================================================

    document.querySelectorAll('.team-member-card').forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect  = this.getBoundingClientRect();
            const cx    = rect.left + rect.width  / 2;
            const cy    = rect.top  + rect.height / 2;
            const dx    = (e.clientX - cx) / (rect.width  / 2);
            const dy    = (e.clientY - cy) / (rect.height / 2);
            const rotX  = (-dy * 6).toFixed(2);
            const rotY  = ( dx * 6).toFixed(2);

            this.style.transform = `translateY(-2px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
            this.style.transition = 'transform 0.1s ease';
        });

        card.addEventListener('mouseleave', function () {
            this.style.transform  = '';
            this.style.transition = 'transform 0.3s ease';
        });
    });

    // =========================================================================
    // 8. Chart Filter Tabs — Add ARIA pressed state
    // =========================================================================

    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.chart-filter-btn').forEach(b => {
                b.setAttribute('aria-pressed', 'false');
            });
            this.setAttribute('aria-pressed', 'true');
        });

        // Set initial state
        if (btn.classList.contains('active')) {
            btn.setAttribute('aria-pressed', 'true');
        } else {
            btn.setAttribute('aria-pressed', 'false');
        }
    });

    // =========================================================================
    // 9. Metric Cards — Count-up animation on load
    //    Animates numeric metric values from 0 to their target on first render.
    // =========================================================================

    /**
     * Animates a counter from 0 to target over `duration` ms.
     * @param {HTMLElement} el
     * @param {string} rawText - Original textContent, may include prefix/suffix
     * @param {number} duration
     */
    function animateCounter(el, rawText, duration = 900) {
        // Extract numeric part (handles "$32,845", "148", "64.2%", "12")
        const prefix  = rawText.match(/^[^0-9]*/)?.[0] ?? '';
        const numStr  = rawText.replace(/[^0-9.]/g, '');
        const target  = parseFloat(numStr);
        const suffix  = rawText.slice((prefix + numStr).length);

        if (isNaN(target)) return;

        const isFloat     = numStr.includes('.');
        const hasCommas   = rawText.includes(',');
        const startTime   = performance.now();

        function step(now) {
            const elapsed  = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased    = 1 - Math.pow(1 - progress, 3);
            const current  = target * eased;

            let display = isFloat ? current.toFixed(1) : Math.floor(current).toString();
            if (hasCommas) {
                display = parseFloat(display).toLocaleString('en-US');
            }

            el.textContent = prefix + display + suffix;

            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = prefix + (hasCommas ? target.toLocaleString('en-US') : rawText.replace(/^[^0-9]*/, '').replace(/[^0-9.].*$/, target.toString())) + suffix;
        }

        requestAnimationFrame(step);
    }

    // Run counter animation for all .metric-value elements
    document.querySelectorAll('.metric-value').forEach(el => {
        // Only the text node, skip child spans (e.g. /150)
        const textNode = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        if (!textNode) return;
        const original = textNode.textContent.trim();
        if (!original || !/[0-9]/.test(original)) return;

        textNode.textContent = '0';
        setTimeout(() => {
            // Defer slightly so layout has settled
            animateCounter({ 
                get textContent() { return textNode.textContent; },
                set textContent(v) { textNode.textContent = v; }
            }, original, 900);
        }, 100);
    });

});
