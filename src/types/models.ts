// src/types/models.ts

import { Timestamp } from "firebase/firestore";

// Organization represents a company/business using TimeLink
export interface Organization {
  id: string;
  name: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large'; // 1-50, 51-200, 200+
  
  // Contact & Address
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  
  // Subscription info (for future use)
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  maxEmployees: number;
  
  // Status
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId of the admin who created it
  
  // Settings
  settings?: {
    workWeekDays: number[]; // [1,2,3,4,5] for Mon-Fri
    dayStartTime: string; // "09:00"
    dayEndTime: string; // "17:00"
    overtimeAfterHours: number; // 40
    requireLocation: boolean;
    autoClockOut: boolean;
    autoClockOutTime: string; // "23:59"
  };
}

// Enhanced User model with organization and role support
export interface User {
  id: string;
  
  // Organization relationship
  organizationId: string;
  role: 'admin' | 'manager' | 'employee';
  
  // Basic info
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  employeeId?: string; // Company's internal ID
  
  // Contact
  phone?: string;
  avatarUrl?: string;
  
  // Work info
  department?: string;
  position?: string;
  managerId?: string; // Direct manager's userId
  hourlyRate?: number;
  
  // Status
  isActive: boolean;
  emailVerified: boolean;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  joinedAt: Timestamp;
  lastLogin?: Timestamp;
  
  // Permissions (for fine-grained control)
  permissions?: {
    canInviteEmployees?: boolean;
    canEditTimeLogs?: boolean;
    canViewReports?: boolean;
    canManageJobs?: boolean;
  };
}

// For invitation flow
export interface Invitation {
  id: string;
  organizationId: string;
  
  // Invitation details
  email: string;
  role: 'manager' | 'employee';
  invitedBy: string; // userId
  invitedByName: string;
  
  // Optional pre-filled data
  firstName?: string;
  lastName?: string;
  department?: string;
  managerId?: string;
  
  // Status
  status: 'pending' | 'accepted' | 'expired';
  token: string; // Unique token for invitation link
  
  // Timestamps
  createdAt: Timestamp;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
}