import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const { signUp, error, loading, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const validateUsername = (username: string) => {
    if (username.length < 3) return 'Username must be at least 3 characters';
    if (username.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return 'Username can only contain letters, numbers, and underscores';
    return null;
  };

  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);
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
      setPasswordError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    const usernameValidationError = validateUsername(username);
    if (usernameValidationError) {
      setUsernameError(usernameValidationError);
      return;
    }
    const isUsernameAvailable = await checkUsernameAvailability(username);
    if (!isUsernameAvailable) {
      setUsernameError('Username is already taken');
      return;
    }
    await signUp(email, password, username);
  };

  const inputClass = 'input';

  const anyError = error || usernameError || passwordError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-400 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
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
            <span className="font-heading text-4xl font-bold text-gray-900 dark:text-white">
              DIGITASK
            </span>
          </Link>
          <p className="text-gray-500 text-sm tracking-widest uppercase mt-1">
            Create your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-dark-300 border border-gray-200 dark:border-dark-100 rounded-xl p-4 sm:p-6 space-y-6 shadow-md dark:shadow-none">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Errors */}
            {anyError && (
              <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600 dark:text-red-400">{anyError}</p>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@example.com"
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
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
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
            <button type="submit" disabled={loading} className="w-full btn-primary">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            {/* Login link */}
            <div className="text-center pt-1">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 font-medium transition-colors duration-150"
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
