// src/services/timeTrackingService.ts - FIXED IMPORTS

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/components/firebase";
// FIXED: Import from models instead of timeTracking
import type { TimeLog, UserStatus, TimeSummary } from "@/types/models";

export class TimeTrackingService {

  // Clock In - Create new time log entry
  static async clockIn(
    userId: string,
    organizationId: string,
    userDisplayName: string,
    plan?: string,
    department?: string
  ): Promise<string> {
    // Check if user is already clocked in
    const activeLog = await this.getActiveTimeLog(userId);
    if (activeLog) {
      throw new Error("You are already clocked in. Please clock out first.");
    }
    
    const timeLogId = doc(collection(db, 'timeLogs')).id;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    const timeLog: Omit<TimeLog, 'id'> = {
      organizationId,
      userId,
      userDisplayName,
      department,
      clockIn: Timestamp.fromDate(now),
      clockInNote: plan,
      date: dateStr,
      status: 'active',
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    const batch = writeBatch(db);
    
    // Create time log
    batch.set(doc(db, 'timeLogs', timeLogId), timeLog);
    
    // Update user status
    const userStatus: Omit<UserStatus, 'id'> = {
      organizationId,
      isActive: true,
      currentStatus: 'clocked_in',
      lastActivity: serverTimestamp() as Timestamp,
      currentTimeLogId: timeLogId,
      clockedInAt: Timestamp.fromDate(now),
      todaysPlan: plan,
      todayHours: await this.calculateTodayHours(userId, dateStr),
      weekHours: await this.calculateWeekHours(userId, dateStr),
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    batch.set(doc(db, 'userStatus', userId), userStatus);
    
    await batch.commit();
    return timeLogId;
  }
  
  static async forceClockOut(userId: string) {
  const statusRef = doc(db, "userStatus", userId);
  const statusSnap = await getDoc(statusRef);
  const currentTimeLogId = statusSnap.data()?.currentTimeLogId;

  if (!currentTimeLogId) {
    throw new Error("No active time log to force clock out.");
  }

  const timeLogRef = doc(db, "timeLogs", currentTimeLogId);
  const timeLogSnap = await getDoc(timeLogRef);
  const clockInTime = timeLogSnap.data()?.clockIn?.toDate?.();

  if (!clockInTime) {
    throw new Error("Invalid clock-in time.");
  }

  const now = new Date();
  const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

  await updateDoc(timeLogRef, {
    clockOut: now,
    totalHours: Math.round(totalHours * 100) / 100,
    status: "completed",
    updatedAt: new Date(),
  });

  await updateDoc(statusRef, {
    currentStatus: "clocked_out",
    clockedInAt: null,
    currentTimeLogId: null,
    todaysPlan: null,
    updatedAt: new Date(),
  });
  
  }

  // Clock Out - Complete time log entry
  static async clockOut(
    userId: string,
    report?: string
  ): Promise<void> {
    const activeLog = await this.getActiveTimeLog(userId);
    if (!activeLog) {
      throw new Error("No active time log found. Please clock in first.");
    }
    
    const now = new Date();
    const clockInTime = activeLog.clockIn.toDate();
    const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    
    const batch = writeBatch(db);
    
    // Update time log
    const logUpdateData: any = {
    clockOut: Timestamp.fromDate(now),
    totalHours: Math.round(totalHours * 100) / 100,
    status: 'completed',
    updatedAt: serverTimestamp(),
  };
    //if (activeLog.clockInNote) {
      //await this.updateJobActualHours(activeLog.clockInNote, activeLog.organizationId, totalHours);
    //}
    if (report) {
      logUpdateData.clockOutNote = report;
    }

    batch.update(doc(db, 'timeLogs', activeLog.id), logUpdateData);

    
    // Update user status
    const dateStr = now.toISOString().split('T')[0];
    batch.update(doc(db, 'userStatus', userId), {
      currentStatus: 'clocked_out',
      lastActivity: serverTimestamp(),
      currentTimeLogId: null,
      clockedInAt: null,
      todaysPlan: null,
      todayHours: await this.calculateTodayHours(userId, dateStr) + totalHours,
      weekHours: await this.calculateWeekHours(userId, dateStr) + totalHours,
      updatedAt: serverTimestamp(),
    });
    
    await batch.commit();
  }
  
  // Get active (ongoing) time log for user
  static async getActiveTimeLog(userId: string): Promise<TimeLog | null> {
    const q = query(
      collection(db, 'timeLogs'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as TimeLog;
  }
  

  static async getUserTimeLogs(
  userId: string,
  startDate: string,
  endDate: string
): Promise<TimeLog[]> {
  // SIMPLIFIED QUERY - Remove the dual orderBy that's causing issues
  const q = query(
    collection(db, 'timeLogs'),
    where('userId', '==', userId),
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'desc')  // Only order by date, remove clockIn orderBy
    // Removed: orderBy('clockIn', 'desc') - this was causing the complex index requirement
  );
  
  const snapshot = await getDocs(q);
  
  // Sort by clockIn in JavaScript after fetching (if needed)
  const logs = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  } as TimeLog));
  
  // Sort by clockIn time in JavaScript
  return logs.sort((a, b) => {
    // First sort by date (desc), then by clockIn time (desc)
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.clockIn.toMillis() - a.clockIn.toMillis();
  });
}

  
  // Get current team status (for managers)
  static async getTeamStatus(organizationId: string): Promise<UserStatus[]> {
    const q = query(
      collection(db, 'userStatus'),
      where('organizationId', '==', organizationId),
      orderBy('lastActivity', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    } as UserStatus));
  }
  
  // Get user's current status
  static async getUserStatus(userId: string): Promise<UserStatus | null> {
    const statusDoc = await getDoc(doc(db, 'userStatus', userId));
    if (!statusDoc.exists()) return null;
    
    return {
      id: statusDoc.id,
      ...statusDoc.data()
    } as UserStatus;
  }
  
  // Calculate today's hours for a user
  static async calculateTodayHours(userId: string, date: string): Promise<number> {
    const logs = await this.getUserTimeLogs(userId, date, date);
    return logs
      .filter(log => log.totalHours)
      .reduce((total, log) => total + (log.totalHours || 0), 0);
  }
  
  // Calculate week's hours for a user
  static async calculateWeekHours(userId: string, date: string): Promise<number> {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = this.getEndOfWeek(date);
    
    const logs = await this.getUserTimeLogs(userId, startOfWeek, endOfWeek);
    return logs
      .filter(log => log.totalHours)
      .reduce((total, log) => total + (log.totalHours || 0), 0);
  }
  
  // Admin function: Edit time log
  static async editTimeLog(
    timeLogId: string,
    updates: Partial<Pick<TimeLog, 'clockIn' | 'clockOut' | 'clockInNote' | 'clockOutNote'>>,
    editedBy: string,
    editReason: string
  ): Promise<void> {
    const updateData: any = {
      ...updates,
      status: 'edited',
      editedBy,
      editReason,
      updatedAt: serverTimestamp(),
    };
    
    // Recalculate total hours if clock times changed
    if (updates.clockIn || updates.clockOut) {
      const logDoc = await getDoc(doc(db, 'timeLogs', timeLogId));
      if (logDoc.exists()) {
        const logData = logDoc.data() as TimeLog;
        const clockIn = updates.clockIn?.toDate() || logData.clockIn.toDate();
        const clockOut = updates.clockOut?.toDate() || logData.clockOut?.toDate();
        
        if (clockOut) {
          const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
          updateData.totalHours = Math.round(totalHours * 100) / 100;
        }
      }
    }
    
    await updateDoc(doc(db, 'timeLogs', timeLogId), updateData);
  }
  
  // Delete time log (admin only)
  static async deleteTimeLog(timeLogId: string): Promise<void> {
    await deleteDoc(doc(db, 'timeLogs', timeLogId));
  }
  
  // Helper functions
  private static getStartOfWeek(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    const startOfWeek = new Date(date.setDate(diff));
    return startOfWeek.toISOString().split('T')[0];
  }
  
  private static getEndOfWeek(dateStr: string): string {
    const startOfWeek = new Date(this.getStartOfWeek(dateStr));
    const endOfWeek = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000);
    return endOfWeek.toISOString().split('T')[0];
  }
  
private static async updateJobActualHours(jobNumber: string, orgId: string, hoursToAdd: number) {
  const q = query(
    collection(db, 'jobs'),
    where('organizationId', '==', orgId),
    where('jobNumber', '==', jobNumber),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    const jobDoc = snapshot.docs[0];
    const jobRef = doc(db, 'jobs', jobDoc.id);

    const current = jobDoc.data().actualHours || 0;

    await updateDoc(jobRef, {
      actualHours: current + hoursToAdd
    });
  }
}

  // Generate time summary for reporting
  static async generateTimeSummary(
    userId: string,
    organizationId: string,
    startDate: string,
    endDate: string,
    type: 'daily' | 'weekly' | 'monthly'
  ): Promise<TimeSummary> {
    const logs = await this.getUserTimeLogs(userId, startDate, endDate);
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userDisplayName = userDoc.exists() ? userDoc.data().displayName : 'Unknown User';
    
    const totalHours = logs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
    const totalDays = new Set(logs.map(log => log.date)).size;
    
    const summary: Omit<TimeSummary, 'id'> = {
      organizationId,
      userId,
      userDisplayName,
      type,
      startDate,
      endDate,
      totalHours: Math.round(totalHours * 100) / 100,
      totalDays,
      averageHoursPerDay: totalDays > 0 ? Math.round((totalHours / totalDays) * 100) / 100 : 0,
      overtimeHours: Math.max(0, totalHours - (totalDays * 8)), // Assuming 8hr standard day
      regularHours: Math.min(totalHours, totalDays * 8),
      breakTime: 0, // To be implemented with break tracking
      calculatedAt: serverTimestamp() as Timestamp,
    };
    
    return summary as TimeSummary;
  }
}