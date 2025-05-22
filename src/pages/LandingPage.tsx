import React from 'react';
import { Link } from 'react-router-dom';
import DigimonShowcase from '../components/DigimonShowcase';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <header className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src="/assets/digimon/agumon_professor.png" alt="Digitask Logo" className="h-10 w-10 mr-2" style={{ imageRendering: "pixelated" }} />
            <h1 className="text-2xl font-bold text-indigo-800">Digitask</h1>
          </div>
          <div>
            <Link to="/login" className="btn-primary mr-2">Login</Link>
            <Link to="/register" className="btn-secondary">Register</Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6">
            Raise Digimon by Completing Your Tasks
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Digitask combines productivity with fun. Complete real-life tasks to raise, evolve, and battle with your Digimon.
          </p>
          <Link to="/register" className="btn-primary text-lg px-8 py-3">
            Start Your Journey
          </Link>
        </section>

        {/* Digimon Showcase */}
        <section className="mb-16">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4 text-center">Collect and Raise Digimon</h3>
          <DigimonShowcase />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">Task Management</h3>
            <p className="text-gray-700">
              Create daily and one-time tasks. Complete them to keep your Digimon happy and healthy.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">Digimon Evolution</h3>
            <p className="text-gray-700">
              Watch your Digimon grow from Baby to Mega as you complete tasks and gain experience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">Battle System</h3>
            <p className="text-gray-700">
              Form teams and battle against other players' Digimon to earn rewards.
            </p>
          </div>
        </section>

        <section className="flex flex-col md:flex-row items-center bg-white p-8 rounded-lg shadow-md mb-16">
          <div className="md:w-1/2 mb-6 md:mb-0 md:pr-8">
            <h3 className="text-2xl font-semibold text-indigo-800 mb-4">How It Works</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Create tasks categorized by different stats (HP, ATK, DEF, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Complete tasks to feed and train your Digimon</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Level up and evolve to more powerful forms</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Collect multiple Digimon and build your team</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Battle against other players' Digimon</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="mb-16 bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-indigo-800 mb-4 text-center">See What Awaits You</h3>
          <div className="max-w-4xl mx-auto overflow-hidden rounded-lg border border-gray-200 shadow-md">
            <img 
              src="/assets/dashboard.png" 
              alt="Digitask Dashboard Preview" 
              className="w-full h-auto"
            />
          </div>
          <p className="text-center text-gray-600 mt-4">
            Manage your tasks and watch your Digimon grow as you complete them
          </p>
        </section>
        {/* Feedback Section */}
        <section className="mb-16 text-center">
          <div className="bg-indigo-50 rounded-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">Help Improve Digitask</h3>
            <p className="text-gray-700 mb-4">
              Found any bugs or have any suggestions? Share your thoughts and suggestions in the form below.
            </p>
            <a 
              href="https://forms.gle/4geGdXkywwAQcZDt6" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-full transition-colors"
            >
              Share Feedback
            </a>
          </div>
        </section>
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

export default LandingPage; 