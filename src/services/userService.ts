// src/services/userService.ts

import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  updateDoc 
} from "firebase/firestore";
// We import all types with `import type` for best practice
import type { Timestamp } from "firebase/firestore";
// FIX: Import the 'User' type from the auth SDK and rename it to 'FirebaseUser'
import type { User as FirebaseUser } from "firebase/auth"; 
import { auth, db } from "@/components/firebase";
// FIX: Also import 'Invitation' and 'Organization' types
import type { User, Invitation, Organization } from "@/types/models";

export class UserService {
  
  // Create admin user (during organization signup)
  static async createAdminUser(
    firebaseUser: FirebaseUser, // Use the renamed FirebaseUser type
    organizationId: string,
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ): Promise<void> {
    // The type `User` now correctly refers to our custom model
    const user: Omit<User, 'id'> = {
      organizationId,
      role: 'admin',
      email: firebaseUser.email!,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      isActive: true,
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      joinedAt: serverTimestamp() as Timestamp,
      permissions: {
        canInviteEmployees: true,
        canEditTimeLogs: true,
        canViewReports: true,
        canManageJobs: true
      }
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), user);
  }
  
  // Create user from invitation
  static async createUserFromInvitation(
    firebaseUser: FirebaseUser, // Use the renamed FirebaseUser type
    invitation: Invitation,      // FIX: Use the specific Invitation type instead of 'any'
    additionalData: {
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ): Promise<void> {
    const user: Omit<User, 'id'> = {
      organizationId: invitation.organizationId,
      role: invitation.role,
      email: firebaseUser.email!,
      firstName: invitation.firstName || additionalData.firstName,
      lastName: invitation.lastName || additionalData.lastName,
      displayName: `${additionalData.firstName} ${additionalData.lastName}`,
      phone: additionalData.phone,
      department: invitation.department,
      managerId: invitation.managerId,
      isActive: true,
      emailVerified: firebaseUser.emailVerified,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      joinedAt: serverTimestamp() as Timestamp,
      permissions: {
        canInviteEmployees: invitation.role === 'manager',
        canEditTimeLogs: false,
        canViewReports: invitation.role === 'manager',
        canManageJobs: invitation.role === 'manager'
      }
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), user);
  }
  
  // Get current user with organization data
  // FIX: Improved return type for full type safety
  static async getCurrentUser(): Promise<(User & { organization?: Organization }) | null> { 
    if (!auth.currentUser) return null;
    
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) return null;
    
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    } as User;
    
    // FIX: Add a check to prevent crashing if organizationId is missing
    if (userData.organizationId) {
      const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
      
      return {
        ...userData,
        organization: orgDoc.exists() ? { id: orgDoc.id, ...orgDoc.data() } as Organization : undefined
      };
    }

    // Return user without organization if no ID is present
    return userData;
  }
  
  // Update last login
  static async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}