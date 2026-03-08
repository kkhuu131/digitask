import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { signUp, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateUsername = (username: string) => {
    if (username.length < 3) return "Username must be at least 3 characters";
    if (username.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
    return null;
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username);
      if (error) return true;
      return !data || data.length === 0;
    } catch {
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setUsernameError(null);

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      setUsernameError("Username is already taken");
      return;
    }
    await signUp(email, password, username);
  };

  const inputClass =
    "block w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A38] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-150";

  const anyError = error || usernameError || passwordError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask Logo"
              className="h-16 w-16"
              style={{ imageRendering: "pixelated" }}
            />
            <span
              className="font-heading text-4xl font-bold text-white"
              style={{ textShadow: "0 0 12px rgba(168, 85, 247, 0.8), 0 0 24px rgba(168, 85, 247, 0.4)" }}
            >
              DIGITASK
            </span>
          </Link>
          <p className="text-gray-500 text-sm tracking-widest uppercase mt-1">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13131A] border border-[#2A2A38] rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Errors */}
            {anyError && (
              <div className="bg-red-950/60 border border-red-700 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{anyError}</p>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                placeholder="your_username"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-heading text-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            {/* Login link */}
            <div className="text-center pt-1">
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-150"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
