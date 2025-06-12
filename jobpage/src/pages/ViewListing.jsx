import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ViewListing({ setAlert }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(apiBaseUrl + "/jobcard")
      .then((res) => res.json())
      .then((data) => {
        const match = data.find((l) => l.id.toString() === id);
        if (!match) {
          setAlert({ type: "error", message: "Job listing not found." });
          navigate("/home");
          return;
        }
        setListing(match);
      })
      .catch(() => {
        setAlert({ type: "error", message: "Error fetching job listing." });
        navigate("/home");
      })
      .finally(() => setLoading(false));
  }, [id, navigate, setAlert, apiBaseUrl]);

  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setAlert({ type: "error", message: "Please log in to apply for this job." });
      return;
    }

    if (user.role !== "user") {
      setAlert({ type: "error", message: "Only job seekers can apply for jobs." });
      return;
    }

    const application = {
      user_id: user.id,
      employer_id: listing.employer_id,
      job_listing_id: listing.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      linkedin_url: user.linkedin_url,
      experience: user.experience,
      skills: user.skills,
      education: user.education,
      summary: user.summary,
      other: user.other,
    };

    try {
      const res = await fetch(apiBaseUrl + "/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(application),
      });

      if (res.status === 409) {
        const data = await res.json();
        setAlert({ type: "error", message: data.detail || "Already applied to this job." });
      } else if (!res.ok) {
        throw new Error("Failed to apply.");
      } else {
        setAlert({ type: "success", message: "Application submitted successfully!" });
      }
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", message: "Error submitting application." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-gray-400 text-xl">Loading job listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-gray-400 text-xl">Job listing not found.</div>
      </div>
    );
  }

  const FormatTextField = ({ category, text }) => {
    if (!text) {
      return (
        <div>
          <h2><strong>{category}:</strong></h2>
          <p className="text-gray-400">None</p>
        </div>
      );
    }

    return (
      <div>
        <h2><strong>{category}:</strong></h2>
        {text.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="md:col-span-4 bg-white rounded-lg shadow p-6 space-y-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">{listing.title}</h2>
          <div className="space-y-2">
            <p><strong>Company:</strong> {listing.company}</p>
            <p><strong>Location:</strong> {listing.location}</p>
            <p><strong>Type:</strong> {listing.type}</p>
            <p><strong>Experience:</strong> {listing.experience}</p>
            <p><strong>Salary:</strong> {listing.salary}</p>
            <FormatTextField category="Description" text={listing.description} />
          </div>

          <div className="mt-6 flex gap-4">
            <button
              type="button"
              onClick={handleApply}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Apply
            </button>

            <button
              type="button"
              onClick={() => navigate(`/home`)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Back to Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

