import { useNavigate } from "react-router-dom";

export default function JobCard({ job }) {
  const navigate = useNavigate();

  function getDaysAgo(pubDate) {
    const postedDate = new Date(pubDate);
    const now = new Date();
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? "Posted today" : `Posted ${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  }

  const handleDetails = () => {
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    } else {
      navigate(`/listing/${job.id}`);
    }
  };

  return (
    <li className="p-5 border rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-start">
      <div>
        <h2 className="text-lg font-semibold text-primary mb-1">{job.title}</h2>

        {job.publication_date && (
          <p className="text-xs text-gray-500 italic mb-2">
            {getDaysAgo(job.publication_date)}
          </p>
        )}

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

      <div>
        <button
          type="button"
          onClick={handleDetails}
          className="bg-blue-600 text-white px-2 py-1 text-sm rounded hover:bg-blue-700"
        >
          Details
        </button>
      </div>
    </li>
  );
}
