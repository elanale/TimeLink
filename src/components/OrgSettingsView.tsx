import { useEffect, useState } from "react";
import { getDocs, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "@/components/firebase";
import { useAuth } from "@/components/AuthContext";
import { TimeTrackingService } from "@/services/timeTrackingService";

//Interfaces for employee data to be displayed
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

interface EnrichedEmployee extends Employee {
  weekHours: number;
}

interface EditableFields {
  wage: number;
  weekHours: number;
  ManagedBy: string;
}

//Wrapper function for the organization settings dashboard
export default function OrgSettingsView() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState<EnrichedEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<Record<string, EditableFields>>({});

  useEffect(() => {
      //Fetch employee data from database
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
              };
            } catch {
              return {
                ...emp,
                weekHours: 0,
              };
            }
          })
        );

        setEmployees(enriched);

        const editableCopy: Record<string, EditableFields> = {};
        enriched.forEach((emp) => {
          editableCopy[emp.id] = {
            wage: emp.wage || 0,
            weekHours: emp.weekHours,
            ManagedBy: emp.ManagedBy || "",
          };
        });
        setEditableData(editableCopy);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [profile]);

  const handleInputChange = (
    id: string,
    field: keyof EditableFields,
    value: string | number
  ) => {
    setEditableData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: typeof value === "string" ? value : Number(value),
      },
    }));
  };
  //Save button for edits made by admin to employee data
  const handleSave = async () => {
    try {
      await Promise.all(
        employees.map(async (emp) => {
          const { wage, ManagedBy } = editableData[emp.id];
          const updates: Partial<Employee> = {};

          if (wage !== emp.wage) updates.wage = wage;
          if (ManagedBy !== emp.ManagedBy) updates.ManagedBy = ManagedBy;

          if (Object.keys(updates).length > 0) {
            await updateDoc(doc(db, "users", emp.id), updates);
          }
        })
      );

      setEmployees((prev) =>
        prev.map((emp) => ({
          ...emp,
          wage: editableData[emp.id].wage,
          weekHours: editableData[emp.id].weekHours,
          ManagedBy: editableData[emp.id].ManagedBy,
        }))
      );

      setIsEditing(false);
    } catch (err) {
      console.error("Error saving changes:", err);
    }
  };

  //Cancel button
  const handleCancel = () => {
    const resetCopy: Record<string, EditableFields> = {};
    employees.forEach((emp) => {
      resetCopy[emp.id] = {
        wage: emp.wage || 0,
        weekHours: emp.weekHours,
        ManagedBy: emp.ManagedBy || "",
      };
    });
    setEditableData(resetCopy);
    setIsEditing(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Organization Employee Overview</h2>
        {isEditing ? (
          <div className="space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Edit
          </button>
        )}
      </div>

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
                <th className="px-4 py-2 text-left text-sm">Wage ($/hr)</th>
                <th className="px-4 py-2 text-left text-sm">Hours This Week</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-2">{emp.displayName || emp.email}</td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-32 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
                        value={editableData[emp.id]?.ManagedBy ?? ""}
                        onChange={(e) =>
                          handleInputChange(emp.id, "ManagedBy", e.target.value)
                        }
                      />
                    ) : (
                      emp.ManagedBy || "--"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-24 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
                        value={editableData[emp.id]?.wage ?? 0}
                        onChange={(e) =>
                          handleInputChange(emp.id, "wage", parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      `$${emp.wage?.toFixed(2) ?? "--"}`
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {isEditing ? (
                      <input
                        type="number"
                        className="w-24 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700"
                        value={editableData[emp.id]?.weekHours ?? 0}
                        onChange={(e) =>
                          handleInputChange(emp.id, "weekHours", parseFloat(e.target.value) || 0)
                        }
                      />
                    ) : (
                      `${emp.weekHours.toFixed(1)}h`
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
