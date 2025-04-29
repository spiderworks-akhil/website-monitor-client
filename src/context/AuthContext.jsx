"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/services/baseUrl";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
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

      localStorage.setItem("user", JSON.stringify(data.user));
    } catch (err) {
      setUser(null);
      localStorage.removeItem("user");
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

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
