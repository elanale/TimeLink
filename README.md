# TimeLink
An application for buisnesses to keep track of time for job management.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh/docs/installation) - JavaScript runtime
- [Rust](https://www.rust-lang.org/tools/install) - For Tauri compilation

### Installation
```bash
git clone https://github.com/yourusername/timelink.git
cd timelink
bun install
bun run tauri dev
```

## 🧪 Test Accounts

These are pre created accounts to test and demo different roles work flows.

### Organization: "Danial Tech Solutions"

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | ilan_danial@outlook.com | admin123 | Full access to all features |
| **Manager** | ilan_danial+manager@outlook.com | manager123 | Team & job management |
| **Employee** | ilan_danial+employee@outlook.com | employee123 | Time tracking only |

> **Note:** We currently have email verification closed for testing purposes

## ✨ Key Features

### For Employees
- Clocking in and out with while requiring job selection
- Having a view of their personal timetables and weekly earnings
- Keep track of hours by the job

### For Managers
- Implement Jobs and manage them with detailed tracking features
- A view for team status and hours of employees managed by their specified managers
- The ability to invite new employees to the system
- The functionality of completing or cancelling jobs with the jobs dashboard

### For Admins

- Total control of organization with full permissions
- Access to employee wage settings
- Access to all manager features

## 🏗️ Job Management

Jobs include:
- Job # and name
- Client and location data
- Urgency Tiering
- Time estimates vs actual hours
- Status tracking (Active/Completed/Cancelled)
- Calculations of the costs of jobs

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Desktop:** Tauri (Rust)
- **Backend:** Firebase Auth & Firestore
- **Routing:** Tanstack Router

## 📁 Project Structure

```
timelink/
├── src/
│   ├── components/     # UI components
│   ├── routes/         # Page routes
│   ├── services/       # Business logic
│   └── types/          # TypeScript types
├── src-tauri/          # Tauri backend
└── firestore.rules     # Security rules
```

## 🔐 Firebase Setup

1. Create a [Firebase project](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Update `src/components/firebase.ts` with your config
5. Deploy security rules: `firebase deploy --only firestore:rules`

## 🧭 Testing Flow

1. **Admin Login** → Create jobs → Manage organization
2. **Manager Login** → View team → Manage jobs → Invite employees  
3. **Employee Login** → Select job → Clock in/out → View hours

## 🐛 Common Issues

**"Job number not found" when clocking in:**
- Managers/Admins must create jobs first
- Employees can only clock in with valid job numbers

**Can't access certain features:**
- Check your role permissions
- Employees can't create jobs or invite users

## 📝 License

MIT License - See LICENSE file for details

---

Built with ❤️ by Elan Wygodski, Ilan Danial, Aidan Boudreau and Matt Beutel