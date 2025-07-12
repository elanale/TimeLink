// src/components/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { User, Organization } from "@/types/models";

// Define the shape of the context state
interface AuthState {
  user: FirebaseUser | null;
  profile: User | null;
  organization: Organization | null;
  loading: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

// Create the context with a default value to prevent crashes in components
const AuthContext = createContext<AuthState>({
  user: null,
  profile: null,
  organization: null,
  loading: true,
  emailVerified: false,
  isAdmin: false,
  isManager: false,
  isEmployee: false,
});

// Custom hook for easy access to the context from any component
export const useAuth = () => useContext(AuthContext);

// The provider component that will wrap the entire application
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function for cleanup
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Start loading whenever auth state might change

      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // User is logged in, now fetch their profile from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User;
            setProfile(userData);

            // Now, fetch the organization data based on the user's profile
            if (userData.organizationId) {
              const orgDocRef = doc(db, "organizations", userData.organizationId);
              const orgDoc = await getDoc(orgDocRef);

              if (orgDoc.exists()) {
                setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
              } else {
                setOrganization(null); // Org not found
              }
            } else {
              setOrganization(null); // User has no organization ID
            }
          } else {
            // This is an important edge case: user exists in Firebase Auth,
            // but not in our Firestore 'users' collection.
            setProfile(null);
            setOrganization(null);
          }
        } else {
          // User is signed out, so clear all user-related state
          setUser(null);
          setProfile(null);
          setOrganization(null);
        }
      } catch (error) {
        // In case of any error during the process, log it and reset state
        console.error("AuthContext: Error during auth state processing:", error);
        setUser(null);
        setProfile(null);
        setOrganization(null);
      } finally {
        // This 'finally' block ensures that loading is set to false
        // only after all async operations (try or catch) are complete.
        setLoading(false);
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, []);

  // The value object that will be provided to all consuming components.
  // We derive boolean flags directly from the state for consistency.
  const value: AuthState = {
    user,
    profile,
    organization,
    loading,
    emailVerified: user?.emailVerified || false,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager' || profile?.role === 'admin',
    isEmployee: profile?.role === 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};