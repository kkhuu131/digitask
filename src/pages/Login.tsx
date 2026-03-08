import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDigimonStore } from "../store/petStore";
import { useTaskStore } from "../store/taskStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);

    // If login was successful, fetch the user's Digimon data
    if (useAuthStore.getState().user) {
      try {
        // Fetch user Digimon data
        await useDigimonStore.getState().fetchUserDigimon();
        // Fetch tasks
        await useTaskStore.getState().fetchTasks();
      } catch (error) {
        console.error("Error fetching user data after login:", error);
      }
    }

    if (useAuthStore.getState().user) {
      navigate("/dashboard");
    }
  };

  const handleDemoLogin = async () => {
    // Use a dedicated demo account
    const demoEmail = "digitaskdemo@gmail.com";
    const demoPassword = "Th!$I5@P4ssw0rD4D3mO";

    await signIn(demoEmail, demoPassword);

    // If login was successful, fetch the user's Digimon data
    if (useAuthStore.getState().user) {
      try {
        await useDigimonStore.getState().fetchUserDigimon();
        await useTaskStore.getState().fetchTasks();
      } catch (error) {
        console.error("Error fetching user data after demo login:", error);
      }
    }

    if (useAuthStore.getState().user) {
      navigate("/dashboard");
    }
  };

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
              style={{
                textShadow:
                  "0 0 12px rgba(168, 85, 247, 0.8), 0 0 24px rgba(168, 85, 247, 0.4)",
              }}
            >
              DIGITASK
            </span>
          </Link>
          <p className="text-gray-500 text-sm tracking-widest uppercase mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13131A] border border-[#2A2A38] rounded-2xl p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-950/60 border border-red-700 rounded-xl px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A38] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-150"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A38] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-150"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-heading text-lg font-semibold hover:from-purple-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Demo Account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-[#2A2A38] text-gray-400 hover:text-white hover:border-purple-500 transition-all duration-200 font-body disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Demo Account
            </button>

            {/* Register link */}
            <div className="text-center pt-1">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors duration-150"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Feedback */}
          <div className="bg-[#1C1C26] border border-[#2A2A38] rounded-xl p-4 text-center">
            <h3 className="text-sm font-semibold text-gray-300 mb-1">
              Something not working?
            </h3>
            <p className="text-gray-500 text-xs mb-3">
              If you&apos;re having any problems, let us know!
            </p>
            <a
              href="https://forms.gle/HrgybGG7BL1xj5wg6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs border border-[#2A2A38] text-gray-400 hover:text-white hover:border-purple-500 px-4 py-1.5 rounded-full transition-all duration-150"
            >
              Submit Feedback
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
