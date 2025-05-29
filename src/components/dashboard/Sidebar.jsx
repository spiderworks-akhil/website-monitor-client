"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/website-monitor", label: "Website Monitor" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/user-profile", label: "User Profile" },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white p-6 border-r border-r-gray-600">
      {" "}
      <nav className="flex flex-col gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md ${
              pathname === link.href ? "bg-gray-700" : "hover:bg-gray-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
