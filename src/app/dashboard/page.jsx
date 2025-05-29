"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/website-monitor");
  }, []);

  return null;
};

export default Dashboard;
