# TimeLink

[![STD Covenant](https://img.shields.io/badge/STD_COVENANT-Codex-green?style=flat&logo=github)](https://github.com/janustack/.github/blob/main/CODEX.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
A cross-platform desktop time-tracking SaaS application built with Tauri, React, and Firebase. TimeLink provides comprehensive time tracking for businesses with multi-tenant architecture, role-based access control, and advanced team management features.

## 🚀 Features

### Core Functionality
- **Multi-Tenant Architecture**: Complete organization isolation with secure data access
- **Role-Based Access Control**: Admin, Manager, and Employee roles with granular permissions
- **Enhanced Time Tracking**: Clock in/out with daily planning and work reports
- **Team Management**: Invitation system for onboarding team members
- **Real-Time Status**: Live tracking of team member clock-in status
- **Advanced Reporting**: Historical time logs with filtering and analytics
- **Cross-Platform**: Works on Windows, macOS, and Linux

### Authentication & Security
- **Secure Authentication**: Email/password authentication with Firebase
- **Email Verification**: Users must verify email before dashboard access (configurable)
- **Organization Isolation**: Complete data separation between organizations
- **Invitation System**: Secure team member onboarding with token-based invitations

### User Experience
- **Dark Mode**: Full dark mode support throughout the application
- **Responsive Design**: Optimized for desktop and mobile interfaces
- **Real-time Sync**: All data synchronized to Firebase Firestore
- **Type-Safe**: Full TypeScript implementation for reliability

## 🏢 Multi-Tenant SaaS Architecture

TimeLink is designed as a complete SaaS solution supporting multiple organizations:

### User Roles & Permissions
| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| Time Tracking | ✅ | ✅ | ✅ |
| View Own Logs | ✅ | ✅ | ✅ |
| Team Status View | ❌ | ✅ | ✅ |
| Invite Users | ❌ | ✅ | ✅ |
| Organization Settings | ❌ | ❌ | ✅ |
| User Management | ❌ | Limited | ✅ |

### Data Architecture
- **Organizations**: Multi-tenant isolation with independent data
- **Users**: Role-based permissions and organizational membership
- **Time Logs**: Flat collection structure for efficient querying
- **User Status**: Real-time tracking of team activity
- **Invitations**: Secure token-based team onboarding

## 🛠️ Tech Stack

### Frontend
- [React](https://react.dev/) - UI library with hooks and context
- [TypeScript](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite) - Utility-first CSS framework
- [Tanstack Router](https://tanstack.com/router/latest/docs/framework/react/overview) - Type-safe file-based routing
- [Vite](https://vite.dev/guide/) - Fast build tool and dev server

### Backend & Infrastructure
- [Firebase Authentication](https://firebase.google.com/docs/auth) - User authentication and management
- [Firestore](https://firebase.google.com/docs/firestore) - NoSQL database with real-time sync
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started) - Database-level security

### Desktop & Tools
- [Tauri](https://tauri.app/start/) - Native desktop app runtime using Rust
- [Bun](https://bun.sh/docs) - Fast JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/) - Systems programming language for Tauri backend

## 🧪 Test Users & Development

### Pre-configured Test Accounts

For development and testing purposes, the following test accounts are available:

#### Organization: "Danial Tech Solutions"
```
🔑 ADMIN ACCOUNT
Email: ilan_danial@outlook.com
Password: admin123
Role: Organization Administrator
Permissions: Full access to all features

👔 MANAGER ACCOUNT  
Email: ilan_danial+manager@outlook.com
Password: manager123
Name: Sarah Johnson
Department: Operations
Permissions: Team management, user invitations, time tracking

👷 EMPLOYEE ACCOUNT
Email: ilan_danial+employee@outlook.com  
Password: employee123
Name: Mike Wilson
Department: Operations
Manager: Sarah Johnson
Permissions: Time tracking only
```

#### Testing Different Roles
1. **Admin Testing**: Full organization management, user creation, settings
2. **Manager Testing**: Team oversight, employee invitations, time tracking
3. **Employee Testing**: Personal time tracking, daily planning, work reports

### Email Alias Strategy
The test accounts use email aliases (`+manager`, `+employee`) which:
- ✅ All route to the same inbox (ilan_danial@outlook.com)
- ✅ Firebase treats as separate accounts
- ✅ Simplifies testing without multiple email addresses
- ✅ Maintains realistic multi-user scenarios

## 📋 Prerequisites

### Required Tools
- [Bun](https://bun.sh/docs/installation) - JavaScript runtime and package manager
- [Rust](https://www.rust-lang.org/tools/install) - For Tauri desktop app compilation

### Platform-Specific Requirements

**Windows:**
- Microsoft C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Linux:**
- Various system dependencies - see [Tauri Prerequisites](https://tauri.app/start/prerequisites/)

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/timelink.git
cd timelink
bun install
```

### 2. Firebase Setup
1. **Create Firebase Project**: [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication**: Email/Password provider
3. **Create Firestore Database**: Start in test mode, then apply security rules
4. **Update Configuration**: `src/components/firebase.ts`

### 3. Deploy Firestore Security Rules
```bash
# Deploy the production-ready security rules
firebase deploy --only firestore:rules
```

### 4. Development
```bash
# Run in development mode
bun run tauri dev

# Build for production  
bun run tauri build
```

### 5. Test the Application
1. **Start with Admin**: Use ilan_danial@outlook.com to explore all features
2. **Create Organizations**: Test the full signup flow
3. **Invite Team Members**: Use the invitation system
4. **Test Role Permissions**: Verify different access levels

## 📁 Enhanced Project Structure

```
timelink/
├── src/                           # React application source
│   ├── components/                # Reusable UI components
│   │   ├── AuthContext.tsx        # Authentication state management
│   │   ├── NavBar.tsx             # Role-based navigation
│   │   ├── Clock.tsx              # Enhanced time tracking
│   │   ├── WorkReport.tsx         # Daily planning modal
│   │   ├── TeamStatusView.tsx     # Manager team overview
│   │   ├── OrgSettingsView.tsx    # Admin organization settings
│   │   ├── Footer.tsx             # Application footer
│   │   └── firebase.ts            # Firebase configuration
│   ├── routes/                    # File-based routing
│   │   ├── __root.tsx             # Root layout with navigation
│   │   ├── finishSignUp.tsx       # Allows user to sign up through email link
│   │   ├── index.tsx              # Landing page
│   │   ├── login.tsx              # Authentication
│   │   ├── signup.tsx             # Organization registration
│   │   ├── createJobs.tsx         # Job creation route 
│   │   ├── dashboard.tsx          # Role-based dashboard
│   │   ├── invite.tsx             # Team member invitation
│   │   └── accept-invitation.tsx  # Invitation acceptance
│   ├── services/                  # Business logic services
│   │   ├── timeTrackingService.ts # Time tracking operations
│   │   ├── userService.ts         # User management
│   │   ├── organizationService.ts # Organization operations
│   │   └── invitationService.ts   # Invitation system
│   │   └── createJobService.ts    # Allows Admin/Managers to add Jobs
│   ├── types/                     # TypeScript definitions
│   │   ├── models.ts              # Core data models
│   │   └── index.ts               # Type exports
│   ├── utils/                     # Utility functions
│   └── main.tsx                   # Application entry point
├── src-tauri/                     # Tauri/Rust backend
├── firestore.rules                # Database security rules
├── firestore.indexes.json         # Database indexes
└── configuration files...
```

## 🔧 Enhanced CLI Commands

### Development
```bash
# Install dependencies
bun install

# Start React development server
bun run dev

# Run desktop app in development
bun run tauri dev

# Type checking
bun run type-check
```

### Production
```bash
# Build desktop app for distribution
bun run tauri build

# Deploy Firebase rules and indexes
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Code Quality
```bash
# Format code
bun run format

# Lint code
bun run lint

# Run tests (if implemented)
bun run test
```

## 🗄️ Database Structure

### Firestore Collections

#### Organizations
```typescript
organizations/{orgId}
├── name: string                    // Organization name
├── email: string                   // Primary contact email
├── industry?: string               // Business industry
├── plan: 'free' | 'starter' | ...  // Subscription tier
├── maxEmployees: number            // Plan limits
├── settings: {                     // Organization preferences
│   workWeekDays: number[]          // [1,2,3,4,5] for Mon-Fri
│   dayStartTime: string            // "09:00"
│   dayEndTime: string              // "17:00"
│   overtimeAfterHours: number      // 40
│   └── ...
└── metadata...
```

#### Users
```typescript
users/{userId}
├── organizationId: string          // Organization membership
├── role: 'admin'|'manager'|'employee' // Access level
├── email: string                   // User email
├── firstName: string               // User's first name
├── lastName: string                // User's last name
├── displayName: string             // Full display name
├── department?: string             // Work department
├── managerId?: string              // Direct manager
├── permissions: {                  // Granular permissions
│   canInviteEmployees: boolean
│   canEditTimeLogs: boolean
│   └── ...
└── metadata...
```

#### Time Logs
```typescript
timeLogs/{logId}
├── organizationId: string          // For org-wide queries
├── userId: string                  // Log owner
├── userDisplayName: string         // For easy display
├── clockIn: timestamp              // Start time
├── clockOut?: timestamp            // End time (if completed)
├── clockInNote?: string            // Daily plan
├── clockOutNote?: string           // Work report
├── date: string                    // "YYYY-MM-DD" for querying
├── status: 'active'|'completed'    // Log status
├── totalHours?: number             // Calculated duration
└── metadata...
```

#### User Status (Real-time)
```typescript
userStatus/{userId}
├── organizationId: string          // Organization membership
├── currentStatus: 'clocked_in'|'clocked_out' // Current state
├── currentTimeLogId?: string       // Active log reference
├── todayHours: number              // Today's total hours
├── weekHours: number               // Week's total hours
├── todaysPlan?: string             // Current daily plan
└── lastActivity: timestamp         // Last update time
```

#### Invitations
```typescript
invitations/{inviteId}
├── organizationId: string          // Target organization
├── email: string                   // Invitee email
├── role: 'manager'|'employee'      // Assigned role
├── token: string                   // Unique invitation token
├── status: 'pending'|'accepted'    // Invitation state
├── invitedBy: string               // Inviter user ID
├── firstName?: string              // Pre-filled data
├── lastName?: string               
├── department?: string             
├── managerId?: string              // For employees
├── expiresAt: timestamp            // Token expiration
└── metadata...
```

#### Jobs
```typescript
  jobs/{jobId}
├── organizationId: string
├── jobNumber: string
├── jobName: string
├── createdBy: string
├── createdAt: timestamp
```

## 🔐 Security Implementation

### Firebase Security Rules
- **Multi-tenant isolation**: Complete data separation between organizations
- **Role-based access**: Granular permissions based on user roles
- **Bootstrap-friendly**: Allows initial organization creation
- **Invitation security**: Token-based validation for team onboarding

### Key Security Features
```javascript
// Example: Time logs can only be accessed by organization members
match /timeLogs/{logId} {
  allow read: if isAuthenticated() && 
                 (resource.data.userId == request.auth.uid ||
                  isManagerInSameOrg(resource.data.organizationId));
}
```

## 🎯 Testing Workflows

### Complete User Journey Testing

#### 1. Admin Workflow
```bash
# Login as admin
Email: ilan_danial@outlook.com
Password: admin123

# Test admin features:
- Organization settings access
- Full user management
- Complete time tracking
- Manager and employee invitations
- Job Creation
```

#### 2. Manager Workflow  
```bash
# Login as manager
Email: ilan_danial+manager@outlook.com
Password: manager123

# Test manager features:
- Team status overview
- Employee invitations
- Time tracking supervision
- Limited admin access
```

#### 3. Employee Workflow
```bash
# Login as employee
Email: ilan_danial+employee@outlook.com  
Password: employee123

# Test employee features:
- Personal time tracking
- Clock in/out of Job
- Restricted navigation
- No administrative access
```

### Feature Testing Checklist
- [ ] Multi-tenant organization creation
- [ ] Role-based navigation visibility
- [ ] Time tracking with work reports
- [ ] Invitation system end-to-end
- [ ] Real-time status updates
- [ ] Database security rules
- [ ] Cross-platform desktop builds

## 🚨 Important Security Notes

### Production Security
1. **Never commit Firebase credentials** to version control
2. **Use environment variables** for all sensitive configuration
3. **Deploy security rules** before launching to production
4. **Regular security audits** of Firebase console access
5. **Monitor authentication logs** for suspicious activity

### Development Security
1. **Test accounts are for development only** - reset passwords for production
2. **Firestore rules** include debug logging - remove for production
3. **Email verification** is temporarily disabled - re-enable for production

## 🐛 Troubleshooting

### Common Development Issues

#### Database Index Errors
```
Error: The query requires an index
Solution: Click the provided Firebase Console link to create required indexes
```

#### Firestore Permission Errors
```
Error: Missing or insufficient permissions
Solution: Verify firestore.rules are deployed and user authentication is working
```

#### TypeScript Import Errors
```
Error: Cannot find module '@/types/...'
Solution: Check path aliases in tsconfig.json and vite.config.ts
```

#### Build Issues
```
Windows: Install Microsoft C++ Build Tools
macOS: Run xcode-select --install  
Linux: Install platform-specific dependencies
```

### Database Debugging
1. **Firebase Console**: Monitor real-time database activity
2. **Browser DevTools**: Check network requests and console errors  
3. **Authentication Status**: Verify user login state in AuthContext
4. **Index Status**: Ensure all required indexes are built

## 📈 Performance Optimizations

### Implemented Optimizations
- **Flat collection structure** for efficient querying
- **Minimal composite indexes** to reduce complexity
- **JavaScript-based sorting** for complex operations
- **Real-time user status** with optimized updates
- **Type-safe queries** to prevent runtime errors

### Database Query Patterns
```typescript
// Efficient: Single organization query with date filtering
query(
  collection(db, 'timeLogs'),
  where('organizationId', '==', orgId),
  where('date', '>=', startDate),
  orderBy('date', 'desc')
)
```

## 📞 Support & Development

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Documentation**: [Tauri](https://tauri.app/start/) | [Firebase](https://firebase.google.com/docs) | [React](https://react.dev/)
- **Community**: Join the Tauri Discord for development support

### Contributing
1. Fork the repository
2. Create a feature branch
3. Implement changes with proper TypeScript typing
4. Test with all user roles
5. Submit pull request with detailed description

### Development Setup
```bash
# Complete development environment setup
git clone https://github.com/yourusername/timelink.git
cd timelink
bun install
cp .env.example .env.local  # Configure Firebase credentials
bun run tauri dev
```

---

**TimeLink** - Professional time tracking for modern teams. Built with ❤️ using Tauri, React, and Firebase.
