import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword, error, loading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);

    if (!useAuthStore.getState().error) {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full card space-y-6">
        <div>
          <h1 className="brand-wordmark text-center text-3xl">Digitask</h1>
          <h2 className="mt-4 text-center ui-page-title">Reset your password</h2>
        </div>

        {isSubmitted ? (
          <div className="bg-green-50 dark:bg-teal-950/30 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-800 dark:text-teal-300">
              If an account exists with that email, we've sent password reset instructions.
            </p>
            <p className="mt-3 text-sm">
              <Link to="/login" className="ui-link">
                Back to login
              </Link>
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            <div>
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
                className="input mt-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button type="submit" disabled={loading} className="w-full btn-primary">
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                <Link to="/login" className="ui-link">
                  Back to login
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
