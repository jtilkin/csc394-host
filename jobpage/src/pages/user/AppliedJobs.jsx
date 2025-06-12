import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AppliedJobs() {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) return;

    fetch(apiBaseUrl + `/applications/${storedUser.id}`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [apiBaseUrl]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Applications</h1>
          <div className="space-x-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Dashboard
            </button>
          </div>
        </div>

        <p className="mb-8">
          View and track your submitted applications below.
        </p>

        <div className="md:col-span-4 bg-white rounded-lg shadow p-6 space-y-6">
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : jobs.length === 0 ? (
          <p className="text-gray-500">You have not applied to any jobs yet.</p>
        ) : (
          <ul className="space-y-4">
            {jobs.map((job) => (
              <li className="p-5 border rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-primary mb-1">{job.title}</h2>

                <div className="mb-2">
                  {job.type && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                      {job.type}
                    </span>
                  )}
                {job.experience && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {job.experience}
                    </span>
                  )}
                </div>

                {job.company && <p>{job.company}</p>}
                {job.location && <p>{job.location}</p>}
                {job.salary && <p>{job.salary}</p>}
              </div>

              <div class="text-right">
                <p>Applicaton ID:</p>
                {job.status && <p><strong>{job.app_id}</strong></p>}
                <br></br>
                <p>Status:</p>
                {job.status && <p><strong>{job.status}</strong></p>}
              </div>
            </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
}

