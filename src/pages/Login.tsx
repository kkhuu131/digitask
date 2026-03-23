import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDigimonStore } from '../store/petStore';
import { useTaskStore } from '../store/taskStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
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
        console.error('Error fetching user data after login:', error);
      }
    }

    if (useAuthStore.getState().user) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async () => {
    // Use a dedicated demo account
    const demoEmail = 'digitaskdemo@gmail.com';
    const demoPassword = 'Th!$I5@P4ssw0rD4D3mO';

    await signIn(demoEmail, demoPassword);

    // If login was successful, fetch the user's Digimon data
    if (useAuthStore.getState().user) {
      try {
        await useDigimonStore.getState().fetchUserDigimon();
        await useTaskStore.getState().fetchTasks();
      } catch (error) {
        console.error('Error fetching user data after demo login:', error);
      }
    }

    if (useAuthStore.getState().user) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0A0A0F] py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-3 mb-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask Logo"
              className="h-16 w-16"
              style={{ imageRendering: 'pixelated' }}
            />
            <span
              className="font-heading text-4xl font-bold text-gray-900 dark:text-white"
              style={{
                textShadow: '0 0 12px rgba(245, 158, 11, 0.5), 0 0 24px rgba(245, 158, 11, 0.2)',
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
        <div className="bg-white dark:bg-[#13131A] border border-gray-200 dark:border-[#2A2A38] rounded-2xl p-8 space-y-6 shadow-md dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1C1C26] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-150"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#1C1C26] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-150"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Sign In */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-heading text-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* Demo Account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-[#2A2A38] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-amber-500 dark:hover:border-amber-500 transition-all duration-200 font-body disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Try Demo Account
            </button>

            {/* Register link */}
            <div className="text-center pt-1">
              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-medium transition-colors duration-150"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Feedback */}
          <div className="bg-gray-50 dark:bg-[#1C1C26] border border-gray-200 dark:border-[#2A2A38] rounded-xl p-4 text-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Something not working?
            </h3>
            <p className="text-gray-500 text-xs mb-3">
              If you&apos;re having any problems, let us know!
            </p>
            <a
              href="https://forms.gle/HrgybGG7BL1xj5wg6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs border border-gray-200 dark:border-[#2A2A38] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-amber-500 dark:hover:border-amber-500 px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer"
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
