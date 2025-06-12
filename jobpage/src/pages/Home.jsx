import { useState, useEffect } from "react";
import NavBar     from "../components/NavBar";
import JbwButton  from "../components/buttons";      
import JobCard    from "../components/JobCard";

export default function Home({ token, logout, onSearch }) {
  const [search, setSearch]  = useState("");
  const [jobs,   setJobs]    = useState([]);
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState(null);

  const fetchJobs = async (q) => {
    setLoading(true);
    setError(null);

    try {
      const localUrl = q ? `/search?q=${encodeURIComponent(q)}` : `/jobcard`;
      //const adzunaUrl = `/adzuna?q=${encodeURIComponent(q || "software")}`;

      const localRes = await fetch("http://localhost:8000" + localUrl).then(r => r.json());
      /*
      const [localRes, adzunaRes] = await Promise.all([
        fetch("http://localhost:8000" + localUrl).then(r => r.json()),
        fetch("http://localhost:8000" + adzunaUrl).then(r => r.json())
      ]);
      */

      const localJobs = Array.isArray(localRes) ? localRes : localRes.listings ?? [];
      //const adzunaJobs = Array.isArray(adzunaRes) ? adzunaRes : [];

      setJobs([...localJobs]);
      //setJobs([...localJobs, ...adzunaJobs]);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(""); }, []);

  return (
    <>
      <NavBar token={token} onLogout={logout} />

      <main className="max-w-4xl mx-auto p-6">
        <form
          onSubmit={e => {
            e.preventDefault();
            const q = search.trim();
            onSearch?.(q);
            fetchJobs(q);
          }}
          className="flex gap-2 mb-8"
        >
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title…"
            className="flex-grow p-3 border rounded-md focus:outline-primary/70"
          />
          <JbwButton>Search</JbwButton>
        </form>

        {loading && <p>Loading…</p>}
        {error   && <p className="text-red-600">{error}</p>}
        {!loading && !error && jobs.length === 0 && <p>No listings found.</p>}

        <ul className="space-y-4">
          {jobs.map((j, idx) => (
            <JobCard key={j.id ?? j.url ?? idx} job={j} />
          ))}
        </ul>
      </main>
    </>
  );
}
