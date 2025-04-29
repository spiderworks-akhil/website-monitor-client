"use client";

import Header from "@/components/dashboard/Header";
import Sidebar from "@/components/dashboard/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }) {
  const { user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [localUser, setLocalUser] = useState(null);

  useEffect(() => {
    setIsClient(true);

    const storedUser = localStorage.getItem("user");
    setLocalUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  useEffect(() => {
    if (isClient && !localUser && !user) {
      router.push("/signin");
    }
  }, [isClient, localUser, user, router]);

  if (!isClient) {
    return null;
  }

  if (!user && !localUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 bg-white overflow-auto">{children}</main>
      </div>
    </div>
  );
}
