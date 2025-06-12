import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import JbwButton from "../components/buttons";

export default function Signup({ setToken, setUser, setAlert }) {
  const nav = useNavigate();

  const [user, setUserInput] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [employerName, setEmployerName] = useState("");

  const submit = (e) => {
    e.preventDefault();

    const data = {
      username: user,
      password: pw,
      role,
      ...(role === "user" && { first_name: firstName, last_name: lastName }),
      ...(role === "employer" && { employer_name: employerName }),
    };

    fetch("http://localhost:8000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => null);
          const message = errData?.detail || "Signup failed";
          throw new Error(message);
        }
        return r.json();
      })
      .then((d) => {
        const account = d.user || d.employer;
        localStorage.setItem("token", d.access_token);
        localStorage.setItem("user", JSON.stringify(account));
        setToken(d.access_token);
        setUser(account);

        setAlert({ type: "success", message: "Account created!" });

        if (account.role === "user") {
          nav("/user/dashboard");
        } else if (account.role === "employer") {
          nav("/employer/dashboard");
        } else {
          nav("/");
        }
      })
      .catch((err) => {
        console.error("Signup error:", err);
        setAlert({ type: "error", message: err.message || "Signup failed" });
      });
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-primary">Sign up</h1>

      <form onSubmit={submit} className="space-y-4">
        <input
          value={user}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Choose a username"
          className="w-full p-3 border rounded-md"
          required
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full p-3 border rounded-md"
          required
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-3 border rounded-md"
          required
        >
          <option value="">Select account type</option>
          <option value="user">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>

        {role === "user" && (
          <>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              className="w-full p-3 border rounded-md"
              required
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              className="w-full p-3 border rounded-md"
              required
            />
          </>
        )}

        {role === "employer" && (
          <input
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            placeholder="Employer Name"
            className="w-full p-3 border rounded-md"
            required
          />
        )}

        <JbwButton className="w-full">Create account</JbwButton>
      </form>

      <p className="mt-4 text-center text-sm">
        Have an account?{" "}
        <Link to="/login" className="underline text-primary">
          Log in
        </Link>
      </p>

      <p className="mt-4 text-center text-sm">
        Back to{" "}
        <Link to="/welcome" className="underline text-primary">
          Home
        </Link>
      </p>
    </div>
  );
}

