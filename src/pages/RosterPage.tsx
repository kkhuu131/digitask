import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from '../components/DigimonSprite';

const RosterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Get all digimon IDs from the lookup table
  const allDigimonIds = Object.keys(DIGIMON_LOOKUP_TABLE).map(id => parseInt(id));
  
  // Filter digimon based on search term
  const filteredDigimon = searchTerm 
    ? allDigimonIds.filter(id => 
        DIGIMON_LOOKUP_TABLE[id].name.toLowerCase().includes(searchTerm.toLowerCase()))
    : allDigimonIds;
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredDigimon.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDigimon = filteredDigimon.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/assets/digimon/agumon_professor.png" alt="Digitask Logo" className="h-8 w-8 mr-2" style={{ imageRendering: "pixelated" }} />
            <Link to="/" className="text-2xl font-bold text-indigo-800 hidden sm:block">Digitask</Link>
          </div>
          <div>
            <Link to="/login" className="btn-primary mr-2">Login</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-8">
          <h2 className="text-4xl font-bold text-indigo-900 mb-4">
            Digimon Roster
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Browse all {allDigimonIds.length} Digimon available
          </p>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Have a request? <Link to="https://docs.google.com/forms/d/e/1FAIpQLSfDVtTfT16n3UGSpCua4zI3QA_iQowreZtaYXijZLTUyDFLgQ/viewform?usp=header" className="text-indigo-600 hover:text-indigo-800" target="_blank" rel="noopener noreferrer">Send requests in the form!</Link>
          </p>
        </section>
        
        {/* Search bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Digimon by name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setSearchTerm('')}
            >
              {searchTerm && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Digimon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
          {paginatedDigimon.map(id => {
            const digimon = DIGIMON_LOOKUP_TABLE[id];
            return (
              <div key={id} className="bg-white p-3 rounded-lg shadow-md flex flex-col items-center hover:shadow-lg transition-shadow">
                <div className="w-24 h-24 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={digimon.name}
                    size="sm"
                    showHappinessAnimations={false}
                    fallbackSpriteUrl={digimon.sprite_url}
                  />
                </div>
                <p className="mt-2 text-center font-medium text-gray-800 truncate w-full">
                  {digimon.name}
                </p>
                <p className="text-xs text-gray-500">#{id}</p>
              </div>
            );
          })}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mb-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              &lt;
            </button>
            
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
        
        {/* No results message */}
        {filteredDigimon.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-700">No Digimon found matching "{searchTerm}"</p>
          </div>
        )}
      </main>

      <footer className="bg-indigo-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Digitask</h2>
              <p className="text-indigo-200">The Digimon Productivity App</p>
            </div>
            <div>
              <p className="text-indigo-200">
                Fan project. Digimon™ is owned by Bandai/Toei Animation.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RosterPage; 