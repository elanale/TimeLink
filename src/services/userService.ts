// src/services/userService.ts

import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  updateDoc 
} from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import type { User as FirebaseUser } from "firebase/auth"; 
import { auth, db } from "@/components/firebase";
// --- CHANGE HERE: Import PublicInvitationToken as well ---
import type { User, Invitation, Organization, PublicInvitationToken } from "@/types/models";

export class UserService {
  
  // createAdminUser remains unchanged
  static async createAdminUser(
    firebaseUser: FirebaseUser,
    organizationId: string,
    data: {
      firstName: string;
      lastName: string;
      phone?: string;
    }
  ): Promise<void> {
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
  
  // --- THIS METHOD IS UPDATED ---
  static async createUserFromInvitation(
    firebaseUser: FirebaseUser,
    // CHANGE: The type is now PublicInvitationToken, not Invitation
    invitation: PublicInvitationToken,      
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
      // CHANGE: We now get the name ONLY from the form the user filled out.
      firstName: additionalData.firstName,
      lastName: additionalData.lastName,
      displayName: `${additionalData.firstName} ${additionalData.lastName}`,
      phone: additionalData.phone,
      // CHANGE: These fields are no longer in the public token, so they are removed.
      // department: invitation.department,
      // managerId: invitation.managerId,
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
  
  // getCurrentUser remains unchanged
  static async getCurrentUser(): Promise<(User & { organization?: Organization }) | null> { 
    if (!auth.currentUser) return null;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) return null;
    const userData = { id: userDoc.id, ...userDoc.data() } as User;
    if (userData.organizationId) {
      const orgDoc = await getDoc(doc(db, 'organizations', userData.organizationId));
      return {
        ...userData,
        organization: orgDoc.exists() ? { id: orgDoc.id, ...orgDoc.data() } as Organization : undefined
      };
    }
    return userData;
  }
  
  // updateLastLogin remains unchanged
  static async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}