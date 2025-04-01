import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have a hash fragment in the URL (from the reset link)
  useEffect(() => {
    // Log the URL for debugging
    console.log("Current URL:", window.location.href);
    
    // Check for token in hash or query params
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const queryParams = new URLSearchParams(location.search);
    
    const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
    const type = hashParams.get("type") || queryParams.get("type");
    
    console.log("Token info:", { accessToken: !!accessToken, type });
    
    if (!accessToken) {
      setError("Invalid or expired password reset link. Please request a new one.");
    }
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setSuccess(true);
      
      // Redirect to home after successful password reset
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="card">
        <h1 className="text-2xl font-bold mb-6">Reset Your Password</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700">
              Your password has been successfully reset. You will be redirected to the login page.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full btn-primary"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword; 