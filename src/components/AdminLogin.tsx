"use client";

import { useId, useState } from "react";
import { useAuth } from "../lib/authContext";
import "../styles/admin.css";

export default function AdminLogin() {
  const usernameId = useId();
  const passwordId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      if (!result.success) setError(result.message || "Login failed");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="auth-brand__logo" src="/images/logo.png" alt="" />
          <div className="auth-brand__copy">
            <div className="auth-brand__title">Sajha Admin</div>
            <div className="auth-brand__subtitle">Manage posts and advertisements</div>
          </div>
        </div>

        {error ? <div className="error">{error}</div> : null}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor={usernameId} className="auth-label">
              Username
            </label>
            <input
              id={usernameId}
              type="text"
              className="auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="auth-field">
            <label htmlFor={passwordId} className="auth-label">
              Password
            </label>
            <div className="auth-password">
              <input
                id={passwordId}
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input--password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="auth-password__toggle"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
