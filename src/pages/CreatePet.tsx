import { useState } from "react";
import { useDigimonStore } from "../store/petStore";
import DigimonSelection from "../components/DigimonSelection";

const CreatePet = () => {
  const { createUserDigimon, loading, error } = useDigimonStore();
  const [creationError, setCreationError] = useState<string | null>(null);
  
  const handleSelectDigimon = async (digimonId: number, name: string) => {
    try {
      setCreationError(null);
      console.log("Creating Digimon with ID:", digimonId, "and name:", name);
      await createUserDigimon(name, digimonId);
    } catch (err) {
      console.error("Error in handleSelectDigimon:", err);
      setCreationError((err as Error).message);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Produc-Ti-Pet!</h1>
        
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