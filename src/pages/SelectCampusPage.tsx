import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"

const API = "http://localhost:5000/api/auth";

export default function SelectCampusPage() {
  const navigate = useNavigate();

  const [campuses, setCampuses] = useState<{ _id: string; name: string }[]>([]);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { updateUser } = useAuth()

  // Entrance animation trigger
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Fetch available campuses from the backend
  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await axios.get(`${API}/campuses`);
        setCampuses(res.data);
      } catch (err: any) {
        console.error("Failed to fetch campuses:", err);
        setError("Could not load campuses. Please check your connection or refresh.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCampuses();
  }, []);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (!selectedCampus) {
    setError("Please select a campus to continue.");
    return;
  }

  setIsLoading(true);

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const res = await axios.post(
      `${API}/select-campus`,
      { campusId: selectedCampus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Update the FULL user object from the response, not just campusId
    if (res.data.user) {
      updateUser(res.data.user)  // ← was: updateUser({ campusId: res.data.user.campusId })
    }

    navigate("/dashboard");

  } catch (err: any) {
    console.error("Campus selection error:", err);
    setError(err?.response?.data?.message || "Failed to assign campus. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .campus-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          background: #faf9f7;
          position: relative;
          overflow: hidden;
          padding: 24px;
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          z-index: 0;
        }
        .blob-tr { width: 500px; height: 500px; background: #dcfce7; top: -200px; right: -150px; }
        .blob-bl { width: 400px; height: 400px; background: #bbf7d0; bottom: -150px; left: -100px; }

        .campus-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
          background: #fff;
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .campus-card.mounted {
          opacity: 1;
          transform: translateY(0);
        }

        .brand-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 32px;
        }

        .brand-icon {
          width: 36px;
          height: 36px;
          background: #1a3a2a;
          color: #fff;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 18px;
        }

        .brand-name {
          font-family: 'DM Serif Display', serif;
          font-size: 20px;
          color: #1a3a2a;
          letter-spacing: -0.3px;
        }

        .card-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .card-title {
          font-family: 'DM Serif Display', serif;
          font-size: 32px;
          color: #111;
          letter-spacing: -0.5px;
          margin-bottom: 12px;
          line-height: 1.1;
        }

        .card-sub {
          font-size: 15px;
          color: #666;
          line-height: 1.5;
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 24px;
          font-size: 13px;
          color: #b91c1c;
          animation: shake 0.35s ease;
        }

        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .field-group {
          margin-bottom: 32px;
        }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #444;
          margin-bottom: 8px;
        }

        .select-wrap {
          position: relative;
        }

        .custom-select {
          width: 100%;
          padding: 14px 40px 14px 16px;
          border: 1.5px solid #e5e5e5;
          border-radius: 12px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          color: #111;
          background: #fff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
          cursor: pointer;
        }

        .custom-select:focus {
          border-color: #1a3a2a;
          box-shadow: 0 0 0 3px rgba(26,58,42,0.08);
        }

        .custom-select:disabled {
          background: #f9f9f9;
          cursor: not-allowed;
          color: #888;
        }

        .select-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #888;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .btn-submit {
          width: 100%;
          padding: 14px;
          background: #1a3a2a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
        }

        .btn-submit:hover:not(:disabled) { background: #243f30; }
        .btn-submit:active:not(:disabled) { transform: scale(0.99); }
        .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .notice-text {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #888;
          line-height: 1.5;
        }

        .notice-text span {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #b91c1c;
          font-weight: 500;
          margin-top: 4px;
        }

        @media (max-width: 480px) {
          .campus-card { padding: 32px 24px; }
        }
      `}</style>

      <div className="campus-root">
        <div className="bg-blob blob-tr" />
        <div className="bg-blob blob-bl" />

        <div className={`campus-card${mounted ? " mounted" : ""}`}>
          
          <div className="brand-header">
            <div className="brand-icon">🌿</div>
            <span className="brand-name">PassItOn</span>
          </div>

          <div className="card-header">
            <h1 className="card-title">Where are you studying?</h1>
            <p className="card-sub">
              Select your campus to enter your local college marketplace and connect with your peers.
            </p>
          </div>

          {error && (
            <div className="error-box">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label" htmlFor="campus-select">
                Your Campus
              </label>
              
              <div className="select-wrap">
                <select
                  id="campus-select"
                  className="custom-select"
                  value={selectedCampus}
                  onChange={(e) => setSelectedCampus(e.target.value)}
                  disabled={isFetching || isLoading}
                >
                  <option value="" disabled>
                    {isFetching ? "Loading campuses..." : "Select from dropdown"}
                  </option>
                  
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                
                <span className="select-icon">
                  {isFetching ? (
                    <span className="spinner" style={{ borderColor: "rgba(0,0,0,0.1)", borderTopColor: "#1a3a2a" }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  )}
                </span>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading || isFetching || !selectedCampus}>
              <span className="btn-inner">
                {isLoading && <span className="spinner" />}
                {isLoading ? "Joining Campus..." : "Continue to Dashboard"}
              </span>
            </button>
          </form>

          <div className="notice-text">
            Note: Standard accounts allow you to browse and buy. 
            <br />
            <span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Verified college emails are required to sell.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}