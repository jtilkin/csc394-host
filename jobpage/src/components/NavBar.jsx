import JbwButton from "./buttons";
import { Link } from "react-router-dom";

export default function NavBar({ token, onLogout }) {
  return (
    <header className="bg-primary text-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="text-2xl font-bold tracking-wide">
          <span className="opacity-90">Jobber</span>
          <span className="opacity-75">Wobber</span>
        </Link>

        <div className="flex items-center gap-3">
          <JbwButton
            as={Link}
            to="/home"
            className="!px-3 !py-1.5 text-sm min-w-[100px] text-center"
          >
            Search&nbsp;Jobs
          </JbwButton>

          {token ? (
            <>
              <JbwButton
                as={Link}
                to="/dashboard"
                className="!px-3 !py-1.5 text-sm min-w-[100px] text-center"
              >
                Dashboard
              </JbwButton>
              
              <JbwButton 
                onClick={onLogout}
                className="!px-3 !py-1.5 text-sm min-w-[100px] text-center"
              >
                Log&nbsp;Out
              </JbwButton>
            </>
          ) : (
            <>
              <JbwButton
                as={Link}
                to="/signup"
                className="!px-3 !py-1.5 text-sm min-w-[100px] text-center"
              >
                Sign&nbsp;Up
              </JbwButton>

              <JbwButton
                as={Link}
                to="/login"
                className="!px-3 !py-1.5 text-sm min-w-[100px] text-center"
              >
                Log&nbsp;In
              </JbwButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

