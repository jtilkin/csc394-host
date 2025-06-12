import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function UserResume({ setAlert }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
  
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    summary: "",
    experience: "",
    education: "",
    skills: "",
    other: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      setForm({
        first_name: storedUser?.first_name || "",
        last_name: storedUser?.last_name || "",
        email: storedUser?.email || "",
        phone: storedUser?.phone || "",
        location: storedUser?.location || "",
        linkedin_url: storedUser?.linkedin_url || "",
        summary: storedUser?.summary || "",
        experience: storedUser?.experience || "",
        education: storedUser?.education || "",
        skills: storedUser?.skills || "",
        other: storedUser?.other || "",
      });
    } catch {
      setUser(null);
    }
  }, []);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => setEditing(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async e => {
    e.preventDefault();
    const userId = user?.id;
    if (!userId) return setAlert({ type: "error", message: "User not found." });

    setLoading(true);
    try {
      const res = await fetch(apiBaseUrl + `/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to update resume");
      const updated = await res.json();
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setEditing(false);
    } catch (err) {
      setAlert({ type: "error", message: "Error updating resume." });
    } finally {
      setLoading(false);
    }
  };

  const FormatTextField = ({ category, text }) => {
    if (!text) {
      return (
        <div>
          <h2 className="text-xl font-bold mb-2">{category}:</h2>
          <p className="text-gray-400">None</p>
          <br></br>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-xl font-bold mb-2">{category}:</h2>
        {text.split("\n").map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <br></br>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-gray-400 text-xl">Loading your resume...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Resume</h1>
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
          View and update your resume below.
        </p>

        <div>
          {/* Main Content */}
          <div className="md:col-span-4 bg-white rounded-lg shadow p-6 space-y-6">
            <section>
              {!editing ? (
                <div>
                    <h2 className="text-xl font-bold mb-2">Contact Information:</h2>
                  <div><b>Full Name:</b> {(user.first_name || "") + " " + (user.last_name || "")}</div>
                  <div><b>Email:</b> {user.email || <span className="text-gray-400">None</span>}</div>
                  <div><b>Phone:</b> {user.phone || <span className="text-gray-400">None</span>}</div>
                  <div><b>Location:</b> {user.location || <span className="text-gray-400">None</span>}</div>
                  <div>
                    <b>LinkedIn:</b>{" "}
                    {user.linkedin_url ? (
                      <a
                        href={user.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#14B8A6] underline"
                      >
                        {user.linkedin_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div> <br></br>

                  <FormatTextField category="Summary" text={user.summary}/>
                  <FormatTextField category="Experience" text={user.experience}/>
                  <FormatTextField category="Education" text={user.education}/>
                  <FormatTextField category="Skills" text={user.skills}/>
                  <FormatTextField category="Other" text={user.other}/>
    
                  <div className="flex gap-2">
                    <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={handleEdit}
                    >
                        Edit Resume
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-2">
                    <h2 className="text-xl font-bold mb-2">Contact Information:</h2>
                  <div className="flex gap-2">
                    <input
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="border p-2 rounded w-1/2"
                      disabled={loading}
                    />
                    <input
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="border p-2 rounded w-1/2"
                      disabled={loading}
                    />
                  </div>
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />
                  <input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Location"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />
                  <input
                    name="linkedin_url"
                    value={form.linkedin_url}
                    onChange={handleChange}
                    placeholder="LinkedIn URL"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <h2 className="text-xl font-bold mb-2">Summary:</h2>
                  <textarea
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    placeholder="Summary"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <h2 className="text-xl font-bold mb-2">Experience:</h2>
                  <textarea
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="Experience"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <h2 className="text-xl font-bold mb-2">Education:</h2>
                  <textarea
                    name="education"
                    value={form.education}
                    onChange={handleChange}
                    placeholder="Education"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <h2 className="text-xl font-bold mb-2">Skills:</h2>
                  <textarea
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    placeholder="Skills"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <h2 className="text-xl font-bold mb-2">Other:</h2>
                  <textarea
                    name="other"
                    value={form.other}
                    onChange={handleChange}
                    placeholder="Other"
                    className="border p-2 rounded w-full"
                    disabled={loading}
                  />

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
