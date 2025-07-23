"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  FiUser,
  FiMail,
  FiSave,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { BASE_URL } from "@/services/baseUrl";

const UserProfile = () => {
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [userDetails, setUserDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: null });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch(`${BASE_URL}/api/auth/current-user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
          credentials: "include",
        });
        const data = await response.json();
        if (response.ok) {
          setUserDetails(data.user);
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
          });
        } else {
          setStatus({
            type: "error",
            message: data.message || "Failed to fetch user details",
          });
        }
      } catch (error) {
        setStatus({
          type: "error",
          message: "Error fetching user details",
        });
      }
    };

    fetchUserDetails();
  }, [session?.accessToken]);

  useEffect(() => {
    let timer;
    if (status.type) {
      timer = setTimeout(() => {
        setStatus({ type: null, message: null });
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [status]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (status.type) {
      setStatus({ type: null, message: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setStatus({ type: null, message: null });

    try {
      const response = await fetch(`${BASE_URL}/api/current-user/update-me`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      setUserDetails(data.user);
      setStatus({
        type: "success",
        message: "Profile updated successfully!",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile information
          </p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-black`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    } rounded-md focus:outline-black`}
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="animate-spin mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                {status.type && (
                  <div
                    className={`mt-4 p-3 rounded-md ${
                      status.type === "success"
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    <div className="flex items-center">
                      {status.type === "success" ? (
                        <FiCheckCircle className="h-5 w-5 mr-2" />
                      ) : (
                        <FiAlertCircle className="h-5 w-5 mr-2" />
                      )}
                      <span className="text-sm">{status.message}</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Account Information
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Joined Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {userDetails?.createdAt
                    ? new Date(userDetails.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Last Updated
                </p>
                <p className="mt-1 text-sm text-gray-900">
                  {userDetails?.updatedAt
                    ? new Date(userDetails.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">
                  {userDetails?.phone || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <p className="mt-1 text-sm text-gray-900">
                  {userDetails?.role || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">User Type</p>
                <p className="mt-1 text-sm text-gray-900">
                  {userDetails?.user_type || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
