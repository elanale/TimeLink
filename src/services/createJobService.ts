// src/services/jobService.ts
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/components/firebase";

export class JobService {
  static async createJob(data: {
    jobNumber: string;
    jobName: string;
    organizationId: string;
    createdBy: string;
  }) {
    return await addDoc(collection(db, "jobs"), {
      jobNumber: data.jobNumber,
      jobName: data.jobName,
      organizationId: data.organizationId,
      createdBy: data.createdBy,
      createdAt: Timestamp.now(),
    });
  }
}
