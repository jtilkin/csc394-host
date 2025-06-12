import { Link, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import JbwButton from "../components/buttons";

export default function Welcome({ token, setToken, logout }) {
  const navigate = useNavigate();

  return (
    <>
      <NavBar token={token} onLogout={logout} />

      <main className="max-w-4xl mx-auto text-center p-10">
        <h1 className="text-4xl font-extrabold text-primary mb-4">
          Find your dream job.
        </h1>
        <p className="text-gray-700 mb-8">
          JobberWobber allows you search job positions in
          seconds — no account required. Sign up to start applying and get
          personalized recommendations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <JbwButton onClick={() => navigate("/home")} className="text-lg">
            Search Jobs
          </JbwButton>

          {!token && (
            <Link
              to="/signup"
              className="text-lg underline text-primary hover:text-primaryHover flex items-center"
            >
              Create a free account →
            </Link>
          )}
        </div>

        <img
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=960&q=80"
          alt="People working remotely"
          className="rounded-lg shadow-lg mt-12 mx-auto"
        />
      </main>
    </>
  );
}
