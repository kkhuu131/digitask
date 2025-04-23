import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDigimonStore } from "../store/petStore";
import DigimonSelection from "../components/DigimonSelection";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../lib/supabase";

const CreatePet = () => {
  const { createUserDigimon, error, fetchUserDigimon, userDigimon } = useDigimonStore();
  const [creationError, setCreationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  
  // Check if user already has a Digimon
  useEffect(() => {
    const checkExistingDigimon = async () => {
      try {
        setLoading(true);
        
        // Get current user ID
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        
        if (!userId) {
          setLoading(false);
          return;
        }
        
        // Check directly from the database
        const { data: digimonData, error } = await supabase
          .from('user_digimon')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
          
        if (error) {
          console.error("Error checking for Digimon:", error);
        } else if (digimonData && digimonData.length > 0) {
          // If we found a Digimon in the database, redirect to dashboard
          navigate("/", { replace: true });
          return;
        }
        
        // Only fetch from store if we didn't redirect
        await fetchUserDigimon();
        setLoading(false);
      } catch (error) {
        console.error("Exception in checkExistingDigimon:", error);
        setLoading(false);
      }
    };
    
    // Check if we're coming from email confirmation
    const searchParams = new URLSearchParams(window.location.search);
    const fromAuth = searchParams.get('from') === 'auth';
    
    // If we're coming from auth, we've already checked for Digimon
    if (!fromAuth) {
      checkExistingDigimon();
    } else {
      setLoading(false);
    }
  }, [fetchUserDigimon, navigate]);
  
  useEffect(() => {
    const checkEmailConfirmation = () => {
      const { user } = useAuthStore.getState();
      if (user && !user.email_confirmed_at) {
        setNeedsEmailConfirmation(true);
      } else {
        setNeedsEmailConfirmation(false);
      }
    };
    
    checkEmailConfirmation();
  }, []);
  
  const handleSelectDigimon = async (digimonId: number, name: string) => {
    try {
      setCreationError(null);
      setLoading(true);
      console.log("Creating Digimon with ID:", digimonId, "and name:", name);
      await createUserDigimon(name, digimonId);
      
      // Fetch the user profile to update the auth store
      await useAuthStore.getState().fetchUserProfile();
      
      setLoading(false);
      
      // Manually navigate after successful creation
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Error in handleSelectDigimon:", err);
      setCreationError((err as Error).message);
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (needsEmailConfirmation) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Email Confirmation Required</h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Please check your email and click the confirmation link to activate your account.
              Once confirmed, you'll be able to create your Digimon and start playing.
            </p>
          </div>
          
          <button
            onClick={() => useAuthStore.getState().signOut()}
            className="btn-secondary"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Digitask!</h1>
        
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Choose your starter Digimon and complete tasks to help it grow and digivolve!
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {creationError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{creationError}</p>
          </div>
        )}
        
        {userDigimon && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-sm text-green-700">
              You already have a Digimon! 
              <button 
                onClick={() => navigate("/", { replace: true })}
                className="ml-2 underline"
              >
                Go to Dashboard
              </button>
            </p>
          </div>
        )}
        
        <DigimonSelection onSelect={handleSelectDigimon} />
      </div>
    </div>
  );
};

export default CreatePet; 