// src/services/organizationService.ts

import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import { auth, db } from "@/components/firebase";
import type { Organization, User } from "@/types/models";

export class OrganizationService {
  
  // Create a new organization (called during admin signup)
  static async createOrganization(data: {
    name: string;
    email: string;
    industry?: string;
    phone?: string;
  }): Promise<string> {
    const orgId = doc(db, 'organizations').id; // Generate ID
    
    const organization: Omit<Organization, 'id'> = {
      name: data.name,
      email: data.email,
      industry: data.industry,
      phone: data.phone,
      plan: 'free',
      maxEmployees: 10, // Free plan limit
      isActive: true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      createdBy: auth.currentUser!.uid,
      settings: {
        workWeekDays: [1, 2, 3, 4, 5], // Mon-Fri
        dayStartTime: "09:00",
        dayEndTime: "17:00",
        overtimeAfterHours: 40,
        requireLocation: false,
        autoClockOut: true,
        autoClockOutTime: "23:59"
      }
    };
    
    await setDoc(doc(db, 'organizations', orgId), organization);
    return orgId;
  }
  
  // Get organization by ID
  static async getOrganization(orgId: string): Promise<Organization | null> {
    const orgDoc = await getDoc(doc(db, 'organizations', orgId));
    if (!orgDoc.exists()) return null;
    
    return {
      id: orgDoc.id,
      ...orgDoc.data()
    } as Organization;
  }
  
  // Check if organization name is available
  static async isNameAvailable(name: string): Promise<boolean> {
    // You'd implement a query here to check uniqueness
    // For now, simplified version
    return true;
  }
}