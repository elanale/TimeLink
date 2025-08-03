import { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/components/firebase";
import { useAuth } from "@/components/AuthContext";
import { TimeTrackingService } from "@/services/timeTrackingService";

//Interfaces for employee information didplayed in team status
interface EnrichedEmployee extends Employee {
  weekHours: number;
  status: string;
  currentJob: string;
  wage?: number;
}

interface Employee {
  id: string;
  displayName?: string;
  email: string;
  role: "employee" | "manager" | "admin";
  managerId?: string;
  organizationId: string;
  department?: string;
  ManagedBy?: string;
  wage?: number;
}

//Wrapper for the team status dashboard
export default function TeamStatusView() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //Fetching employee data to display
    const fetchEmployees = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("organizationId", "==", profile.organizationId),
          where("role", "==", "employee")
        );

        const snapshot = await getDocs(q);
        const baseEmployees: Employee[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as Employee),
          id: doc.id,
        }));

        const enriched = await Promise.all(
          baseEmployees.map(async (emp) => {
            try {
              const status = await TimeTrackingService.getUserStatus(emp.id);
              return {
                ...emp,
                weekHours: status?.weekHours || 0,
                status: status?.currentStatus || "clocked_out",
                currentJob: status?.todaysPlan || "--",
                wage: emp.wage || 0,
              };
            } catch {
              return {
                ...emp,
                weekHours: 0,
                status: "clocked_out",
                currentJob: "--",
              };
            }
          })
        );

        const filtered = enriched.filter(emp => emp.ManagedBy === "Sarah Johnson");
        setEmployees(filtered);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [profile]);

  //Functionality for managers to force employees to clock out
  const handleForceClockOut = async (empId: string) => {
    try {
      const result = await TimeTrackingService.forceClockOut(empId);
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === empId
            ? {
                ...emp,
                status: "clocked_out",
                currentJob: "--",
                weekHours: result.weekHours,
              }
            : emp
        )
      );
    } catch (err) {
      console.error("Failed to force clock out:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Team Status</h2>
      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <p>No employees found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-md">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-sm">Name</th>
                <th className="px-4 py-2 text-left text-sm">Managed By</th>
                <th className="px-4 py-2 text-left text-sm">Hours This Week</th>
                <th className="px-4 py-2 text-left text-sm">Weekly Earnings</th>
                <th className="px-4 py-2 text-left text-sm">Status</th>
                <th className="px-4 py-2 text-left text-sm">Current Job</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-2">{emp.displayName || emp.email}</td>
                  <td className="px-4 py-2">{emp.ManagedBy || "--"}</td>
                  <td className="px-4 py-2">{emp.weekHours.toFixed(1)}h</td>
                  <td className="px-4 py-2">${((emp.wage || 0) * emp.weekHours).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {emp.status === "clocked_in" && profile?.role !== "employee" ? (
                      <button
                        onClick={() => handleForceClockOut(emp.id)}
                        className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 hover:bg-green-200"
                      >
                        Clocked In (Click to Clock Out)
                      </button>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-200 text-gray-700">
                        Clocked Out
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">{emp.currentJob}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
