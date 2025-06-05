import React, { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/authAuthentication";
import { AuthProvider } from "./contexts/AuthContext";
import VideoMeetComponent from "./pages/VideoMeetComponent";
import Home from "./pages/Home";
import History from "./pages/History";

function App() {
  return (
    <>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path="/home" element={<Home />} />
            <Route path="/history" element={<History />} />
            <Route path="/:url" element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
