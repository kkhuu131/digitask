import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import DigimonSprite from '../components/DigimonSprite';
import ThemeToggle from '../components/ThemeToggle';

const RosterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const allDigimonIds = Object.keys(DIGIMON_LOOKUP_TABLE).map((id) => parseInt(id));

  const filteredDigimon = searchTerm
    ? allDigimonIds.filter((id) =>
        DIGIMON_LOOKUP_TABLE[id].name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allDigimonIds;

  const totalPages = Math.ceil(filteredDigimon.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDigimon = filteredDigimon.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#0A0A0F] dark:text-white transition-colors duration-200">
      {/* Nav */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 dark:border-[#2A2A38] dark:bg-[#0A0A0F]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask Logo"
              className="h-8 w-8"
              style={{ imageRendering: 'pixelated' }}
            />
            <Link
              to="/"
              className="font-heading text-xl font-bold text-gray-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors duration-150"
            >
              Digitask
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-amber-500 dark:border-[#2A2A38] dark:text-gray-400 dark:hover:text-white dark:hover:border-amber-500 text-sm font-body transition-all duration-150 cursor-pointer"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-white text-sm font-body font-semibold transition-all duration-150 cursor-pointer"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <section className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Digimon Roster
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-body text-lg max-w-2xl mx-auto mb-2">
            Browse all {allDigimonIds.length} Digimon available
          </p>
          <p className="text-gray-500 font-body">
            Have a request?{' '}
            <Link
              to="https://docs.google.com/forms/d/e/1FAIpQLSfDVtTfT16n3UGSpCua4zI3QA_iQowreZtaYXijZLTUyDFLgQ/viewform?usp=header"
              className="text-amber-600 dark:text-amber-400 hover:text-amber-500 dark:hover:text-amber-300 transition-colors duration-150"
              target="_blank"
              rel="noopener noreferrer"
            >
              Send requests in the form!
            </Link>
          </p>
        </section>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Digimon by name..."
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#13131A] border border-gray-200 dark:border-[#2A2A38] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-150"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150 cursor-pointer"
                onClick={() => setSearchTerm('')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Digimon grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-8">
          {paginatedDigimon.map((id) => {
            const digimon = DIGIMON_LOOKUP_TABLE[id];
            return (
              <div
                key={id}
                className="bg-white dark:bg-[#13131A] border border-gray-200 dark:border-[#2A2A38] p-3 rounded-xl flex flex-col items-center hover:border-amber-400 dark:hover:border-amber-500/50 hover:bg-gray-50 dark:hover:bg-[#1C1C26] transition-all duration-150 cursor-default shadow-sm dark:shadow-none"
              >
                <div className="w-24 h-24 flex items-center justify-center">
                  <DigimonSprite
                    digimonName={digimon.name}
                    size="sm"
                    fallbackSpriteUrl={digimon.sprite_url}
                  />
                </div>
                <p className="mt-2 text-center font-body font-medium text-gray-800 dark:text-gray-200 truncate w-full text-sm">
                  {digimon.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-600">#{id}</p>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mb-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#13131A] border border-gray-200 dark:border-[#2A2A38] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-body text-sm cursor-pointer shadow-sm dark:shadow-none"
            >
              Previous
            </button>
            <span className="text-gray-500 dark:text-gray-400 font-body text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white dark:bg-[#13131A] border border-gray-200 dark:border-[#2A2A38] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-body text-sm cursor-pointer shadow-sm dark:shadow-none"
            >
              Next
            </button>
          </div>
        )}

        {/* No results */}
        {filteredDigimon.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 font-body">
              No Digimon found matching &quot;{searchTerm}&quot;
            </p>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-[#2A2A38] py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/digimon/agumon_professor.png"
              alt="Digitask"
              className="h-6 w-6 opacity-60"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="font-heading text-gray-400 dark:text-gray-500">Digitask</span>
          </div>
          <p className="text-gray-400 dark:text-gray-600 font-body text-sm">
            Fan project — Digimon™ is owned by Bandai/Toei Animation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RosterPage;
