// src/components/AuthContext.tsx - Fixed with proper types

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { User, Organization } from "@/types/models"; // Import proper types

interface AuthState {
  user: FirebaseUser | null;
  profile: User | null;           // Changed from any to User type
  organization: Organization | null; // Changed from any to Organization type
  loading: boolean;
  emailVerified: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isEmployee: boolean;
}

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);           // Proper typing
  const [organization, setOrganization] = useState<Organization | null>(null); // Proper typing
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        setUser(firebaseUser);
        setEmailVerified(firebaseUser.emailVerified);
        
        try {
          // Load user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = { id: userDoc.id, ...userDoc.data() } as User; // Type assertion
            setProfile(userData);
            
            // Load organization data - now TypeScript knows organizationId exists
            if (userData.organizationId) {
              const orgDoc = await getDoc(doc(db, "organizations", userData.organizationId));
              if (orgDoc.exists()) {
                const orgData = { id: orgDoc.id, ...orgDoc.data() } as Organization; // Type assertion
                setOrganization(orgData);
              }
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      } else {
        setUser(null);
        setProfile(null);
        setOrganization(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const value: AuthState = {
    user,
    profile,
    organization,
    loading,
    emailVerified,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager' || profile?.role === 'admin',
    isEmployee: profile?.role === 'employee',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);