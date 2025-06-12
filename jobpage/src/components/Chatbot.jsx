import { useState, useRef, useEffect } from "react";
import JbwButton from "./buttons";

export default function Chatbot({ searchHistory = [] }) {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

  const [open, setOpen]     = useState(false);
  const [input, setInput]   = useState("");
  const [history, setHist]  = useState([]); 
  const bottomRef = useRef(null);

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, open]);
  useEffect(() => {
    if (open && history.length === 0) {
     setHist([{ role: "assistant", content: "Hey I’m Jobber, You can ask me for any job suggestions or career help :)" }]);
    }
  }, 
  [open, history.length]);
  const send = () => {
    if (!input.trim()) return;
    const newHist = [...history, { role: "user", content: input }];
    setHist(newHist);
    setInput("");

    fetch(apiBaseUrl + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ history: newHist, search_history: searchHistory }),
    })
      .then(r => r.json())
      .then(d => {
        setHist(h => [
          ...h,
          { role: "assistant", content: d.reply },
          ...(d.jobs && d.jobs.length ? [{ role: "assistant_jobs", jobs: d.jobs }] : [])
        ]);
      })
      .catch(() =>
        setHist(h => [...h, { role: "assistant", content: "Sorry, I had a problem answering." }])
      );
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-primary text-white p-3 shadow-lg"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-16 right-4 w-72 h-96 bg-white border rounded-lg shadow-xl flex flex-col z-40">
          <div className="p-2 text-center font-semibold bg-primary text-white rounded-t-lg">
            JobberWobber Chat
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2 text-sm">
            {history.map((m, idx) =>
              m.role === "assistant_jobs" ? (
                <div key={idx} className="space-y-2">
                  {m.jobs.map(job => (
                    <div key={job.url} className="border p-2 rounded bg-gray-50">
                      <p className="font-semibold">{job.title}</p>
                      <p className="text-gray-600">{job.company}</p>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-1 text-blue-600 underline"
                      >
                        Apply
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  key={idx}
                  className={m.role === "user" ? "text-right" : "text-left text-primary"}
                >
                  {m.content}
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
            className="p-2 border-t flex gap-1"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-grow border rounded-md p-1 text-sm"
              placeholder="Ask me..."
            />
            <JbwButton className="!px-3 !py-1 text-sm">↩</JbwButton>
          </form>
        </div>
      )}
    </>
  );
}
