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

// Helper function to sanitize email for Realtime Database path
const sanitizeEmail = (email: string): string => {
  return email.replace(/[@.]/g, '_');
};

export interface Site {
  id: string;
  name: string;
  clientName: string;
  location: string;
  areaSqft: number;
  siteManager: string;
  managerPhone: string;
  supervisor: string;
  supervisorPhone: string;
  contractValue: number;
  contractEndDate: string;
  services: string[];
  staffDeployment: { role: string; count: number }[];
  status: "active" | "inactive";
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

// Get current user email for document ID
export const getCurrentUserEmail = (): string => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }
  return user.email;
};

// Ensure user document exists
export const ensureUserDocument = async () => {
  try {
    const userEmail = getCurrentUserEmail();
    const userRef = ref(db, `users/${sanitizeEmail(userEmail)}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
      // Get user from auth
      const user = auth.currentUser;
      if (!user) throw new Error("No user found");

      // Create user document
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || user.email?.split('@')[0] || "User",
        role: "employee", // Default role
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Error ensuring user document:", error);
    throw error;
  }
};

// Get current user path (sanitized email)
export const getCurrentUserPath = (): string => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error("No authenticated user found");
  }
  return sanitizeEmail(user.email);
};

// Get all sites for current user
export const getSites = async (): Promise<Site[]> => {
  try {
    const userPath = getCurrentUserPath();
    const sitesRef = ref(db, `users/${userPath}/sites`);
    const snapshot = await get(sitesRef);

    if (!snapshot.exists()) {
      return [];
    }

    const sitesData = snapshot.val();
    const sites: Site[] = Object.keys(sitesData).map(key => ({
      id: key,
      ...sitesData[key],
    }));

    // Sort by createdAt descending
    sites.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return sites;
  } catch (error) {
    console.error("Error getting sites:", error);
    return [];
  }
};

// Add new site
export const addSite = async (data: Omit<Site, "id" | "createdAt" | "updatedAt" | "createdBy">): Promise<string> => {
  try {
    const userPath = getCurrentUserPath();
    const sitesRef = ref(db, `users/${userPath}/sites`);
    const newSiteRef = push(sitesRef);

    await set(newSiteRef, {
      ...data,
      createdBy: userPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return newSiteRef.key!;
  } catch (error) {
    console.error("Error adding site:", error);
    throw new Error("Failed to add site");
  }
};

// Update site
export const updateSite = async (siteId: string, data: Partial<Site>): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const siteRef = ref(db, `users/${userPath}/sites/${siteId}`);

    await update(siteRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error updating site:", error);
    throw new Error("Failed to update site");
  }
};

// Delete site
export const deleteSite = async (siteId: string): Promise<void> => {
  try {
    const userPath = getCurrentUserPath();
    const siteRef = ref(db, `users/${userPath}/sites/${siteId}`);

    await remove(siteRef);
  } catch (error) {
    console.error("Error deleting site:", error);
    throw new Error("Failed to delete site");
  }
};

// Get site by ID
export const getSiteById = async (siteId: string): Promise<Site | null> => {
  try {
    const userPath = getCurrentUserPath();
    const siteRef = ref(db, `users/${userPath}/sites/${siteId}`);
    const snapshot = await get(siteRef);

    if (snapshot.exists()) {
      const site = snapshot.val();
      return {
        id: siteId,
        ...site,
      } as Site;
    }
    return null;
  } catch (error) {
    console.error("Error getting site:", error);
    return null;
  }
};