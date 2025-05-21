import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useDigimonStore } from "../store/petStore";

const AuthCallback = () => {
  const navigate = useNavigate();
  // Add a ref to track if we've already processed this callback
  const processedRef = useRef(false);

  useEffect(() => {
    // Skip if we've already processed this callback (prevents double processing during HMR)
    if (processedRef.current) {
      console.log("Auth callback already processed, skipping");
      return;
    }
    
    // Mark as processed
    processedRef.current = true;
    
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
      try {
        // Check if this is a hot module reload
        const isHotReload = import.meta.hot;
        
        // If this is a hot reload in development, skip the navigation
        if (isHotReload) {
          console.log("Hot module reload detected, skipping auth callback");
          return;
        }
        
        // Clear any cached state that might be causing issues
        sessionStorage.clear();
        localStorage.removeItem('userDigimon');
        
        // Reset the Zustand store state to prevent stale data issues
        useDigimonStore.setState({ 
          userDigimon: null, 
          digimonData: null, 
          evolutionOptions: [],
          loading: false,
          error: null
        });
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth callback error:", error);
          navigate("/login");
          return;
        }
        
        if (!data.session) {
          console.log("No session found");
          navigate("/login");
          return;
        }
        
        // Ensure profile exists if we have a user
        if (data.session?.user) {
          await ensureProfileExists(data.session.user.id);
          
          // Also update the auth store with the user profile
          const { useAuthStore } = await import('../store/authStore');
          await useAuthStore.getState().fetchUserProfile();
        }
        
        // Check the hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const type = hashParams.get("type");
        
        if (type === "recovery") {
          // Redirect to the reset password page
          navigate("/reset-password" + window.location.hash, { replace: true });
        } else if (type === "signup" || type === "magiclink") {
          try {
            // Check if user already has a Digimon directly from the database
            const { error: digimonError } = await supabase
              .from('user_digimon')
              .select('id')
              .eq('user_id', data.session?.user?.id)
              .limit(1);
              
            if (digimonError) {
              console.error("Error checking for Digimon:", digimonError);
            }
            
            // Add a check to prevent navigation during development hot reloading
            if (import.meta.hot) {
              console.log("Skipping navigation during hot reload");
              return;
            }
          } catch (error) {
            console.error("Error checking for existing Digimon:", error);
          }
        } else {
          // Regular sign-in, redirect to home
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
        navigate("/login");
      }
    };
    
    handleAuthCallback();
    
    // Cleanup function to reset the processed flag when component unmounts
    return () => {
      processedRef.current = false;
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Processing authentication...</p>
    </div>
  );
};

export default AuthCallback; 