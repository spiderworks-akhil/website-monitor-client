"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FiArrowLeft,
  FiExternalLink,
  FiClock,
  FiActivity,
  FiAlertCircle,
  FiTrash2,
} from "react-icons/fi";
import { BASE_URL } from "@/services/baseUrl";

const WebsiteDetails = ({ params }) => {
  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeletePopover, setShowDeletePopover] = useState(false);
  const [showWebsiteDeleteModal, setShowWebsiteDeleteModal] = useState(false);
  const [isDeletingWebsite, setIsDeletingWebsite] = useState(false);
  const unwrappedParams = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchWebsite = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/websites/website-details/${unwrappedParams.id}?range=${timeRange}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch website");
      const data = await res.json();
      setWebsite(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeletePopover(true);
  };

  const handleWebsiteDeleteClick = () => {
    setShowWebsiteDeleteModal(true);
  };

  const deleteStatusHistory = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(
        `${BASE_URL}/api/websites/website-details/${unwrappedParams.id}/status-history`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete status history");

      setWebsite((prev) => ({
        ...prev,
        statusHistory: [],
        uptimePercentage: 0,
        slowResponses: 0,
        downtimeCount: 0,
      }));
    } catch (err) {
      setError("Failed to delete status history: " + err.message);
    } finally {
      setIsDeleting(false);
      setShowDeletePopover(false);
    }
  };

  const deleteWebsite = async () => {
    try {
      setIsDeletingWebsite(true);
      const res = await fetch(
        `${BASE_URL}/api/websites/website-delete/${unwrappedParams.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete website");

      router.push("/dashboard/website-monitor");
    } catch (err) {
      setError("Failed to delete website: " + err.message);
    } finally {
      setIsDeletingWebsite(false);
      setShowWebsiteDeleteModal(false);
    }
  };

  useEffect(() => {
    fetchWebsite();
  }, [unwrappedParams.id, timeRange]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-6 max-w-md mx-auto bg-red-50 rounded-lg shadow mt-10">
        <div className="text-red-600 flex items-center gap-2">
          <FiAlertCircle className="text-xl" />
          <h2 className="text-lg font-medium">Error loading website</h2>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={fetchWebsite}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );

  if (!website)
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow mt-10 text-center">
        <h2 className="text-lg font-medium">Website not found</h2>
        <Link
          href="/websites"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Back to websites
        </Link>
      </div>
    );

  const statusCounts = {
    success:
      website.statusHistory?.filter((c) => c.status === "Success").length || 0,
    slow: website.statusHistory?.filter((c) => c.status === "Slow").length || 0,
    down:
      website.statusHistory?.filter(
        (c) => c.status !== "Success" && c.status !== "Slow"
      ).length || 0,
  };

  const totalChecks =
    statusCounts.success + statusCounts.slow + statusCounts.down;
  const successPercentage =
    totalChecks > 0
      ? Math.round((statusCounts.success / totalChecks) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link
              href="/dashboard/website-monitor"
              className="flex items-center text-blue-600 hover:underline"
            >
              <FiArrowLeft className="mr-1" /> Back to Websites
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2 text-gray-800">
              {website.site_name}
            </h1>
            <div className="flex items-center mt-1">
              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {website.url} <FiExternalLink className="ml-1 text-sm" />
              </a>
            </div>
          </div>

          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm">
            {["24h", "7d", "30d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition ${
                  timeRange === range
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {range === "24h"
                  ? "24 Hours"
                  : range === "7d"
                  ? "7 Days"
                  : "30 Days"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Uptime</p>
                <p className="text-3xl font-bold mt-1">
                  {website.uptimePercentage || "N/A"}%
                </p>
              </div>
              <div className="w-16 h-16">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path
                    className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="circle-success"
                    strokeDasharray={`${successPercentage}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
              <span className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                {statusCounts.success} Successful
              </span>
              <span className="flex items-center text-sm text-yellow-600">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                {statusCounts.slow} Slow
              </span>
              <span className="flex items-center text-sm text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                {statusCounts.down} Down
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <FiClock className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Checked</p>
                {website.last_check_time && (
                  <p className="text-3xl font-bold mt-1">
                    {new Date(website.last_check_time).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Last check</span>
                <span className="font-medium text-gray-700">
                  {website.last_check_time
                    ? new Date(website.last_check_time).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <FiActivity className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Incidents</p>
                <p className="text-3xl font-bold mt-1">
                  {website.downtimeCount || 0}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Total downtime</span>
                <span className="font-medium text-gray-700">
                  {website.totalDowntime
                    ? `${(website.totalDowntime / 60).toFixed(1)} minutes`
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Status Checks</h2>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting || !website.statusHistory?.length}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${
                  isDeleting || !website.statusHistory?.length
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <FiTrash2 />
                {isDeleting ? "Deleting..." : "Delete Status History"}
              </button>
              <button
                onClick={handleWebsiteDeleteClick}
                disabled={isDeletingWebsite}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${
                  isDeletingWebsite
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <FiTrash2 />
                {isDeletingWebsite ? "Deleting..." : "Delete Website"}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {website.statusHistory?.length ? (
                  website.statusHistory.map((check) => (
                    <tr key={check.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(check.check_time).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            check.status === "Success"
                              ? "bg-green-100 text-green-800"
                              : check.status === "Slow"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {check.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No status history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDeletePopover && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Website Status Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete the entire status history for this
              website? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeletePopover(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteStatusHistory}
                disabled={isDeleting}
                className={`px-4 py-2 text-sm text-white rounded-md transition ${
                  isDeleting
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showWebsiteDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Website Deletion
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this website? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWebsiteDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={deleteWebsite}
                disabled={isDeletingWebsite}
                className={`px-4 py-2 text-sm text-white rounded-md transition ${
                  isDeletingWebsite
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeletingWebsite ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .circular-chart {
          display: block;
          margin: 0 auto;
          max-width: 100%;
          max-height: 100%;
        }
        .circle-bg {
          fill: none;
          stroke: #eee;
          stroke-width: 3;
        }
        .circle-success {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke: #10b981;
          animation: circle-fill-animation 1.5s ease-in-out;
        }
        @keyframes circle-fill-animation {
          0% {
            stroke-dasharray: 0, 100;
          }
        }
      `}</style>
    </div>
  );
};

export default WebsiteDetails;
