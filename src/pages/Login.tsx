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
      navigate('/dashboard');
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
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center">
            <img 
              src="/assets/digimon/dot050.png" 
              alt="Digitask Logo" 
              className="h-12 w-12 mr-2"
              style={{ imageRendering: "pixelated" }}
            />
            <h1 className="text-3xl font-extrabold text-primary-600">Digitask</h1>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">Sign in to your account</h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {/* <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div> */}
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          
          <div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Try Demo Account
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 