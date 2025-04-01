import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the auth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
        return;
      }
      
      // Check if this is a password recovery
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      
      if (type === "recovery") {
        // Redirect to the reset password page
        navigate("/reset-password" + window.location.hash);
      } else {
        // Regular sign-in, redirect to home
        navigate("/");
      }
    };
    
    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback; 