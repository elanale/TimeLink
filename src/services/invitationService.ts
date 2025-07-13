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
  limit,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/components/firebase";
import type { Invitation, PublicInvitationToken } from "@/types/models";

export class InvitationService {

  private static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

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
  }): Promise<{ token: string; link: string }> {
    const existingInvite = await this.getActiveInvitationByEmail(data.organizationId, data.email);
    if (existingInvite) {
      throw new Error("An active invitation has already been sent to this email address.");
    }
    const existingUser = await this.checkUserExists(data.organizationId, data.email);
    if (existingUser) {
      throw new Error("A user with this email already exists in your organization.");
    }
    const orgDoc = await getDoc(doc(db, 'organizations', data.organizationId));
    if (!orgDoc.exists()) { throw new Error("Organization not found"); }
    const organizationName = orgDoc.data().name;

    const invitationId = doc(collection(db, 'invitations')).id;
    const token = this.generateToken();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

    const batch = writeBatch(db);

    const publicToken: PublicInvitationToken = {
      organizationId: data.organizationId,
      organizationName,
      email: data.email.toLowerCase(),
      role: data.role,
      invitedByName: data.invitedByName,
      expiresAt,
      status: 'pending',
      invitationId,
    };
    batch.set(doc(db, 'invitationTokens', token), publicToken);

    const invitation: Omit<Invitation, 'id' | 'token'> = {
      organizationId: data.organizationId,
      email: data.email.toLowerCase(),
      role: data.role,
      invitedBy: data.invitedBy,
      invitedByName: data.invitedByName,
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      expiresAt,
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.department && { department: data.department }),
      ...(data.managerId && { managerId: data.managerId }),
    };
    batch.set(doc(db, 'invitations', invitationId), invitation);

    await batch.commit();
    const link = `${window.location.origin}/finishSignUp?token=${token}`;
    return { token, link };
  }

  // In src/services/invitationService.ts

static async getPublicInvitationByToken(token: string): Promise<PublicInvitationToken | null> {
    console.log("SERVICE: Attempting to get public token:", token); // Log entry
    const tokenDocRef = doc(db, 'invitationTokens', token);

    try {
        const tokenDoc = await getDoc(tokenDocRef);

        if (!tokenDoc.exists()) {
            console.log("SERVICE: Document not found.");
            return null;
        }
        
        console.log("SERVICE: Document found. Raw data:", tokenDoc.data());
        const publicInvite = tokenDoc.data() as PublicInvitationToken;

        // Check the status
        console.log(`SERVICE: Checking status. Is '${publicInvite.status}' === 'pending'?`, publicInvite.status === 'pending');
        if (publicInvite.status !== 'pending') {
            return null;
        }

        // Check the expiration
        console.log("SERVICE: Checking expiration. Raw expiresAt field:", publicInvite.expiresAt);
        if (!publicInvite.expiresAt || typeof publicInvite.expiresAt.toDate !== 'function') {
            console.error("FATAL: 'expiresAt' is not a valid Firestore Timestamp object!");
            return null;
        }
        const expiryDate = publicInvite.expiresAt.toDate();
        const now = new Date();
        console.log(`SERVICE: Is expiry date (${expiryDate}) < now (${now})?`, expiryDate < now);
        if (expiryDate < now) {
            return null;
        }
        
        console.log("SERVICE: All checks passed. Returning public invitation.");
        return publicInvite;

    } catch (error) {
        console.error("SERVICE: An unexpected error occurred inside getPublicInvitationByToken:", error);
        return null;
    }
}

  static async getInvitationById(invitationId: string): Promise<Invitation | null> {
    const inviteDoc = await getDoc(doc(db, 'invitations', invitationId));
    if (!inviteDoc.exists()) return null;
    return { id: inviteDoc.id, ...inviteDoc.data() } as Invitation;
  }

  static async getActiveInvitationByEmail(organizationId: string, email: string): Promise<Invitation | null> {
    const q = query(collection(db, 'invitations'), where('organizationId', '==', organizationId), where('email', '==', email.toLowerCase()), where('status', '==', 'pending'), limit(1));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Invitation;
  }

  static async checkUserExists(organizationId: string, email: string): Promise<boolean> {
    const q = query(collection(db, 'users'), where('organizationId', '==', organizationId), where('email', '==', email.toLowerCase()), limit(1));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }

  static async acceptInvitation(invitationId: string, token: string): Promise<void> {
    const batch = writeBatch(db);
    batch.update(doc(db, 'invitations', invitationId), { status: 'accepted', acceptedAt: serverTimestamp() });
    batch.update(doc(db, 'invitationTokens', token), { status: 'accepted' });
    await batch.commit();
  }

  static async markInvitationAsAccepted(token: string, invitationId: string): Promise<void> {
    await this.acceptInvitation(invitationId, token);
  }

  static async expireInvitation(invitationId: string, token: string): Promise<void> {
    const batch = writeBatch(db);
    batch.update(doc(db, 'invitations', invitationId), { status: 'expired' });
    batch.update(doc(db, 'invitationTokens', token), { status: 'expired' });
    await batch.commit();
  }

  static async getOrganizationInvitations(organizationId: string, statusFilter?: 'pending' | 'accepted' | 'expired'): Promise<Invitation[]> {
    let q = query(collection(db, 'invitations'), where('organizationId', '==', organizationId), orderBy('createdAt', 'desc'));
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invitation));
  }

  static buildInvitationLink(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/accept-invitation?token=${token}`;
  }

  // --- ADDED THIS METHOD ---
  static async cancelInvitation(invitationId: string): Promise<void> {
    const q = query(collection(db, 'invitationTokens'), where('invitationId', '==', invitationId), where('status', '==', 'pending'), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
        // If no pending token, maybe it was already accepted or expired. Just update the private doc.
        await updateDoc(doc(db, 'invitations', invitationId), { status: 'expired' });
        return;
    }
    
    const token = snapshot.docs[0].id;
    await this.expireInvitation(invitationId, token);
  }

  // --- ADDED THIS METHOD ---
  static async resendInvitation(invitationId: string): Promise<string> {
    const inviteDoc = await getDoc(doc(db, 'invitations', invitationId));
    if (!inviteDoc.exists()) { throw new Error("Invitation not found"); }

    const inviteData = inviteDoc.data();
    const orgDoc = await getDoc(doc(db, 'organizations', inviteData.organizationId));
    if (!orgDoc.exists()) { throw new Error("Organization not found"); }
    const organizationName = orgDoc.data().name;

    // Find and delete the old token associated with this invitation
    const q = query(collection(db, 'invitationTokens'), where('invitationId', '==', invitationId), limit(1));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(doc(db, 'invitationTokens', snapshot.docs[0].id));
    }

    const newToken = this.generateToken();
    const newExpiresAt = Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    const batch = writeBatch(db);

    const publicToken: PublicInvitationToken = {
      organizationId: inviteData.organizationId,
      organizationName,
      email: inviteData.email,
      role: inviteData.role,
      invitedByName: inviteData.invitedByName,
      expiresAt: newExpiresAt,
      status: 'pending',
      invitationId: invitationId,
    };
    batch.set(doc(db, 'invitationTokens', newToken), publicToken);

    // Update the private invitation with the new expiration and set status to pending
    batch.update(doc(db, 'invitations', invitationId), {
      expiresAt: newExpiresAt,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    await batch.commit();
    return newToken;
  }
}