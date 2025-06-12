import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ApplicationDetail({ setAlert }) {
  const { id }   = useParams();                
  const [data,setData]   = useState(null);
  const [status,setStatus]=useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8000/application/${id}`)
      .then(r => r.json())
      .then(d => { setData(d); setStatus(d.application.status); })
      .catch(() => setAlert({ type: "error", message: "Unable to load application." }));
  }, [id, setAlert]);

  const saveStatus = () => {
    fetch(`http://localhost:8000/application/${id}/status`,{
      method:"PUT",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({ status })
    })
      .then(r=>r.json())
      .then(() => setAlert({ type: "success", message: "Status updated." }))
      .catch(()=> setAlert({ type: "error", message: "Unable to update status." }));
  };

  if (!data) return null;

  const { listing, applicant } = data;

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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4 text-blue-600">
        Application #{id} <br></br> {listing.title}
      </h1>

      <h2 className="text-xl font-bold mb-2">Contact Information:</h2>
        <div><b>Full Name:</b> {(applicant.first_name || "") + " " + (applicant.last_name || "")}</div>
        <div><b>Email:</b> {applicant.email || <span className="text-gray-400">None</span>}</div>
        <div><b>Phone:</b> {applicant.phone || <span className="text-gray-400">None</span>}</div>
        <div><b>Location:</b> {applicant.location || <span className="text-gray-400">None</span>}</div>
                  <div>
                    <b>LinkedIn:</b>{" "}
                    {applicant.linkedin_url ? (
                      <a
                        href={applicant.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#14B8A6] underline"
                      >
                        {applicant.linkedin_url}
                      </a>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div> <br></br>

                  <FormatTextField category="Summary" text={applicant.summary}/>
                  <FormatTextField category="Experience" text={applicant.experience}/>
                  <FormatTextField category="Education" text={applicant.education}/>
                  <FormatTextField category="Skills" text={applicant.skills}/>
                  <FormatTextField category="Other" text={applicant.other}/>

      <label className="block text-xl font-bold mb-2">Status:</label>
      <div class="flex items-center gap-4">
        <select
          value={status}
          onChange={e=>setStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option>Submitted</option>
          <option>Under Review</option>
          <option>Interview</option>
          <option>Rejected</option>
          <option>Accepted</option>
        </select>

        <button
          onClick={saveStatus}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
