# EPRA Fuel Integrity Management System 🇰🇪⛽

A comprehensive fuel supply chain monitoring and integrity management platform built for Kenya's **Energy & Petroleum Regulatory Authority (EPRA)**.

![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

---

## Overview

The EPRA Fuel Integrity System provides real-time monitoring of Kenya's fuel supply chain — from storage depots to gas stations. It tracks custody transfers, detects anomalies, manages inspections, and ensures fuel quality compliance across the country.

---

## Features

### 📊 Dashboard
- Real-time KPI cards (active transactions, alerts, inspections)
- Weekly transaction volume chart
- Stock distribution by company (pie chart)
- Recent transaction feed

### 🗺️ Live GPS Tracking Map
- Interactive SVG map of Kenya
- Depot and station locations with click-to-inspect
- Animated in-transit vehicle markers with progress tracking
- Color-coded legend (depots, stations, transit vehicles)

### 🚛 Secure Custody Transfer (SCT)
- QR code scanning simulation (loading & delivery)
- Digital seal verification with status indicators (✓ verified, ✗ mismatch, ⏳ pending)
- Volume discrepancy detection and alerts
- Transaction filtering (All / In Transit / Completed)
- Delivery confirmation workflow

### 📈 Wet Stock Management (WSM)
- Variance overview bar chart (green/red threshold indicators)
- Per-location 7-day variance trend analysis
- Threshold breach alerts (0.15% limit)
- Stock level progress bars with capacity info
- Drill-down detail views

### 🧪 Fuel Quality Testing
- KEBS standard reference values (density, octane, sulfur, water)
- Per-station quality test results
- Automatic PASS/FAIL determination
- Out-of-spec parameter highlighting

### 🚨 Incidents & Alerts
- Severity-based incident tracking (high/medium/low)
- Status management (open → investigating → resolved)
- Investigation action with audit logging
- Location and timestamp metadata

### 🔍 Inspection Management
- Scheduled inspection calendar
- 8-point inspection checklist with progress bar
- Overdue inspection flagging
- Report submission with audit trail
- Inspector assignment tracking

### 👤 Driver Registry
- Driver profiles with vehicle assignments
- Trip count and incident history
- Status badges (active/warning)

### 📋 Audit Trail
- Complete action logging with timestamps
- User attribution for all system events
- Chronological event feed

### 📁 Location Directory
- Depot and station profiles
- License status tracking (active/expiring)
- Contact information
- Stock levels and capacity visualization
- Last inspection results

### 🌙 Dark Mode
- Toggle via moon/sun icon in the top bar
- Full theme support across all views

### 🔔 Notifications
- Bell icon with unread badge counter
- Categorized alerts (variance, delivery, inspection, seal, license)

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling |
| **Recharts** | Charts & data visualization |
| **Lucide React** | Icon library |

---

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/epra-fuel-integrity-system.git
cd epra-fuel-integrity-system

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
epra-fuel-integrity-system/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx          # Main application (all views & logic)
│   ├── index.tsx        # Entry point
│   └── index.css        # Tailwind imports
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## User Roles

| Role | Access |
|------|--------|
| **Administrator** | Full access to all modules, audit trail, system configuration |
| **Depot Operator** | SCT scanning, stock declarations, transaction management |
| **Inspector** | Inspection checklists, quality testing, incident reporting |

---

## Data Model

The v1 prototype uses in-memory mock data representing:

- **4 Fuel Depots** — Mombasa, Nairobi, Eldoret, Kisumu
- **8 Gas Stations** — Across major Kenyan cities
- **6 Active Transactions** — With seal verification and volume tracking
- **6 Stock Locations** — With 7-day variance history
- **5 Incidents** — Various severity levels
- **4 Scheduled Inspections** — Including overdue items
- **4 Registered Drivers** — With trip and incident records

---

## Roadmap

### v2.0 (Planned)
- [ ] Real API integration (REST/GraphQL)
- [ ] PostgreSQL database backend
- [ ] Real QR code scanning via device camera
- [ ] Leaflet/Mapbox interactive map
- [ ] Push notifications (FCM)
- [ ] Offline mode with sync queue
- [ ] PDF report generation & export
- [ ] Multi-language support (English/Swahili)

### v3.0 (Future)
- [ ] Machine learning anomaly detection
- [ ] Predictive analytics for stock management
- [ ] Integration with Kenya Revenue Authority (KRA)
- [ ] Mobile app (React Native)
- [ ] SMS alerts via Africa's Talking API

---

## Regulatory Context

This system supports EPRA's mandate under Kenya's **Energy Act 2019** to:

- Monitor petroleum product quality standards
- Ensure accurate measurement and custody transfer
- Track fuel supply chain integrity from import to retail
- Enforce licensing compliance for depots and stations
- Investigate fuel adulteration and diversion incidents

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Contact

For questions about this project or EPRA integration, please open a GitHub issue.

---

<p align="center">
  <strong>Built for the Republic of Kenya 🇰🇪</strong><br/>
  Energy & Petroleum Regulatory Authority
</p>
