import React, { useState } from "react";
import { Link } from "react-router-dom";

const Reset = ({ setAlert }) => {
  const [username, setUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Verify current password
      const loginRes = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password: currentPassword,
        }),
      });

      if (!loginRes.ok) {
        throw new Error("Current password is incorrect.");
      }

      // Step 2: Update password
      const resetRes = await fetch("http://localhost:8000/reset/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ new_password: newPassword }),
      });

      const resetData = await resetRes.json();
      if (!resetRes.ok) throw new Error(resetData.detail || "Error resetting password");

      setAlert({ type: "success", message: "Password updated successfully!" });
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  };

  return (
    <div>
      <div className="max-w-md mx-auto mt-12 p-6 border border-gray-300 rounded shadow">
        <h2 className="text-2xl font-semibold text-center mb-6 text-blue-600">
          Reset Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded w-full"
          >
            Submit
          </button>
        </form>
      </div>
      <p className="mt-4 text-center text-sm">
        Back to{" "}
        <Link to="/dashboard" className="underline text-primary">
          Dashboard
        </Link>
      </p>
    </div>
  );
};

export default Reset;

