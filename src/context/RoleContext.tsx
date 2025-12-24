import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import LoadingSpinner from "../components/LoadingSpinner";

export type UserRole = "superadmin" | "admin" | "manager" | "supervisor" | "employee" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface RoleContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string, selectedRole: UserRole) => Promise<void>;
  signup: (name: string, email: string, password: string, selectedRole: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, fetch user data from database
        try {
          const userRef = ref(database, `users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const userData = snapshot.val();
            const userObj: User = {
              id: firebaseUser.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
              createdAt: userData.createdAt
            };
            
            setUser(userObj);
            setRole(userData.role);
            localStorage.setItem("sk_user", JSON.stringify(userObj));
          } else {
            // User data not found in database, sign them out
            await signOut(auth);
            localStorage.removeItem("sk_user");
            setUser(null);
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          await signOut(auth);
          localStorage.removeItem("sk_user");
          setUser(null);
          setRole(null);
        }
      } else {
        // User is signed out
        setUser(null);
        setRole(null);
        localStorage.removeItem("sk_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        return Object.values(users).some((user: any) => user.email === email);
      }
      return false;
    } catch (error: any) {
      console.error("Error checking email:", error);
      
      // If permission denied, we can't check email existence
      if (error.code === 'PERMISSION_DENIED') {
        return false; // Assume email doesn't exist
      }
      
      return false;
    }
  };

const signup = async (name: string, email: string, password: string, selectedRole: UserRole) => {
  try {
    if (selectedRole !== "superadmin") {
      throw new Error("Only Super Admin can sign up directly");
    }

    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Create superadmin in Realtime Database under users/{uid}
    const userData = {
      id: firebaseUser.uid,
      name,
      email,
      role: selectedRole,
      createdAt: new Date().toISOString(),
      // Initialize empty sub-collections for different roles
      admin: {},
      manager: {},
      supervisor: {},
      employee: {}
    };

    await set(ref(database, `users/${firebaseUser.uid}`), {
      name,
      email,
      role: selectedRole,
      createdAt: new Date().toISOString()
    });

    // Sign out immediately after creating account
    await signOut(auth);
    
    return;

  } catch (error: any) {
    console.error("Signup error:", error);
    
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("Email already registered. Please use a different email or login.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password should be at least 6 characters.");
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error("Signup failed. Please try again.");
    }
  }
};

  const login = async (email: string, password: string, selectedRole: UserRole) => {
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      try {
        // Try to fetch user data from database
        const userRef = ref(database, `users/${firebaseUser.uid}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          
          // Verify role matches if we can access data
          if (userData.role !== selectedRole) {
            await signOut(auth);
            throw new Error(`This email is not registered as ${selectedRole}. Please select the correct role.`);
          }

          const userObj: User = {
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            createdAt: userData.createdAt
          };

          setUser(userObj);
          setRole(selectedRole);
          localStorage.setItem("sk_user", JSON.stringify(userObj));
        } else {
          // If we can't access database or data doesn't exist, use minimal data
          const userObj: User = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || email.split('@')[0],
            email: email,
            role: selectedRole,
            createdAt: new Date().toISOString()
          };

          setUser(userObj);
          setRole(selectedRole);
          localStorage.setItem("sk_user", JSON.stringify(userObj));
        }
      } catch (dbError) {
        console.error("Database access error, using fallback:", dbError);
        
        // Fallback if database access fails
        const userObj: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || email.split('@')[0],
          email: email,
          role: selectedRole,
          createdAt: new Date().toISOString()
        };

        setUser(userObj);
        setRole(selectedRole);
        localStorage.setItem("sk_user", JSON.stringify(userObj));
      }

    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.code === 'auth/invalid-credential') {
        throw new Error("Invalid email or password.");
      } else if (error.code === 'auth/user-not-found') {
        throw new Error("No account found with this email.");
      } else if (error.code === 'auth/wrong-password') {
        throw new Error("Incorrect password.");
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error("Too many failed attempts. Please try again later.");
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Login failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      localStorage.removeItem("sk_user");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed. Please try again.");
    }
  };

  return (
    <RoleContext.Provider
      value={{
        user,
        role,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {loading ? <LoadingSpinner /> : children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within RoleProvider");
  }
  return context;
};