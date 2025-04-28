"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/services/baseUrl";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const validateSession = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/current-user/get-me`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Not authenticated");

      const data = await res.json();
      setUser(data.user);
    } catch (err) {
      setUser(null);
      router.push("/signin");
    }
  };

  useEffect(() => {
    validateSession();

    const interval = setInterval(() => {
      validateSession();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
