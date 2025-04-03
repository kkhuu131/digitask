import { useState, useEffect } from "react";
import { useDigimonStore, Digimon } from "../store/petStore";

interface DigimonSelectionProps {
  onSelect: (digimonId: number, name: string) => void;
}

const DigimonSelection = ({ onSelect }: DigimonSelectionProps) => {
  const [selectedDigimon, setSelectedDigimon] = useState<number | null>(null);
  const [digimonName, setDigimonName] = useState("");
  const [starterDigimon, setStarterDigimon] = useState<Digimon[]>([]);
  const { getStarterDigimon, loading, error } = useDigimonStore();

  useEffect(() => {
    const loadStarterDigimon = async () => {
      try {
        console.log("Loading starter Digimon...");
        const starters = await getStarterDigimon();
        console.log("Starter Digimon loaded:", starters);
        
        setStarterDigimon(starters);
        
        // Auto-select the first one
        if (starters.length > 0) {
          setSelectedDigimon(starters[0].id);
        }
      } catch (err) {
        console.error("Error loading starter Digimon:", err);
      }
    };
    
    loadStarterDigimon();
  }, [getStarterDigimon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDigimon) {
      const name = digimonName.trim() || "";
      console.log("Creating Digimon:", { id: selectedDigimon, name });
      onSelect(selectedDigimon, name);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading starter Digimon...</div>;
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Choose Your Starter Digimon</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {starterDigimon.length === 0 && !loading && !error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
          <p className="text-sm text-yellow-700">No starter Digimon found. Please check your database.</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {starterDigimon.map((digimon) => (
            <div
              key={digimon.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all ${
                selectedDigimon === digimon.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
              onClick={() => setSelectedDigimon(digimon.id)}
            >
              <div className="flex flex-col items-center">
                <img
                  src={digimon.sprite_url}
                  alt={digimon.name}
                  style={{ imageRendering: "pixelated" }} 
                  className="w-24 h-24 object-contain mb-2"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    (e.target as HTMLImageElement).src = "/assets/pet/egg.svg";
                  }}
                />
                <span className="font-medium text-center">{digimon.name}</span>
                <span className="text-xs text-gray-500">{digimon.stage}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <label htmlFor="digimon-name" className="block text-sm font-medium text-gray-700 mb-1">
            Give your Digimon a nickname (optional)
          </label>
          <input
            type="text"
            id="digimon-name"
            className="input"
            value={digimonName}
            onChange={(e) => setDigimonName(e.target.value)}
            placeholder={selectedDigimon ? starterDigimon.find(d => d.id === selectedDigimon)?.name || "" : ""}
          />
        </div>
        
        <button
          type="submit"
          className="btn-primary w-full"
          disabled={!selectedDigimon}
        >
          Start Your Journey
        </button>
      </form>
    </div>
  );
};

export default DigimonSelection; 