import React, { createContext, useContext, useState, useEffect } from "react";
import { login as authLogin, signup as authSignup, logout as authLogout, getCurrentUser, UserData } from "@/services/authService";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "@/firebase";

export type UserRole = "superadmin" | "admin" | "manager" | "supervisor" | "employee" | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface RoleContextType {
  user: User | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    const storedUser = localStorage.getItem("sk_user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("sk_user");
        return null;
      }
    }
    return null;
  });
  const [role, setRole] = useState<UserRole>(() => {
    const storedUser = localStorage.getItem("sk_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.role;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    // Set auth persistence to local (persists across browser sessions)
    setPersistence(auth, browserLocalPersistence).then(() => {
      // Check if user is already signed in
      const currentUser = auth.currentUser;
      if (currentUser) {
        // User is already signed in, get their data
        getCurrentUser().then((userData) => {
          if (userData) {
            const user: User = {
              id: userData.uid,
              name: userData.name,
              email: userData.email,
              role: userData.role,
            };
            setUser(user);
            setRole(userData.role);
            localStorage.setItem("sk_user", JSON.stringify(user));
          } else {
            // Try localStorage fallback
            const storedUser = localStorage.getItem("sk_user");
            if (storedUser) {
              const parsedUser = JSON.parse(storedUser);
              if (parsedUser.email === currentUser.email) {
                setUser(parsedUser);
                setRole(parsedUser.role);
              } else {
                localStorage.removeItem("sk_user");
                setUser(null);
                setRole(null);
              }
            } else {
              setUser(null);
              setRole(null);
            }
          }
        }).catch((error) => {
          console.error("Error getting current user:", error);
          // Try localStorage fallback
          const storedUser = localStorage.getItem("sk_user");
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.email === currentUser.email) {
              setUser(parsedUser);
              setRole(parsedUser.role);
            } else {
              localStorage.removeItem("sk_user");
              setUser(null);
              setRole(null);
            }
          } else {
            setUser(null);
            setRole(null);
          }
        });
      }

      // Listen to auth state changes
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            // User is signed in, get their data from database
            const userData = await getCurrentUser();
            if (userData) {
              const user: User = {
                id: userData.uid,
                name: userData.name,
                email: userData.email,
                role: userData.role,
              };
              setUser(user);
              setRole(userData.role);
              localStorage.setItem("sk_user", JSON.stringify(user));
            } else {
              // If database lookup fails, try to restore from localStorage as fallback
              const storedUser = localStorage.getItem("sk_user");
              if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                // Verify the stored user matches the current Firebase user
                if (parsedUser.email === firebaseUser.email) {
                  setUser(parsedUser);
                  setRole(parsedUser.role);
                } else {
                  // Clear invalid stored data
                  localStorage.removeItem("sk_user");
                  setUser(null);
                  setRole(null);
                }
              } else {
                setUser(null);
                setRole(null);
              }
            }
          } catch (error) {
            console.error("Error getting user data:", error);
            // Try to restore from localStorage as fallback
            const storedUser = localStorage.getItem("sk_user");
            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                // Verify the stored user matches the current Firebase user
                if (parsedUser.email === firebaseUser.email) {
                  setUser(parsedUser);
                  setRole(parsedUser.role);
                } else {
                  localStorage.removeItem("sk_user");
                  setUser(null);
                  setRole(null);
                }
              } catch (parseError) {
                localStorage.removeItem("sk_user");
                setUser(null);
                setRole(null);
              }
            } else {
              setUser(null);
              setRole(null);
            }
          }
        } else {
          // User is signed out
          setUser(null);
          setRole(null);
          localStorage.removeItem("sk_user");
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    }).catch((error) => {
      console.error("Error setting persistence:", error);
    });
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const userData = await authLogin(email, password);
      const user: User = {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      setUser(user);
      setRole(userData.role);
      localStorage.setItem("sk_user", JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const signup = async (name: string, email: string, password: string, selectedRole: UserRole) => {
    try {
      if (!selectedRole) throw new Error("Role is required");
      const userData = await authSignup(name, email, password, selectedRole);
      const user: User = {
        id: userData.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };

      setUser(user);
      setRole(userData.role);
      localStorage.setItem("sk_user", JSON.stringify(user));
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    }
  };

  const logout = async () => {
    try {
      await authLogout();
      setUser(null);
      setRole(null);
      localStorage.removeItem("sk_user");
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear local state even if Firebase logout fails
      setUser(null);
      setRole(null);
      localStorage.removeItem("sk_user");
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
      {children}
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
