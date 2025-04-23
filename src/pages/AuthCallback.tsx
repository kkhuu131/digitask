import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Add this function to ensure a profile exists
    const ensureProfileExists = async (userId: string) => {
      try {
        // First check if profile exists
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (error || !data) {
          // Profile doesn't exist, get user data
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return false;
          
          const username = userData.user.user_metadata?.username || 
                          userData.user.email?.split('@')[0] || 
                          `user_${Date.now()}`;
                          
          // Create profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              { 
                id: userId,
                username,
                display_name: username,
                saved_stats: { HP: 0, SP: 0, ATK: 0, DEF: 0, INT: 0, SPD: 0 },
                daily_stat_gains: 0,
                last_stat_reset: new Date().toISOString(),
                battles_won: 0,
                battles_completed: 0
              }
            ]);
            
            if (insertError) {
              console.error('Error creating profile:', insertError);
              return false;
            }
        }
        
        return true;
      } catch (error) {
        console.error('Error ensuring profile exists:', error);
        return false;
      }
    };

    // Handle the auth callback
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth callback error:", error);
        navigate("/login");
        return;
      }
      
      // Ensure profile exists if we have a user
      if (data.session?.user) {
        await ensureProfileExists(data.session.user.id);
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