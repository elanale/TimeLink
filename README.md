# TimeLink

[![STD Covenant](https://img.shields.io/badge/STD_COVENANT-Codex-green?style=flat&logo=github)](https://github.com/janustack/.github/blob/main/CODEX.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
A cross-platform desktop time-tracking SaaS application built with Tauri, React, and Firebase. TimeLink provides comprehensive time tracking for businesses with multi-tenant architecture, role-based access control, and advanced team management features.

## 🚀 Features

### Core Functionality
- **Multi-Tenant Architecture**: Complete organization isolation with secure data access
- **Role-Based Access Control**: Admin, Manager, and Employee roles with granular permissions
- **Enhanced Time Tracking**: Clock in/out with daily planning and work reports
- **Job Management System**: Create, track, and complete jobs with time and cost tracking
- **Team Management**: Invitation system for onboarding team members
- **Real-Time Status**: Live tracking of team member clock-in status
- **Advanced Reporting**: Historical time logs with filtering and analytics
- **Cross-Platform**: Works on Windows, macOS, and Linux

### Job Management Features
- **Comprehensive Job Creation**: Track jobs with detailed information including client, location, and priority
- **Job Status Tracking**: Active, completed, cancelled, and paused states
- **Time & Cost Estimation**: Compare estimated vs actual hours and costs
- **Job Assignment**: Link employees to specific jobs
- **Real-time Updates**: See job progress and hours logged in real-time
- **Quick Actions**: Complete or cancel jobs with notes
- **Job Dashboard**: Overview statistics and filtering capabilities

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
|---------|----------|--------|------|
| Time Tracking | ✅ | ❌ | ❌ |
| View Own Logs | ✅ | ✅ | ✅ |
| Team Status View | ❌ | ✅ | ✅ |
| Invite Users | ❌ | ✅ | ✅ |
| Job Management | View Only | ✅ | ✅ |
| Create/Edit Jobs | ❌ | ✅ | ✅ |
| Complete/Cancel Jobs | ❌ | ✅ | ✅ |
| Organization Settings | ❌ | ❌ | ✅ |
| User Management | ❌ | Limited | ✅ |

### Data Architecture
- **Organizations**: Multi-tenant isolation with independent data
- **Users**: Role-based permissions and organizational membership
- **Jobs**: Project/task tracking with status, assignments, and time tracking
- **Time Logs**: Flat collection structure for efficient querying with job linkage
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
Permissions: Team management, user invitations, job management, time tracking

👷 EMPLOYEE ACCOUNT
Email: ilan_danial+employee@outlook.com  
Password: employee123
Name: Mike Wilson
Department: Operations
Manager: Sarah Johnson
Permissions: Time tracking only, job selection required
```

#### Testing Different Roles
1. **Admin Testing**: Full organization management, job creation/management, user creation, settings
2. **Manager Testing**: Team oversight, job management, employee invitations, time tracking supervision
3. **Employee Testing**: Personal time tracking with job selection, daily planning, work reports

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
2. **Create Jobs**: Test the job creation and management flow
3. **Invite Team Members**: Use the invitation system
4. **Test Time Tracking**: Clock in/out with job selection
5. **Test Role Permissions**: Verify different access levels

## 📁 Enhanced Project Structure

```
timelink/
├── src/                           # React application source
│   ├── components/                # Reusable UI components
│   │   ├── AuthContext.tsx        # Authentication state management
│   │   ├── NavBar.tsx             # Role-based navigation with Jobs link
│   │   ├── Clock.tsx              # Enhanced time tracking with job display
│   │   ├── WorkReport.tsx         # Clock in/out modal with job selection
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
│   │   ├── jobs.tsx               # Job management dashboard
│   │   ├── createJobs.tsx         # Enhanced job creation form
│   │   ├── dashboard.tsx          # Role-based dashboard
│   │   ├── invite.tsx             # Team member invitation
│   │   └── accept-invitation.tsx  # Invitation acceptance
│   ├── services/                  # Business logic services
│   │   ├── timeTrackingService.ts # Time tracking with job support
│   │   ├── userService.ts         # User management
│   │   ├── organizationService.ts # Organization operations
│   │   ├── invitationService.ts   # Invitation system
│   │   └── jobService.ts          # Complete job management service
│   ├── types/                     # TypeScript definitions
│   │   ├── models.ts              # Core data models including Job type
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
├── hourlyRate?: number             // For wage calculations
├── permissions: {                  // Granular permissions
│   canInviteEmployees: boolean
│   canEditTimeLogs: boolean
│   canManageJobs: boolean
│   └── ...
└── metadata...
```

#### Jobs
```typescript
jobs/{jobId}
├── organizationId: string          // Organization ID
├── jobNumber: string               // Unique job identifier
├── jobName: string                 // Descriptive name
├── description?: string            // Detailed description
├── status: 'active'|'completed'|'cancelled'|'paused'
├── priority?: 'low'|'medium'|'high'|'urgent'
├── estimatedHours?: number         // Time estimate
├── actualHours?: number            // Calculated from logs
├── assignedEmployees?: string[]    // Array of userIds
├── department?: string             // Associated department
├── createdAt: timestamp            // Creation time
├── createdBy: string               // Creator userId
├── updatedAt: timestamp            // Last update
├── startDate?: timestamp           // Job start date
├── dueDate?: timestamp             // Job deadline
├── completedAt?: timestamp         // Completion time
├── completedBy?: string            // Completer userId
├── clientName?: string             // Client information
├── location?: string               // Job location
├── notes?: string                  // Additional notes
├── tags?: string[]                 // Categorization tags
├── budgetedCost?: number           // Cost estimate
└── actualCost?: number             // Calculated cost
```

#### Time Logs
```typescript
timeLogs/{logId}
├── organizationId: string          // For org-wide queries
├── userId: string                  // Log owner
├── userDisplayName: string         // For easy display
├── jobId?: string                  // Linked job ID
├── jobNumber?: string              // Job identifier
├── jobName?: string                // Job name for display
├── clockIn: timestamp              // Start time
├── clockOut?: timestamp            // End time (if completed)
├── clockInNote?: string            // Daily plan
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

## ✅ New Features Summary
- **Enhanced Job Management System**
  - Comprehensive job creation with client, location, priority, and time estimates
  - Job dashboard with statistics and filtering
  - Quick actions to complete or cancel jobs
  - Real-time job hour and cost tracking
- **Time Tracking Integration**
  - Employees must select a job when clocking in
  - Job information displayed in time logs
  - Active session shows current job details
- **Job Service API**
  - Full CRUD operations for jobs
  - Automatic hour and cost calculations
  - Job assignment management
  - Statistics and reporting
- **UI Enhancements**
  - Jobs navigation for managers/admins
  - Enhanced clock-in modal with job selection
  - Job status indicators and priority badges
  - Overdue job highlighting
- **Previous Features**
  - Inviting Users sends e-mail
  - Invitation Link sets up new user

## 🔐 Security Implementation

### Firebase Security Rules
- **Multi-tenant isolation**: Complete data separation between organizations
- **Role-based access**: Granular permissions based on user roles
- **Bootstrap-friendly**: Allows initial organization creation
- **Invitation security**: Token-based validation for team onboarding
- **Job security**: Only organization members can view/edit jobs

### Key Security Features
```javascript
// Example: Time logs can only be accessed by organization members
match /timeLogs/{logId} {
  allow read: if isAuthenticated() && 
                 (resource.data.userId == request.auth.uid ||
                  isManagerInSameOrg(resource.data.organizationId));
}

// Jobs can only be managed by managers and admins
match /jobs/{jobId} {
  allow read: if isAuthenticated() && 
                 isInSameOrg(resource.data.organizationId);
  allow write: if isAuthenticated() && 
                  (isManager() || isAdmin()) &&
                  isInSameOrg(resource.data.organizationId);
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
- Job creation and management
- View all jobs dashboard
- Complete/cancel jobs
- Manager and employee invitations
- View job statistics
```

#### 2. Manager Workflow  
```bash
# Login as manager
Email: ilan_danial+manager@outlook.com
Password: manager123

# Test manager features:
- Job creation and management
- Team status overview
- Employee invitations
- Complete/cancel jobs
- View job hours and costs
- Filter jobs by status
```

#### 3. Employee Workflow
```bash
# Login as employee
Email: ilan_danial+employee@outlook.com  
Password: employee123

# Test employee features:
- Clock in with job selection
- View assigned jobs only
- Personal time tracking
- View job information in logs
- Restricted navigation
- No job management access
```

### Feature Testing Checklist
- [x] Multi-tenant organization creation
- [x] Role-based navigation visibility
- [x] Job creation with comprehensive details
- [x] Job management dashboard
- [x] Time tracking with job selection
- [x] Job completion and cancellation
- [x] Job statistics and filtering
- [x] Invitation system end-to-end
- [x] Real-time status updates
- [ ] Database security rules for jobs
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
- **Job caching** for improved dashboard performance

### Database Query Patterns
```typescript
// Efficient: Single organization query with date filtering
query(
  collection(db, 'timeLogs'),
  where('organizationId', '==', orgId),
  where('date', '>=', startDate),
  orderBy('date', 'desc')
)

// Job queries with status filtering
query(
  collection(db, 'jobs'),
  where('organizationId', '==', orgId),
  where('status', '==', 'active'),
  orderBy('createdAt', 'desc')
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

**TimeLink** - Professional time tracking for modern teams with advanced job management. Built with ❤️ using Tauri, React, and Firebase.