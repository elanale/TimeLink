// src/components/Clock.tsx (Enhanced Version)

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { TimeTrackingService } from "@/services/timeTrackingService";
import type { TimeLog, UserStatus } from "@/types/models";
import WorkReport from "./WorkReport";

export default function EmploymentClock() {
  const { user, profile } = useAuth();
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [activeTimeLog, setActiveTimeLog] = useState<TimeLog | null>(null);
  const [recentTimeLogs, setRecentTimeLogs] = useState<TimeLog[]>([]);
  const [reportMode, setReportMode] = useState<null | "in" | "out">(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load user status and recent logs
  const loadUserData = async () => {
    if (!user || !profile) return;
    
    try {
      setLoading(true);
      
      // Get current status
      const status = await TimeTrackingService.getUserStatus(user.uid);
      setUserStatus(status);
      
      // Get active time log if exists
      const activeLog = await TimeTrackingService.getActiveTimeLog(user.uid);
      setActiveTimeLog(activeLog);
      
      // Get recent time logs (last 7 days)
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const logs = await TimeTrackingService.getUserTimeLogs(user.uid, startDate, endDate);
      setRecentTimeLogs(logs);
      
    } catch (err: any) {
      console.error("Error loading user data:", err);
      setError(err.message || "Failed to load time tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, profile]);

  const handleClockIn = async (plan?: string) => {
    if (!user || !profile) return;
    
    try {
      setError("");
      await TimeTrackingService.clockIn(
        user.uid,
        profile.organizationId,
        profile.displayName || profile.email,
        plan,
        profile.department
      );
      
      // Reload data to reflect changes
      await loadUserData();
    } catch (err: any) {
      setError(err.message || "Failed to clock in");
    }
  };

  const handleClockOut = async (report?: string) => {
    if (!user) return;
    
    try {
      setError("");
      await TimeTrackingService.clockOut(user.uid, report);
      
      // Reload data to reflect changes
      await loadUserData();
    } catch (err: any) {
      setError(err.message || "Failed to clock out");
    }
  };

  const handleReport = () => {
    if (activeTimeLog) {
      setReportMode("out");
    } else {
      setReportMode("in");
    }
  };

  const handleReportSave = async (payload: { plan?: string; report?: string }) => {
    try {
      if (reportMode === "in") {
        await handleClockIn(payload.plan);
      } else {
        await handleClockOut(payload.report);
      }
      setReportMode(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md max-w-md mx-auto text-center">
        <p className="text-gray-600 dark:text-gray-300">Loading time tracking data...</p>
      </div>
    );
  }

  const isCurrentlyClockedIn = activeTimeLog && userStatus?.currentStatus === 'clocked_in';
  const todayHours = userStatus?.todayHours || 0;
  const weekHours = userStatus?.weekHours || 0;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        Time Tracking
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Current Status Card */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Status
            </h2>
            <p className={`text-sm font-medium ${
              isCurrentlyClockedIn 
                ? "text-green-600 dark:text-green-400" 
                : "text-gray-600 dark:text-gray-400"
            }`}>
              {isCurrentlyClockedIn ? "Clocked In" : "Clocked Out"}
            </p>
          </div>
          
          <button
            onClick={handleReport}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              isCurrentlyClockedIn
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isCurrentlyClockedIn ? "Clock Out" : "Clock In"}
          </button>
        </div>

        {/* Active Session Info */}
        {activeTimeLog && (
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <p>
              <span className="font-medium">Clocked in at:</span>{" "}
              {activeTimeLog.clockIn.toDate().toLocaleTimeString()}
            </p>
            {activeTimeLog.clockInNote && (
              <p>
                <span className="font-medium">Current Job:</span>{" "}
                {activeTimeLog.clockInNote}
              </p>
            )}
            <p>
              <span className="font-medium">Current session:</span>{" "}
              {Math.round(((new Date().getTime() - activeTimeLog.clockIn.toDate().getTime()) / (1000 * 60 * 60)) * 100) / 100} hours
            </p>
          </div>
        )}
      </div>

      {/* Time Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {todayHours.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">Today</p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {weekHours.toFixed(1)}h
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">This Week</p>
        </div>
      </div>

      {/* Recent Time Logs */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Recent Time Logs
        </h3>
        
        {recentTimeLogs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No time logs found for the past week
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Clock In
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Clock Out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {recentTimeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {log.clockIn.toDate().toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {log.clockOut 
                        ? log.clockOut.toDate().toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : "--"
                      }
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {log.totalHours ? `${log.totalHours.toFixed(2)}h` : "--"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : log.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Work Report Modal */}
      <WorkReport
        isOpen={reportMode !== null}
        status={reportMode!}
        onSave={handleReportSave}
        onClose={() => setReportMode(null)}
      />
    </div>
  );
}