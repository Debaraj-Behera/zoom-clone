import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="LandingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>Debaraj's VC App</h2>
        </div>
        <div className="navLists">
          <p className="btn guest" onClick={() => navigate("/guest")}>
            Join as Guest
          </p>
          <p className="btn register" onClick={() => navigate("/auth")}>
            Register
          </p>
          <p className="btn login" onClick={() => navigate("/auth")}>
            Login
          </p>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div>
          <h1>
            <span style={{ color: "#f78503" }}>Connect</span> with your loved ones
          </h1>
          <p>Cover a distance by Apna Video Call</p>
          <Link to="/auth">
            <button className="btn">Get Started</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
