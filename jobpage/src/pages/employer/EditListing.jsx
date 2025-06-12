import { useNavigate, useParams } from "react-router-dom";
import React, { useState, useEffect } from "react";

export default function EditListing({ setAlert }) {
    const { listingId } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: "",
        location: "",
        type: "",
        experience: "",
        salary: "",
        description: ""
    });

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const res = await fetch(`http://localhost:8000/listings/${listingId}`);
                if (!res.ok) throw new Error("Failed to fetch job listing");
                const data = await res.json();
                setForm({
                    title: data.title || "",
                    location: data.location || "",
                    type: data.type || "",
                    experience: data.experience || "",
                    salary: data.salary || "",
                    description: data.description || ""
                });
            } catch (err) {
                setAlert({ type: "error", message: "Error loading lob listing." });
                navigate("/listings");
            } finally {
                setLoading(false);
            }
        };
        fetchListings();
    }, [listingId, navigate, setAlert]);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:8000/listings/${listingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( form ),
            });
            if (!res.ok) throw new Error("Failed to update job listing");
            await res.json();
            navigate("/listings");
        } catch (err) {
            setAlert({ type: "error", message: "Error updating lob listing." });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading your job listing...</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
            <div className="max-w-4xl mx-auto py-10 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-blue-600">Edit Job Listing</h1><br></br>
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
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Job Title"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="Location"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <select
                            value={form.type}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        >
                            <option>Full-Time</option>
                            <option>Part-Time</option>
                            <option>Internship</option>
                            <option>Contract</option>
                        </select>
                        <input
                            name="experience"
                            value={form.experience}
                            onChange={handleChange}
                            placeholder="Experience Required"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <input
                            name="salary"
                            value={form.salary}
                            onChange={handleChange}
                            placeholder="Salary"
                            className="border p-2 rounded w-full"
                            required
                        />
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Job Description"
                            className="border p-2 rounded w-full"
                            rows={20}
                            required
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Save"}
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
                </div>
            </div>
        </div>
    );
}