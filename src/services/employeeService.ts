import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
} from "firebase/database";
import { db, auth } from "@/firebase";
import { getCurrentUser } from "./authService";
import { Employee } from "@/pages/superadmin/types";

// Helper function to sanitize email for Realtime Database path
const sanitizeEmail = (email: string): string => {
  return email.replace(/[@.]/g, '_');
};

// Get current user path (sanitized email)
export const getCurrentUserPath = (): string => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }
  return sanitizeEmail(user.email);
};

// Get all employees for current user
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const userPath = getCurrentUserPath();
    const employeesRef = ref(db, `users/${userPath}/employees`);
    const snapshot = await get(employeesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const employeesData = snapshot.val();
    const employees: Employee[] = Object.keys(employeesData).map(key => ({
      id: parseInt(key),
      ...employeesData[key],
    }));

    // Sort by join date descending
    employees.sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime());

    return employees;
  } catch (error) {
    console.error("Error getting employees:", error);
    return [];
  }
};

// Add new employee
export const addEmployee = async (data: Omit<Employee, "id">): Promise<string> => {
  try {
    const userPath = getCurrentUserPath();
    const employeesRef = ref(db, `users/${userPath}/employees`);
    const newEmployeeRef = push(employeesRef);

    await set(newEmployeeRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newEmployeeRef.key!;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw new Error("Failed to add employee");
  }
};

// Update employee
export const updateEmployee = async (employeeId: string, data: Partial<Employee>): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const employeeRef = ref(db, `users/${userPath}/employees/${employeeId}`);

    await update(employeeRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    throw new Error("Failed to update employee");
  }
};

// Delete employee
export const deleteEmployee = async (employeeId: string): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const employeeRef = ref(db, `users/${userPath}/employees/${employeeId}`);

    await remove(employeeRef);
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw new Error("Failed to delete employee");
  }
};

// Get employee by ID
export const getEmployeeById = async (employeeId: string): Promise<Employee | null> => {
  try {
    const userPath = getCurrentUserPath();
    const employeeRef = ref(db, `users/${userPath}/employees/${employeeId}`);
    const snapshot = await get(employeeRef);

    if (snapshot.exists()) {
      const employee = snapshot.val();
      return {
        id: parseInt(employeeId),
        ...employee,
      } as Employee;
    }
    return null;
  } catch (error) {
    console.error("Error getting employee:", error);
    return null;
  }
};