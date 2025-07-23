"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoLogOut } from "react-icons/io5";
import { BASE_URL } from "@/services/baseUrl";
import Image from "next/image";

const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/signin" });
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
        {session?.user && (
          <>
            <span className="text-gray-100 text-lg">
              {session.user.name
                ? session.user.name.charAt(0).toUpperCase() + session.user.name.slice(1)
                : session.user.email}
            </span>
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
