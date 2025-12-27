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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Helper function to sanitize email for Realtime Database path
const sanitizeEmail = (email: string): string => {
  return email.replace(/[@.]/g, '_');
};

// Collection names for different roles
const getCollectionName = (role: string): string => {
  const collections = {
    'admin': 'admins',
    'manager': 'managers',
    'supervisor': 'supervisors',
    'employee': 'employees'
  };
  return collections[role as keyof typeof collections] || `${role}s`;
};

// Get current user path (sanitized email)
export const getCurrentUserPath = (): string => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }
  return sanitizeEmail(user.email);
};

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor';
  department: string;
  site: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending_activation';
  joinDate: string;
  createdAt?: string;
  updatedAt?: string;
  managedBy?: string;
}

// Create a new managed user (stores data but doesn't create Auth account yet)
export const createManagedUser = async (userData: Omit<ManagedUser, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<string> => {
  try {
    // Get current user (creator)
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error("No authenticated user found");
    }
    const creatorPath = sanitizeEmail(currentUser.email);

    // Determine the collection name based on role
    const collectionName = getCollectionName(userData.role);

    // Store user data under creator's path
    const usersRef = ref(db, `users/${creatorPath}/${collectionName}`);
    const newUserRef = push(usersRef);

    const managedUser: ManagedUser = {
      id: newUserRef.key!,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      site: userData.site,
      phone: userData.phone,
      status: 'pending_activation',
      joinDate: userData.joinDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      managedBy: creatorPath, // Store creator information
    };

    await set(newUserRef, managedUser);

    return newUserRef.key!;
  } catch (error: any) {
    console.error("Error creating managed user:", error);
    throw new Error(error.message || "Failed to create user");
  }
};

// Get all users of a specific role
export const getUsersByRole = async (role: 'admin' | 'manager' | 'supervisor'): Promise<ManagedUser[]> => {
  try {
    const creatorPath = getCurrentUserPath();
    const collectionName = getCollectionName(role);
    const usersRef = ref(db, `users/${creatorPath}/${collectionName}`);
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return [];
    }

    const usersData = snapshot.val();
    const users: ManagedUser[] = Object.keys(usersData).map(key => ({
      id: key,
      ...usersData[key],
    }));

    return users;
  } catch (error) {
    console.error(`Error getting ${role}s:`, error);
    return [];
  }
};

// Get all managed users (admins, managers, supervisors)
export const getAllManagedUsers = async (): Promise<ManagedUser[]> => {
  try {
    const creatorPath = getCurrentUserPath();
    const allUsers: ManagedUser[] = [];

    // Get admins
    const admins = await getUsersByRole('admin');
    allUsers.push(...admins);

    // Get managers
    const managers = await getUsersByRole('manager');
    allUsers.push(...managers);

    // Get supervisors
    const supervisors = await getUsersByRole('supervisor');
    allUsers.push(...supervisors);

    // Sort by join date descending
    allUsers.sort((a, b) => new Date(b.joinDate || 0).getTime() - new Date(a.joinDate || 0).getTime());

    return allUsers;
  } catch (error) {
    console.error("Error getting all managed users:", error);
    return [];
  }
};

// Update a managed user
export const updateManagedUser = async (
  userId: string,
  role: 'admin' | 'manager' | 'supervisor',
  data: Partial<ManagedUser>
): Promise<void> => {
  try {
    const creatorPath = getCurrentUserPath();
    const collectionName = getCollectionName(role);
    const userRef = ref(db, `users/${creatorPath}/${collectionName}/${userId}`);

    await update(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating managed user:", error);
    throw new Error("Failed to update user");
  }
};

// Delete a managed user
export const deleteManagedUser = async (
  userId: string,
  role: 'admin' | 'manager' | 'supervisor'
): Promise<void> => {
  try {
    const creatorPath = getCurrentUserPath();
    const collectionName = getCollectionName(role);
    const userRef = ref(db, `users/${creatorPath}/${collectionName}/${userId}`);

    await remove(userRef);
  } catch (error) {
    console.error("Error deleting managed user:", error);
    throw new Error("Failed to delete user");
  }
};

// Get user by ID and role
export const getManagedUserById = async (
  userId: string,
  role: 'admin' | 'manager' | 'supervisor'
): Promise<ManagedUser | null> => {
  try {
    const creatorPath = getCurrentUserPath();
    const collectionName = getCollectionName(role);
    const userRef = ref(db, `users/${creatorPath}/${collectionName}/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const user = snapshot.val();
      return {
        id: userId,
        ...user,
      } as ManagedUser;
    }
    return null;
  } catch (error) {
    console.error("Error getting managed user:", error);
    return null;
  }
};