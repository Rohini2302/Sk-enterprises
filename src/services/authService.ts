import { auth, db } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from "firebase/auth";
import {
  ref,
  set,
  get,
  update,
  onValue
} from "firebase/database";

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

// Search for managed user across all creator collections
const findManagedUser = async (email: string): Promise<{userData: UserData, creatorPath: string, userId: string} | null> => {
  try {
    // Get all users (creators)
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);

    if (!usersSnapshot.exists()) return null;

    const usersData = usersSnapshot.val();

    // Check each user's collections for the managed user
    for (const creatorEmail of Object.keys(usersData)) {
      const creatorData = usersData[creatorEmail];

      // Skip if this is not a user object
      if (!creatorData || typeof creatorData !== 'object' || !creatorData.email) continue;

      // Check each role collection
      const roles = ['admins', 'managers', 'supervisors', 'employees'];
      for (const roleCollection of roles) {
        const collectionRef = ref(db, `users/${creatorEmail}/${roleCollection}`);
        const collectionSnapshot = await get(collectionRef);

        if (collectionSnapshot.exists()) {
          const collectionData = collectionSnapshot.val();

          // Look for user with matching email
          for (const userId of Object.keys(collectionData)) {
            const user = collectionData[userId];
            if (user.email === email) {
              return {
                userData: {
                  uid: `managed_${userId}`,
                  email: email,
                  name: user.name,
                  role: user.role,
                  createdAt: user.createdAt,
                  status: user.status || 'pending_activation'
                },
                creatorPath: creatorEmail,
                userId: userId
              };
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error searching for managed user:', error);
    return null;
  }
};

export interface UserData {
  uid: string;
  email: string;
  name: string;
  role: "superadmin" | "admin" | "manager" | "supervisor" | "employee";
  createdAt: any;
  status?: string;
  managedBy?: string;
  activatedAt?: string;
  id?: string; // Add id field for managed users
}


// Sign up function
export const signup = async (
  name: string,
  email: string,
  password: string,
  role: "superadmin" | "admin" | "manager" | "supervisor" | "employee"
): Promise<UserData> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Realtime Database using sanitized email as key
    const userRef = ref(db, `users/${sanitizeEmail(email)}`);
    const userData = {
      uid: user.uid,
      email: email,
      name: name,
      role: role,
      createdAt: new Date().toISOString(),
    };

    await set(userRef, userData);

    return userData;
  } catch (error: any) {
    throw new Error(error.message || "Signup failed");
  }
};

// Login function
export const login = async (
  email: string,
  password: string
): Promise<UserData> => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Please enter a valid email address");
    }

    // First, check if user exists in database
    const userEmailPath = sanitizeEmail(email);
    const userRef = ref(db, `users/${userEmailPath}`);
    const userSnapshot = await get(userRef);

    let userData: UserData | null = null;
    let isManagedUser = false;
    let managedUserInfo: {userData: UserData, creatorPath: string, userId: string} | null = null;

    if (userSnapshot.exists()) {
      // Superadmin/admin user
      userData = userSnapshot.val() as UserData;
    } else {
      // Search for managed user in creator collections
      const foundUser = await findManagedUser(email);
      if (foundUser) {
        userData = foundUser.userData;
        isManagedUser = true;
        managedUserInfo = foundUser;
      }
    }

    if (!userData) {
      throw new Error("No account found with this email address.");
    }

    // Check if user is inactive
    if (userData.status === 'inactive') {
      throw new Error("Your account has been deactivated. Please contact your administrator.");
    }

    // If user has pending_activation status, create Auth account
    if (userData.status === 'pending_activation') {
      try {
        // Create Firebase Auth account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update user data with real UID and create user record
        const updatedUserData = {
          ...userData,
          uid: firebaseUser.uid,
          status: 'active',
          activatedAt: new Date().toISOString()
        };

        // For managed users, just update creator's collection status
        if (isManagedUser && managedUserInfo) {
          const creatorPath = managedUserInfo.creatorPath;
          const collectionName = getCollectionName(userData.role);
          const creatorUserRef = ref(db, `users/${creatorPath}/${collectionName}/${managedUserInfo.userId}`);
          await update(creatorUserRef, { status: 'active', activatedAt: new Date().toISOString() });
        } else {
          await set(userRef, updatedUserData);
        }
        return updatedUserData;
      } catch (createError: any) {
        // If account already exists, try normal login
        if (createError.code === 'auth/email-already-in-use') {
          // Try normal login
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // Update user data if needed
          if (userData.uid !== firebaseUser.uid) {
            const updatedUserData = {
              ...userData,
              uid: firebaseUser.uid,
              status: 'active'
            };
            await set(userRef, updatedUserData);
          }

          return { ...userData, uid: firebaseUser.uid, status: 'active' };
        }
        // Handle other creation errors
        if (createError.code === 'auth/weak-password') {
          throw new Error("Password is too weak. Please choose a stronger password.");
        } else if (createError.code === 'auth/invalid-email') {
          throw new Error("Please enter a valid email address.");
        } else {
          throw new Error("Failed to activate account. Please contact your administrator.");
        }
      }
    }

    // Normal login flow for active users
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return userData;
    } catch (signInError: any) {
      // If sign-in fails with user-not-found, but user exists in database,
      // try to create the Firebase Auth account
      if (signInError.code === 'auth/user-not-found' && userData) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          // Update the user record with the real UID
          const updatedUserData = {
            ...userData,
            uid: user.uid
          };
          await set(userRef, updatedUserData);

          return updatedUserData;
        } catch (createError: any) {
          // If account already exists or other error, re-throw the original error
          throw signInError;
        }
      }
      // Re-throw the original error
      throw signInError;
    }
  } catch (error: any) {
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      throw new Error("No account found with this email address.");
    } else if (error.code === 'auth/wrong-password') {
      throw new Error("Incorrect password. Please try again.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Please enter a valid email address.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("This account has been disabled.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed login attempts. Please try again later.");
    } else {
      throw new Error(error.message || "Login failed. Please try again.");
    }
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message || "Logout failed");
  }
};

// Get current user data
export const getCurrentUser = async (): Promise<UserData | null> => {
  const user = auth.currentUser;

  if (!user || !user.email) {
    return null;
  }

  try {
    const userEmailPath = sanitizeEmail(user.email);
    const userRef = ref(db, `users/${userEmailPath}`);
    const userSnapshot = await get(userRef);

    if (userSnapshot.exists()) {
      // Superadmin/admin user
      return userSnapshot.val() as UserData;
    } else {
      // Search for managed user in creator collections
      const foundUser = await findManagedUser(user.email);
      if (foundUser) {
        return {
          uid: user.uid,
          email: user.email,
          name: foundUser.userData.name,
          role: foundUser.userData.role,
          createdAt: foundUser.userData.createdAt,
          status: foundUser.userData.status
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get all users (for superadmin/admin)
export const getAllUsers = async (): Promise<UserData[]> => {
  try {
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return [];
    }

    const usersData = snapshot.val();
    const users: UserData[] = Object.values(usersData) as UserData[];

    return users;
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Update user role (for superadmin)
export const updateUserRole = async (
  userEmail: string,
  newRole: UserData["role"]
): Promise<void> => {
  try {
    const userRef = ref(db, `users/${sanitizeEmail(userEmail)}`);
    await update(userRef, { role: newRole });
  } catch (error: any) {
    throw new Error(error.message || "Failed to update user role");
  }
};