"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_URL } from "@/services/baseUrl";

export default function WebMonitor() {
  const [websites, setWebsites] = useState([]);
  const [form, setForm] = useState({ site_name: "", url: "" });
  const [searchName, setSearchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [urlError, setUrlError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter();

  const fetchWebsites = async () => {
    const params = new URLSearchParams();
    if (searchName) params.append("name", searchName);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("includeToday", "true");
    const res = await fetch(
      `${BASE_URL}/api/websites/get-websites?${params.toString()}`,
      {
        credentials: "include",
      }
    );
    const data = await res.json();
    setWebsites(Array.isArray(data) ? data : []);
  };

  const addWebsite = async (e) => {
    e.preventDefault();
    setUrlError("");

    try {
      const res = await fetch(`${BASE_URL}/api/websites/add-website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setUrlError(errorData.error || "Failed to add website");
        return;
      }

      setForm({ site_name: "", url: "" });
      fetchWebsites();
    } catch (error) {
      setUrlError("An error occurred while adding the website");
    }
  };

  const runCheck = async () => {
    await fetch(`${BASE_URL}/api/websites/check-websites`, { method: "GET" });
    fetchWebsites();
  };

  const handleManualRefresh = () => {
    setSearchName("");
    setStartDate("");
    setEndDate("");
    fetchWebsites();
  };

  useEffect(() => {
    if (!searchName && !startDate && !endDate) {
      fetchWebsites();
      const interval = setInterval(fetchWebsites, 10000);
      return () => clearInterval(interval);
    }
  }, [searchName, startDate, endDate]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchWebsites();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchName, startDate, endDate]);

  useEffect(() => {
    if (urlError) {
      const timer = setTimeout(() => {
        setUrlError("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [urlError]);

  const groupStatusByDay = (statusHistory) => {
    const grouped = {};
    const todayKey = new Date().toLocaleDateString();
    const todayData = [];
    const otherData = [];

    statusHistory.forEach((history) => {
      const date = new Date(history.check_time).toLocaleDateString();
      if (date === todayKey) {
        todayData.push(history);
      } else {
        otherData.push(history);
      }
    });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = d.toLocaleDateString();
        if (dateKey !== todayKey) {
          grouped[dateKey] = otherData.filter((history) => {
            const historyDate = new Date(
              history.check_time
            ).toLocaleDateString();
            return historyDate === dateKey;
          });
        }
      }
    }

    grouped[todayKey] = todayData;

    const sortedEntries = Object.entries(grouped).sort((a, b) => {
      if (a[0] === todayKey) return 1;
      if (b[0] === todayKey) return -1;
      return new Date(a[0]) - new Date(b[0]);
    });

    return Object.fromEntries(sortedEntries);
  };

  const renderStatusBars = (histories) => {
    if (histories.length === 0) {
      return (
        <div className="flex-1 h-8 bg-gray-100 rounded-sm flex items-center justify-center">
          <span className="text-xs text-gray-400">No data</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1 h-8 flex-1">
        {histories.map((history) => {
          const statusColor =
            history.status === "Success"
              ? "bg-green-500"
              : history.status === "Slow"
              ? "bg-yellow-500"
              : "bg-red-500";

          return (
            <div key={history.id} className="relative group h-full">
              <div className={`w-2 h-full rounded-sm ${statusColor}`} />
              <div className="absolute hidden group-hover:block z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                  <div className="font-medium">{history.status}</div>
                  <div className="text-gray-300">
                    {new Date(history.check_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Website Health Monitor</h1>
          <button
            onClick={runCheck}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md shadow"
          >
            🚀 Run Check Now
          </button>
        </header>

        <div className="bg-white p-4 rounded-lg shadow mb-8">
          <form onSubmit={addWebsite} className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Website Name"
              value={form.site_name}
              onChange={(e) => setForm({ ...form, site_name: e.target.value })}
              className="flex-1 p-3 border rounded"
            />
            <input
              type="text"
              placeholder="https://example.com"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="flex-1 p-3 border rounded"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Website
            </button>
          </form>

          {urlError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md shadow-sm flex items-center gap-2 animate-fade-in">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold">{urlError}</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 mb-4 flex-wrap">
          <input
            type="text"
            placeholder="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="p-3 border rounded flex-1"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-3 border rounded focus:ring-2 focus:ring-blue-400"
            max={today}
            min={startDate || undefined}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-3 border rounded focus:ring-2 focus:ring-blue-400"
            max={today}
            min={startDate || undefined}
          />
          <button
            onClick={handleManualRefresh}
            className="px-5 py-3 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🔄 Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4 text-left">Website</th>
                <th className="p-4 text-left">Status History</th>
              </tr>
            </thead>
            <tbody>
              {websites.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-6 text-gray-400">
                    No websites found.
                  </td>
                </tr>
              ) : (
                websites.map((site) => {
                  const groupedHistory = groupStatusByDay(site.statusHistory);
                  return (
                    <tr
                      key={site.id}
                      className="border-b"
                      onClick={() =>
                        router.push(`/dashboard/website-monitor/${site.id}`)
                      }
                    >
                      <td className="p-4 font-medium">{site.site_name}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-4">
                          {Object.entries(groupedHistory).map(
                            ([date, histories]) => (
                              <div
                                key={date}
                                className="flex items-center gap-2"
                              >
                                <div className="text-xs text-gray-500 w-24">
                                  {new Date(date).toLocaleDateString([], {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </div>
                                {renderStatusBars(histories)}
                              </div>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
