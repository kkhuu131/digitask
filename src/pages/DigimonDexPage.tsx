import { useState } from 'react';
import DigimonDex from '../components/DigimonDex';
import DigimonEvolutionGraph from '../components/DigimonEvolutionGraph';
import PageTutorial from '../components/PageTutorial';
import { DialogueStep } from '../components/DigimonDialogue';

const DigimonDexPage = () => {
  const [showEvolutionGraph, setShowEvolutionGraph] = useState(false);

  const digimonPageTutorialSteps: DialogueStep[] = [
    {
      speaker: 'bokomon',
      text: 'The Digidex records species you have discovered. Select a discovered Digimon to see its stats and evolution paths.',
    },
    {
      speaker: 'bokomon',
      text: 'Evolves To shows the level, stats and items needed for each path. Unknown species stay silhouetted until you discover them.',
    },
    {
      speaker: 'neemon',
      text: 'Use View Evolution Graph on larger screens to explore connections. Selecting a node opens the same detail drawer as the list.',
    },
  ];

  return (
    <>
      <div className="ui-page">
        <div className="ui-page-header">
          <h1 className="ui-page-title">DigiDex</h1>

          <button
            onClick={() => setShowEvolutionGraph(!showEvolutionGraph)}
            className={`btn-outline ${showEvolutionGraph ? 'inline-flex' : 'hidden md:inline-flex'}`}
          >
            {showEvolutionGraph ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Back to List View
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                </svg>
                View Evolution Graph
              </>
            )}
          </button>
        </div>

        <PageTutorial tutorialId="digidex_intro" steps={digimonPageTutorialSteps} />
        {showEvolutionGraph ? (
          <div className="h-[calc(100vh-200px)]">
            <DigimonEvolutionGraph />
          </div>
        ) : (
          <DigimonDex />
        )}
      </div>
    </>
  );
};

export default DigimonDexPage;
