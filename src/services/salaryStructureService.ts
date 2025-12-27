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
import { SalaryStructure } from "@/pages/superadmin/types";

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

// Get all salary structures for current user
export const getSalaryStructures = async (): Promise<SalaryStructure[]> => {
  try {
    const userPath = getCurrentUserPath();
    const salaryStructuresRef = ref(db, `users/${userPath}/salaryStructures`);
    const snapshot = await get(salaryStructuresRef);

    if (!snapshot.exists()) {
      return [];
    }

    const salaryStructuresData = snapshot.val();
    const salaryStructures: SalaryStructure[] = Object.keys(salaryStructuresData).map(key => ({
      id: parseInt(key),
      ...salaryStructuresData[key],
    }));

    return salaryStructures;
  } catch (error) {
    console.error("Error getting salary structures:", error);
    return [];
  }
};

// Add new salary structure
export const addSalaryStructure = async (data: Omit<SalaryStructure, "id">): Promise<string> => {
  try {
    const userPath = getCurrentUserPath();
    const salaryStructuresRef = ref(db, `users/${userPath}/salaryStructures`);
    const newSalaryStructureRef = push(salaryStructuresRef);

    await set(newSalaryStructureRef, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newSalaryStructureRef.key!;
  } catch (error) {
    console.error("Error adding salary structure:", error);
    throw new Error("Failed to add salary structure");
  }
};

// Update salary structure
export const updateSalaryStructure = async (salaryStructureId: string, data: Partial<SalaryStructure>): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const salaryStructureRef = ref(db, `users/${userPath}/salaryStructures/${salaryStructureId}`);

    await update(salaryStructureRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating salary structure:", error);
    throw new Error("Failed to update salary structure");
  }
};

// Delete salary structure
export const deleteSalaryStructure = async (salaryStructureId: string): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const salaryStructureRef = ref(db, `users/${userPath}/salaryStructures/${salaryStructureId}`);

    await remove(salaryStructureRef);
  } catch (error) {
    console.error("Error deleting salary structure:", error);
    throw new Error("Failed to delete salary structure");
  }
};

// Get salary structure by employee ID
export const getSalaryStructureByEmployeeId = async (employeeId: string): Promise<SalaryStructure | null> => {
  try {
    const userPath = getCurrentUserPath();
    const salaryStructuresRef = ref(db, `users/${userPath}/salaryStructures`);
    const snapshot = await get(salaryStructuresRef);

    if (!snapshot.exists()) {
      return null;
    }

    const salaryStructuresData = snapshot.val();
    const salaryStructureKey = Object.keys(salaryStructuresData).find(key =>
      salaryStructuresData[key].employeeId === employeeId
    );

    if (salaryStructureKey) {
      return {
        id: parseInt(salaryStructureKey),
        ...salaryStructuresData[salaryStructureKey],
      } as SalaryStructure;
    }

    return null;
  } catch (error) {
    console.error("Error getting salary structure:", error);
    return null;
  }
};