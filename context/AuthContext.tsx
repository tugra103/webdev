// AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

type AuthContextType = {
  user: User | null;
  loading: boolean; // ✅ EKLENDİ
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true, // ✅ default true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // ✅ EKLENDİ

  useEffect(() => {
    const auth = getAuth();

    // ✅ setPersistence önce çağrılır, sonra listener kurulur
    setPersistence(auth, browserLocalPersistence).then(() => {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false); // ✅ Firebase cevap verince loading biter
      });

      return () => unsubscribe(); // ✅ cleanup artık doğru yerde
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);