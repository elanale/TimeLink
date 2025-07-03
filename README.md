# TimeLink

[![STD Covenant](https://img.shields.io/badge/STD_COVENANT-Codex-green?style=flat&logo=github)](https://github.com/janustack/.github/blob/main/CODEX.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A cross-platform desktop time-tracking application built with Tauri, React, and Firebase. TimeLink helps students and professionals track their work hours with a simple, elegant interface.

## 🚀 Features

- **Secure Authentication**: Email/password authentication restricted to `.edu` email addresses
- **Email Verification**: Users must verify their email before accessing the dashboard
- **Time Tracking**: Simple clock in/out system with automatic duration calculation
- **Historical Logs**: View all past time entries with dates and durations
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Dark Mode**: Full dark mode support for comfortable usage
- **Real-time Sync**: All data synced to Firebase Firestore

## 🛠️ Tech Stack

Below is the core technology stack used in TimeLink, along with links to their documentation:

- [Bun](https://bun.sh/docs) - Fast JavaScript runtime and package manager
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite) - CSS Framework
- [Tanstack Router](https://tanstack.com/router/latest/docs/framework/react/overview) - Type-safe routing
- [Tauri](https://tauri.app/start/) - Native desktop app runtime using Rust
- [TypeScript](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [Vite](https://vite.dev/guide/) - Fast build tool
- [Firebase](https://firebase.google.com/) - Authentication and database

## 📋 Prerequisites

Before getting started, make sure you have the following tools installed:

- [Bun](https://bun.sh/docs/installation)
- [Rust](https://www.rust-lang.org/tools/install)

### Platform-Specific Requirements

**Windows:**
- Microsoft C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

**macOS:**
- Xcode Command Line Tools
- Run: `xcode-select --install`

**Linux:**
- Various system dependencies. See [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/timelink.git
   cd timelink
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Update `src/components/firebase.ts` with your Firebase configuration

4. **Run in development mode**
   ```bash
   bun run tauri dev
   ```

5. **Build for production**
   ```bash
   bun run tauri build
   ```

## 📁 Project Structure

```
timelink/
├── src/                    # React application source
│   ├── components/         # Reusable components
│   │   ├── AuthContext.tsx # Authentication state management
│   │   ├── NavBar.tsx      # Navigation component
│   │   ├── Footer.tsx      # Footer component
│   │   └── firebase.ts     # Firebase configuration
│   ├── routes/             # Application routes
│   │   ├── __root.tsx      # Root layout
│   │   ├── index.tsx       # Home page
│   │   ├── login.tsx       # Login page
│   │   ├── signup.tsx      # Signup page
│   │   ├── dashboard.tsx   # Protected dashboard
│   │   └── Clock.tsx       # Time tracking component
│   └── main.tsx           # Application entry point
├── src-tauri/             # Tauri/Rust backend
│   ├── src/               # Rust source files
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── package.json           # Node dependencies
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── biome.json            # Code formatting/linting config
```

## 🔧 Common CLI Commands

```bash
# To install dependencies of the application
bun install

# To update dependencies to their latest version
bun update --latest

# Start the Vite-powered React frontend in your browser
bun run dev

# Format your code
bun run format

# Open the Tauri CLI
bun run tauri

# Build the app in release mode
bun run tauri build

# Run the app in development mode
bun run tauri dev
```

## 🔐 Authentication Flow

1. **Registration**: Users sign up with a `.edu` email address
2. **Email Verification**: A verification email is sent upon registration
3. **Login**: Users can only access the dashboard after email verification
4. **Protected Routes**: Dashboard and time tracking features require authentication

## 📊 Database Structure

**Firestore Collections:**
```
users/
├── {userId}/
│   ├── name: string
│   ├── email: string
│   ├── joinedAt: timestamp
│   ├── role: string
│   └── emailVerified: boolean

timeLogs/
├── {userId}/
│   └── logs/
│       └── {logId}/
│           ├── clockIn: timestamp
│           └── clockOut: timestamp | null
```

## 🎨 Customization

### Styling
- TailwindCSS configuration can be modified in `tailwind.config.js`
- Global styles are in `src/index.css`
- Dark mode is supported throughout the application

### Firebase Configuration
Update `src/components/firebase.ts` with your Firebase project credentials:
```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 💻 Recommended VS Code Extensions

These extensions enhance development specifically for this stack:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome)
- [Bun for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode)
- [Even Better TOML](https://marketplace.visualstudio.com/items?itemName=tamasfe.even-better-toml)

### General-Purpose VS Code Extensions

- [Auto Rename Tag](https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [colorize](https://marketplace.visualstudio.com/items?itemName=kamikillerto.vscode-colorize)
- [vscode-icons](https://marketplace.visualstudio.com/items?itemName=vscode-icons-team.vscode-icons)

## 🚨 Important Security Notes

1. **Never commit Firebase credentials to public repositories**
2. **Enable Firebase Security Rules** to protect your database
3. **Use environment variables** for sensitive configuration in production

## 🐛 Troubleshooting

### Common Issues

**Build fails on Windows:**
- Ensure you have Microsoft C++ Build Tools installed
- Run the build command as Administrator

**Cannot find module errors:**
- Clear node_modules and reinstall: `rm -rf node_modules && bun install`
- Ensure path aliases are correctly configured in `tsconfig.json` and `vite.config.ts`

**Firebase authentication errors:**
- Verify your Firebase configuration is correct
- Check that email/password authentication is enabled in Firebase Console
- Ensure Firestore database is created and accessible


## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the [Tauri documentation](https://tauri.app/start/)
- Review the [Firebase documentation](https://firebase.google.com/docs)
