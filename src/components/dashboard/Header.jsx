"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";
import { BASE_URL } from "@/services/baseUrl";
import Image from "next/image";

const Header = () => {
  const { user, setUser } = useAuth();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      router.push("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="h-16 bg-gray-900 shadow-sm flex items-center justify-between px-8 border-b border-b-gray-600">
      <div className="flex items-center gap-3">
        <Image
          src="/wmt-logo-1.png"
          alt="Logo"
          width={36}
          height={36}
          className="rounded"
          priority
        />
        <h1 className="font-bold text-2xl text-gray-100">Website Monitor</h1>
      </div>
      <div className="flex gap-4 items-center">
        {user && (
          <>
            <span className="text-gray-100 text-lg">
              {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
            </span>{" "}
            <button
              onClick={handleLogout}
              className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md"
            >
              <IoLogOut className="size-5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
