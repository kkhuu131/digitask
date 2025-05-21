import { useState } from "react";
import DigimonDex from "../components/DigimonDex";
import DigimonEvolutionGraph from "../components/DigimonEvolutionGraph";
import PageTutorial from "../components/PageTutorial";
import { DialogueStep } from "../components/DigimonDialogue";

const DigimonDexPage = () => {
  const [showEvolutionGraph, setShowEvolutionGraph] = useState(false);

  const digimonPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: "Welcome to the Digidex! Here you can see all the Digimon partners you've acquired on your journey."
    },
    {
      speaker: 'bokomon',
      text: "You can click on any Digimon card to see more details about them, including their stats, level, and evolution options."
    },
    {
      speaker: 'bokomon',
      text: "Evolve and devolve your Digimon to both increase their ABI and explore new evolution paths!"
    }
  ];

  return (
    <>
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Digidex</h1>
        
        <button 
          onClick={() => setShowEvolutionGraph(!showEvolutionGraph)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center hidden md:block"
        >
          {showEvolutionGraph ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" />
              </svg>
              Back to List View
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              View Evolution Graph
            </>
          )}
        </button>
      </div>
      
      {showEvolutionGraph ? (
        <div className="h-[calc(100vh-200px)]">
          <DigimonEvolutionGraph />
        </div>
      ) : (
        <DigimonDex />
      )}
    </div>
    <PageTutorial tutorialId="digidex_intro" steps={digimonPageTutorialSteps} />
    </>
  );
};

export default DigimonDexPage; 