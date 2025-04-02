import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDigimonStore } from "../store/petStore";
import DigimonSelection from "../components/DigimonSelection";

const CreatePet = () => {
  const { createUserDigimon, error, fetchUserDigimon, userDigimon } = useDigimonStore();
  const [creationError, setCreationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Check if user already has a Digimon
  useEffect(() => {
    const checkExistingDigimon = async () => {
      setLoading(true);
      await fetchUserDigimon();
      setLoading(false);
    };
    
    checkExistingDigimon();
  }, [fetchUserDigimon]);
  
  // If user already has a Digimon, redirect to dashboard
  useEffect(() => {
    if (userDigimon) {
      navigate("/");
    }
  }, [userDigimon, navigate]);
  
  const handleSelectDigimon = async (digimonId: number, name: string) => {
    try {
      setCreationError(null);
      setLoading(true);
      console.log("Creating Digimon with ID:", digimonId, "and name:", name);
      await createUserDigimon(name, digimonId);
      setLoading(false);
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
        
        <DigimonSelection onSelect={handleSelectDigimon} />
      </div>
    </div>
  );
};

export default CreatePet; 