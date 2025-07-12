// src/components/AuthContext.tsx

import type { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

interface AuthState {
  user: FirebaseUser | null;  // Firebase Auth user
  profile: any | null;        // Firestore user document
  organization: any | null;   // Organization data
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
  const [profile, setProfile] = useState<any | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
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
            const userData = { id: userDoc.id, ...userDoc.data() };
            setProfile(userData);
            
            // Load organization data
            if (userData.organizationId) {
              const orgDoc = await getDoc(doc(db, "organizations", userData.organizationId));
              if (orgDoc.exists()) {
                setOrganization({ id: orgDoc.id, ...orgDoc.data() });
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