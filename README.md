# 🖥️ CloudScale SaaS Dashboard

[![GitHub license](https://img.shields.io/github/license/zarixlabs/cloudscale-saas-dashboard?style=flat-square)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/zarixlabs/cloudscale-saas-dashboard?style=flat-square)](https://github.com/zarixlabs/cloudscale-saas-dashboard/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/zarixlabs/cloudscale-saas-dashboard?style=flat-square)](https://github.com/zarixlabs/cloudscale-saas-dashboard/issues)

CloudScale is a premium, high-performance Enterprise SaaS Cloud Monitoring & Analytics Dashboard. Designed with a dark mode aesthetic, smooth glassmorphism UI card components, and fluid micro-animations, it provides devops professionals and cloud operators with real-time insight into server status, telemetry, and activity logs.

🚀 **Live Demo:** [https://zarixlabs.github.io/cloudscale-saas-dashboard/](https://zarixlabs.github.io/cloudscale-saas-dashboard/)

---

## ✨ Features

- 🌌 **Premium Dark Theme & Glassmorphism UI**: Tailored HSL colors, CSS variables, and modern glassmorphism aesthetic using Outfit/Plus Jakarta Sans typography.
- 📈 **Interactive Performance Analytics**: Powered by **Chart.js**, featuring smooth gradients, line-interpolations, custom tooltips, and interactive time-period toggling (Day, Week, Month).
- 🖥️ **Live Telemetry & Server Metrics**: Real-time mock telemetry trackers for CPU load, Memory usage, network bandwidth, and server status.
- 🔍 **Global Command Center**: Instant access using the search keyboard shortcut (`⌘K` or `Ctrl + K`).
- 📂 **Activities Log Filtering**: Filter through system tasks by status (Completed, Running, Failed) with smooth CSS stagger fade-in transition states.
- 📱 **Fully Responsive Layout**: Seamless mobile navigation with an off-canvas drawer overlay, responsive breakpoints, and custom mobile menu triggers.
- ⚡ **Micro-Interactive Feedback**: Radial CSS ripple animations on buttons, active navigation toggles, and responsive hover effects.

---

## 🛠️ Technology Stack

- **Markup:** Semantic HTML5
- **Styling:** Vanilla CSS3 (Custom Variables, Flexbox, CSS Grid, Transitions/Keyframes)
- **Scripting:** Modern Vanilla JavaScript (ES6+)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Charts:** [Chart.js](https://www.chartjs.org/)

---

## 🚀 Getting Started

No heavy build steps or configuration needed! This project is built using vanilla technologies and can be run instantly in any modern web browser.

### Prerequisites

You need a basic web server or simply open the file in a browser.

### Option 1: Live Server (VS Code Extension)
1. Clone this repository:
   ```bash
   git clone https://github.com/zarixlabs/cloudscale-saas-dashboard.git
   cd cloudscale-saas-dashboard
   ```
2. Open the directory in **Visual Studio Code**.
3. Install the **Live Server** extension.
4. Click the **Go Live** button at the bottom-right corner of VS Code.

### Option 2: Double-click `index.html`
1. Download or clone this repository.
2. Double-click the `index.html` file in your system file explorer to open it directly in your default browser.

---

## ⌨️ Shortcuts

- **`Ctrl + K` or `⌘ + K`**: Focuses the global search bar instantly from anywhere on the page.
- **`Escape`**: Closes active dropdowns and overlays.

---

## 📁 Project Structure

```text
cloudscale-saas-dashboard/
├── index.html        # Main dashboard structure & layout markup
├── style.css         # Styling system, tokens, layouts & components
├── app.js            # Core interaction (Sidebar drawer, Chart.js setup)
├── script.js         # Interactive features (Activity filters, ripples)
└── README.md         # Project documentation (this file)
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
