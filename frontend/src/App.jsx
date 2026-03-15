// Authors: Abhimanyu Dudeja, Kashish Rahulbhai Khatri
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./components/Home.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import PitchList from "./components/PitchList.jsx";
import PitchDetail from "./components/PitchDetail.jsx";
import PitchForm from "./components/PitchForm.jsx";
import Portfolio from "./components/Portfolio.jsx";
import Leaderboard from "./components/Leaderboard.jsx";
import Profile from "./components/Profile.jsx";
import UserProfile from "./components/UserProfile.jsx";
import api from "./api.js";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("fundtank_token");
    if (token) {
      api
        .getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("fundtank_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  function handleLogin(token, userData) {
    localStorage.setItem("fundtank_token", token);
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("fundtank_token");
    setUser(null);
  }

  async function refreshUser() {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          color: "var(--text-secondary)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar user={user} onLogout={handleLogout} />
      <main style={{ paddingTop: "72px", minHeight: "calc(100vh - 72px)" }}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register onLogin={handleLogin} />}
          />
          <Route path="/pitches" element={<PitchList user={user} />} />
          <Route
            path="/pitches/:id"
            element={<PitchDetail user={user} refreshUser={refreshUser} />}
          />
          <Route
            path="/pitches/new"
            element={user ? <PitchForm user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/pitches/:id/edit"
            element={user ? <PitchForm user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/portfolio"
            element={
              user ? (
                <Portfolio user={user} refreshUser={refreshUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/profile"
            element={
              user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" />
            }
          />
          <Route path="/users/:id" element={<UserProfile />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
