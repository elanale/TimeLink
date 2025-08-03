# TimeLink

A desktop time-tracking application for businesses with job management, built with Tauri, React, and Firebase.

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

Use these pre-configured accounts to explore different roles:

### Organization: "Danial Tech Solutions"

| Role | Email | Password | Permissions |
|------|-------|----------|-------------|
| **Admin** | ilan_danial@outlook.com | admin123 | Full access to all features |
| **Manager** | ilan_danial+manager@outlook.com | manager123 | Team & job management |
| **Employee** | ilan_danial+employee@outlook.com | employee123 | Time tracking only |

> **Note:** Email verification is temporarily disabled for testing

## ✨ Key Features

### For Employees
- Clock in/out with **job selection** (required)
- View personal time logs and weekly earnings
- Track hours by job

### For Managers
- Create and manage jobs with detailed tracking
- View team status and hours
- Invite new team members
- Complete or cancel jobs

### For Admins
- Full organization management
- Employee wage settings
- Access to all manager features

## 🏗️ Job Management

Jobs include:
- Job number and name
- Client and location info
- Priority levels (Low → Urgent)
- Time estimates vs actual hours
- Status tracking (Active/Completed/Cancelled)
- Cost calculations

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

Built with ❤️ by Elan Wygodski