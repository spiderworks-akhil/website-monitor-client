"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { BASE_URL } from "@/services/baseUrl";

export default function Settings() {
  const [frequency, setFrequency] = useState("1");
  const [message, setMessage] = useState("");
  const { data: session, status } = useSession();
  const frequencies = [
    { label: "Every 1 minute", value: "1" },
    { label: "Every 5 minutes", value: "5" },
    { label: "Every 10 minutes", value: "10" },
    { label: "Every 15 minutes", value: "15" },
    { label: "Every 30 minutes", value: "30" },
  ];

  useEffect(() => {
    const fetchFrequency = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cron/user-frequency`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setFrequency(data.frequency.toString());
        }
      } catch (error) {
        console.error("Failed to fetch frequency:", error);
      }
    };
    fetchFrequency();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/cron/update-user-frequency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ frequency: parseInt(frequency) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Frequency updated successfully!");
      } else {
        setMessage(`Error: ${data.error || "Failed to update frequency"}`);
      }
    } catch (error) {
      setMessage("Error: Failed to connect to the server");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </header>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Website Check Frequency
          </h2>
          <form
            onSubmit={handleSave}
            className="flex flex-wrap gap-4 items-center"
          >
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="flex-1 p-3 border rounded focus:ring-2 focus:ring-blue-400"
            >
              {frequencies.map((freq) => (
                <option key={freq.value} value={freq.value}>
                  {freq.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 p-3 rounded ${
                message.includes("Error")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
