import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function Dashboard({ logout, showProfileEditor, setAlert }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({});
  const [form, setForm] = useState({
    employer_name: "",
    username: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedEmployer = JSON.parse(localStorage.getItem("user"));
      setEmployer(storedEmployer);
      setForm({
        employer_name: storedEmployer?.employer_name || "",
        username: storedEmployer?.username || "",
      });
    } catch {
      setEmployer(null);
    }
  }, []);

  useEffect(() => {
      const employerId = employer?.id;
    if (!employerId) return;
      fetch(apiBaseUrl + `/applications/status/employer/${employerId}`)
        .then(res => res.json())
        .then(setCounts)
        .catch(err => console.error("Failed to fetch application statuses", err));
    }, [employer, apiBaseUrl]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    const employerId = employer?.id;
    if (!employerId) return setAlert({ type: "error", message: "Employer not found." });

    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + `/employers/${employerId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setEmployer(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      navigate("/dashboard");
    } catch (err) {
      setAlert({ type: "error", message: "Error updating profile." });
    } finally {
      setLoading(false);
    }
  };

  if (!employer) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-gray-400 text-xl">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Welcome to Your Dashboard</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate("/home")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Home
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </div>

        <p className="mb-8">
          Manage your job listings, received applications, and account information below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="text-center">
              <h2 className="font-bold text-blue-600">{employer.employer_name}</h2>
              <p>@{employer.username || "yourusername"}</p>
            </div>

            <nav className="space-y-2 text-sm">
              <button
                className="block w-full text-left hover:text-blue-600"
                onClick={() => navigate("/dashboard/profile")}
              >
                Edit Company Name
              </button>
              <button
                className="block w-full text-left hover:text-blue-600"
                onClick={() => navigate("/listings")}
              >
                Job Listings
              </button>
              <button
                className="block w-full text-left hover:text-blue-600"
                onClick={() => navigate("/employer/applications")}
              >
                Applications
              </button>
              <button
                className="block w-full text-left hover:text-blue-600"
                onClick={() => navigate("/reset")}
              >
                Reset Password
              </button>
              <button
                onClick={logout}
                className="block w-full text-left text-red-600 hover:underline"
              >
                Log Out
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
            <section>
              {!showProfileEditor ? (
                <div>
                  <h3 className="text-xl font-bold mb-2 text-blue-600">Application Status Summary</h3> <br></br>
                  <div><b>Total Applications:</b> <br></br> {counts["Total"] || <span className="text-gray-400">0</span>}</div> <br></br>
                  <div><b>Submitted:</b> <br></br> {counts["Submitted"] || <span className="text-gray-400">0</span>}</div> <br></br>
                  <div><b>Under Review:</b> <br></br> {counts["Under Review"]|| <span className="text-gray-400">0</span>}</div> <br></br>
                  <div><b>Interview:</b> <br></br> {counts["Interview"] || <span className="text-gray-400">0</span>}</div> <br></br>
                  <div><b>Rejected:</b> <br></br> {counts["Rejected"] || <span className="text-gray-400">0</span>}</div> <br></br>
                  <div><b>Accepted:</b> <br></br> {counts["Accepted"] || <span className="text-gray-400">0</span>}</div>
                </div>
              ) : (
                <>
                <h3 className="text-xl font-bold mb-2 text-blue-600">Edit Company Name</h3>
                <form onSubmit={handleSave} className="space-y-6">
                  <input
                    name="employer_name"
                    value={form.employer_name}
                    onChange={handleChange}
                    placeholder="Company Name"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
