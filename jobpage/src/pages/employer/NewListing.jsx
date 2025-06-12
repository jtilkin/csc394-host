import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewListing({ setAlert }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Full-Time");
  const [experience, setExperience] = useState("");
  const [salary, setSalary] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const employer = JSON.parse(localStorage.getItem("user"));

    const payload = {
      title,
      location,
      type,
      experience,
      salary,
      description,
      employer_id: employer.id,
    };

    try {
      setSubmitting(true);
      const res = await fetch(apiBaseUrl + "/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error creating job listing");
      }

      setAlert({ type: "success", message: "Job listing posted!" });
      navigate("/listings");
    } catch (err) {
      setAlert({ type: "error", message: err.message || "Error posting listing." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">New Job Listing</h1><br />
          <button
            onClick={() => navigate("/listings")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back
          </button>
        </div>

        <div className="md:col-span-4 bg-white rounded-lg shadow p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="text"
              placeholder="Job Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option>Full-Time</option>
              <option>Part-Time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
            <input
              type="text"
              placeholder="Experience Required"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Job Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                disabled={submitting}
              >
                {submitting ? "Posting..." : "Post"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/listings")}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>

          <hr className="my-4" />

          <h4 className="font-semibold">Upload Job Listings via CSV</h4>
          <input
            type="file"
            accept=".csv"
            onChange={async (e) => {
              const employer = JSON.parse(localStorage.getItem("user"));
              if (!employer?.id) {
                setAlert({ type: "error", message: "Employer ID not found" });
                return;
              }

              const file = e.target.files[0];
              const formData = new FormData();
              formData.append("file", file);
              formData.append("employer_id", employer.id);

              try {
                const res = await fetch(apiBaseUrl + "/upload_csv", {
                  method: "POST",
                  body: formData,
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.detail || "CSV upload failed");

                setAlert({ type: "success", message: "Uploaded successfully!" });
                navigate("/listings");
              } catch (err) {
                setAlert({ type: "error", message: "Error uploading CSV: " + err.message });
              }
            }}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}

