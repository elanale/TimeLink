// src/services/invitationService.ts

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  Timestamp,
  orderBy,
  limit
} from "firebase/firestore";
import { db } from "@/components/firebase";

import type { Invitation } from "@/types/models";

export class InvitationService {
  
  // Generate a secure random token
  private static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Create an invitation
  static async createInvitation(data: {
    organizationId: string;
    email: string;
    role: 'manager' | 'employee';
    invitedBy: string;
    invitedByName: string;
    firstName?: string;
    lastName?: string;
    department?: string;
    managerId?: string;
  }): Promise<string> {
    // Check if invitation already exists for this email in this org
    const existingInvite = await this.getActiveInvitationByEmail(
      data.organizationId, 
      data.email
    );
    
    if (existingInvite) {
      throw new Error("An invitation has already been sent to this email address");
    }
    
    // Check if user already exists in organization
    const existingUser = await this.checkUserExists(data.organizationId, data.email);
    if (existingUser) {
      throw new Error("A user with this email already exists in your organization");
    }
    
    const invitationId = doc(collection(db, 'invitations')).id;
    const token = this.generateToken();
    
    const invitation: Omit<Invitation, 'id'> = {
      organizationId: data.organizationId,
      email: data.email.toLowerCase(),
      role: data.role,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      managerId: data.managerId,
      status: 'pending',
      token: token,
      createdAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ),
    };
    
    await setDoc(doc(db, 'invitations', invitationId), invitation);
    
    return token;
  }
  
  // Get invitation by token
  static async getInvitationByToken(token: string): Promise<Invitation | null> {
    const q = query(
      collection(db, 'invitations'),
      where('token', '==', token),
      where('status', '==', 'pending'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const invitation = { id: doc.id, ...doc.data() } as Invitation;
    
    // Check if expired
    if (invitation.expiresAt.toDate() < new Date()) {
      await this.expireInvitation(invitation.id);
      return null;
    }
    
    return invitation;
  }
  
  // Get active invitation by email
  static async getActiveInvitationByEmail(
    organizationId: string, 
    email: string
  ): Promise<Invitation | null> {
    const q = query(
      collection(db, 'invitations'),
      where('organizationId', '==', organizationId),
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Invitation;
  }
  
  // Check if user already exists
  static async checkUserExists(
    organizationId: string, 
    email: string
  ): Promise<boolean> {
    const q = query(
      collection(db, 'users'),
      where('organizationId', '==', organizationId),
      where('email', '==', email.toLowerCase()),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
  
  // Accept invitation
  static async acceptInvitation(invitationId: string): Promise<void> {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });
  }
  
  // Expire invitation
  static async expireInvitation(invitationId: string): Promise<void> {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'expired'
    });
  }
  
  // Get all invitations for an organization
  static async getOrganizationInvitations(
    organizationId: string,
    statusFilter?: 'pending' | 'accepted' | 'expired'
  ): Promise<Invitation[]> {
    let q = query(
      collection(db, 'invitations'),
      where('organizationId', '==', organizationId),
      orderBy('createdAt', 'desc')
    );
    
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invitation));
  }
  
  // Cancel invitation
  static async cancelInvitation(invitationId: string): Promise<void> {
    await updateDoc(doc(db, 'invitations', invitationId), {
      status: 'expired'
    });
  }
  
  // Resend invitation (generates new token)
  static async resendInvitation(invitationId: string): Promise<string> {
    const newToken = this.generateToken();
    
    await updateDoc(doc(db, 'invitations', invitationId), {
      token: newToken,
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ),
      createdAt: serverTimestamp() // Update created time
    });
    
    return newToken;
  }
  
  // Build invitation link
  static buildInvitationLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept-invitation?token=${token}`;
  }
}