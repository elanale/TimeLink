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

// Enhanced TimeLog model for better querying and reporting
export interface TimeLog {
  id: string;
  
  // Organization & User info (for efficient querying)
  organizationId: string;
  userId: string;
  userDisplayName: string;
  department?: string;
  jobId?: string;
  jobNumber?: string;
  jobName?: string;

  
  // Time tracking
  clockIn: Timestamp;
  clockOut?: Timestamp;
  totalHours?: number; // Calculated field
  
  // Work details
  clockInNote?: string;   // Daily plan
  clockOutNote?: string;  // Work report
  
  // Metadata
  date: string; // YYYY-MM-DD format for easy querying
  status: 'active' | 'completed' | 'edited';
  
  // Location tracking (future feature)
  clockInLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  clockOutLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  
  // Admin fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
  editedBy?: string; // userId who last edited
  editReason?: string;
}

// For real-time user status tracking
export interface UserStatus {
  id: string; // userId
  organizationId: string;
  
  // Current status
  isActive: boolean;
  currentStatus: 'clocked_out' | 'clocked_in' | 'break';
  lastActivity: Timestamp;
  
  // Current session (if clocked in)
  currentTimeLogId?: string;
  clockedInAt?: Timestamp;
  todaysPlan?: string;
  
  // Quick stats
  todayHours: number;
  weekHours: number;
  
  // Metadata
  updatedAt: Timestamp;
}

// For weekly/monthly summaries
export interface TimeSummary {
  id: string; // userId-YYYY-MM-DD or userId-YYYY-WW format
  
  organizationId: string;
  userId: string;
  userDisplayName: string;
  
  // Time period
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  
  // Statistics
  totalHours: number;
  totalDays: number;
  averageHoursPerDay: number;
  overtimeHours: number;
  
  // Breakdown
  regularHours: number;
  breakTime: number;
  
  // Metadata
  calculatedAt: Timestamp;
}

export interface Job {
  id: string;
  organizationId: string;
  
  // Basic info
  jobNumber: string;
  jobName: string;
  description?: string;
  
  // Status tracking
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  
  // Time estimates
  estimatedHours?: number;
  actualHours?: number; // Calculated from time logs
  
  // Assignment
  assignedEmployees?: string[]; // Array of userIds
  department?: string;
  
  // Timestamps
  createdAt: Timestamp;
  createdBy: string; // userId
  updatedAt: Timestamp;
  startDate?: Timestamp;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string; // userId
  
  // Additional metadata
  notes?: string;
  tags?: string[];
  clientName?: string;
  location?: string;
  
  // Financial (optional)
  budgetedCost?: number;
  actualCost?: number; // Calculated from labor
}

export interface PublicInvitationToken {
  organizationId: string;
  organizationName: string;
  email: string;
  role: 'manager' | 'employee';
  invitedByName: string;
  expiresAt: Timestamp;
  status: 'pending' | 'accepted' | 'expired';
  invitationId: string; // Reference to full invitation
}