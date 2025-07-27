// src/services/jobService.ts

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
  serverTimestamp,
  Timestamp,
  writeBatch,
  deleteDoc,
  limit
} from "firebase/firestore";
import { db } from "@/components/firebase";
import type { Job, TimeLog } from "@/types/models";

export class JobService {
  
  // Create a new job
  static async createJob(data: {
    organizationId: string;
    jobNumber: string;
    jobName: string;
    description?: string;
    createdBy: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    assignedEmployees?: string[];
    department?: string;
    startDate?: Date;
    dueDate?: Date;
    clientName?: string;
    location?: string;
    notes?: string;
    tags?: string[];
  }): Promise<string> {
    // Check if job number already exists
    const existingJob = await this.getJobByNumber(data.organizationId, data.jobNumber);
    if (existingJob) {
      throw new Error("A job with this number already exists");
    }
    
    const jobId = doc(collection(db, 'jobs')).id;
    
    const job: Omit<Job, 'id'> = {
      organizationId: data.organizationId,
      jobNumber: data.jobNumber,
      jobName: data.jobName,
      description: data.description,
      status: 'active',
      priority: data.priority || 'medium',
      estimatedHours: data.estimatedHours,
      actualHours: 0,
      assignedEmployees: data.assignedEmployees,
      department: data.department,
      createdAt: serverTimestamp() as Timestamp,
      createdBy: data.createdBy,
      updatedAt: serverTimestamp() as Timestamp,
      startDate: data.startDate ? Timestamp.fromDate(data.startDate) : undefined,
      dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : undefined,
      clientName: data.clientName,
      location: data.location,
      notes: data.notes,
      tags: data.tags,
      budgetedCost: 0,
      actualCost: 0
    };
    
    await setDoc(doc(db, 'jobs', jobId), job);
    return jobId;
  }
  
  // Get all jobs for an organization
  static async getOrganizationJobs(
    organizationId: string,
    statusFilter?: 'active' | 'completed' | 'cancelled' | 'paused'
  ): Promise<Job[]> {
    let q = query(
      collection(db, 'jobs'),
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
    } as Job));
  }
  
  // Get active jobs count
  static async getActiveJobsCount(organizationId: string): Promise<number> {
    const q = query(
      collection(db, 'jobs'),
      where('organizationId', '==', organizationId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size;
  }
  
  // Get job by ID
  static async getJobById(jobId: string): Promise<Job | null> {
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) return null;
    
    return {
      id: jobDoc.id,
      ...jobDoc.data()
    } as Job;
  }
  
  // Get job by number
  static async getJobByNumber(organizationId: string, jobNumber: string): Promise<Job | null> {
    const q = query(
      collection(db, 'jobs'),
      where('organizationId', '==', organizationId),
      where('jobNumber', '==', jobNumber),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const docSnap = snapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Job;
  }
  
  // Update job status
  static async updateJobStatus(
    jobId: string,
    status: 'active' | 'completed' | 'cancelled' | 'paused',
    userId: string
  ): Promise<void> {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (status === 'completed') {
      updateData.completedAt = serverTimestamp();
      updateData.completedBy = userId;
      
      // Calculate actual hours from time logs
      const actualHours = await this.calculateJobHours(jobId);
      updateData.actualHours = actualHours;
    }
    
    await updateDoc(doc(db, 'jobs', jobId), updateData);
  }
  
  // Complete a job
  static async completeJob(jobId: string, userId: string, notes?: string): Promise<void> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error("Job not found");
    
    if (job.status === 'completed') {
      throw new Error("Job is already completed");
    }
    
    const actualHours = await this.calculateJobHours(jobId);
    const actualCost = await this.calculateJobCost(jobId);
    
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'completed',
      completedAt: serverTimestamp(),
      completedBy: userId,
      actualHours,
      actualCost,
      notes: notes || job.notes,
      updatedAt: serverTimestamp()
    });
  }
  
  // Cancel a job
  static async cancelJob(jobId: string, userId: string, reason?: string): Promise<void> {
    const job = await this.getJobById(jobId);
    if (!job) throw new Error("Job not found");
    
    if (job.status === 'completed') {
      throw new Error("Cannot cancel a completed job");
    }
    
    await updateDoc(doc(db, 'jobs', jobId), {
      status: 'cancelled',
      notes: reason ? `${job.notes || ''}\n\nCancellation reason: ${reason}` : job.notes,
      updatedAt: serverTimestamp()
    });
  }
  
  // Get all time logs for a job
  static async getJobTimeLogs(jobId: string): Promise<TimeLog[]> {
    const q = query(
      collection(db, 'timeLogs'),
      where('jobId', '==', jobId),
      orderBy('clockIn', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimeLog));
  }
  
  // Calculate total hours logged for a job
  static async calculateJobHours(jobId: string): Promise<number> {
    const timeLogs = await this.getJobTimeLogs(jobId);
    
    return timeLogs
      .filter(log => log.status === 'completed' && log.totalHours)
      .reduce((total, log) => total + (log.totalHours || 0), 0);
  }
  
  // Calculate labor cost for a job
  static async calculateJobCost(jobId: string): Promise<number> {
    const timeLogs = await this.getJobTimeLogs(jobId);
    
    // This is a simplified calculation
    // In a real implementation, you'd need to:
    // 1. Get the hourly rate for each employee
    // 2. Account for overtime rates
    // 3. Include any additional costs
    
    let totalCost = 0;
    
    for (const log of timeLogs) {
      if (log.status === 'completed' && log.totalHours) {
        // Get user's hourly rate (simplified - assuming $25/hour default)
        // In production, fetch from user profile
        const hourlyRate = 25; // Default rate
        totalCost += log.totalHours * hourlyRate;
      }
    }
    
    return Math.round(totalCost * 100) / 100; // Round to 2 decimal places
  }
  
  // Update job assignment
  static async updateJobAssignment(
    jobId: string,
    assignedEmployees: string[]
  ): Promise<void> {
    await updateDoc(doc(db, 'jobs', jobId), {
      assignedEmployees,
      updatedAt: serverTimestamp()
    });
  }
  
  // Get jobs assigned to an employee
  static async getEmployeeJobs(
    organizationId: string,
    employeeId: string,
    statusFilter?: 'active' | 'completed' | 'cancelled' | 'paused'
  ): Promise<Job[]> {
    let q = query(
      collection(db, 'jobs'),
      where('organizationId', '==', organizationId),
      where('assignedEmployees', 'array-contains', employeeId),
      orderBy('createdAt', 'desc')
    );
    
    if (statusFilter) {
      q = query(q, where('status', '==', statusFilter));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Job));
  }
  
  // Get job statistics for dashboard
  static async getJobStatistics(organizationId: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    overdueJobs: number;
    totalHours: number;
    totalCost: number;
  }> {
    const jobs = await this.getOrganizationJobs(organizationId);
    const now = new Date();
    
    const stats = {
      totalJobs: jobs.length,
      activeJobs: 0,
      completedJobs: 0,
      overdueJobs: 0,
      totalHours: 0,
      totalCost: 0
    };
    
    for (const job of jobs) {
      if (job.status === 'active') {
        stats.activeJobs++;
        
        // Check if overdue
        if (job.dueDate && job.dueDate.toDate() < now) {
          stats.overdueJobs++;
        }
      } else if (job.status === 'completed') {
        stats.completedJobs++;
      }
      
      stats.totalHours += job.actualHours || 0;
      stats.totalCost += job.actualCost || 0;
    }
    
    return stats;
  }
  
  // Delete a job (admin only)
  static async deleteJob(jobId: string): Promise<void> {
    // Note: In production, you might want to soft delete instead
    // by setting a 'deleted' flag rather than removing the document
    await deleteDoc(doc(db, 'jobs', jobId));
  }
}