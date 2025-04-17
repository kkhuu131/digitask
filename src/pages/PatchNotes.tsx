const PatchNotes = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card mb-6">
        <h1 className="text-2xl font-bold mb-4">Updates & Roadmap</h1>
        <p className="text-gray-600 mb-6">
          Stay informed about recent changes and upcoming features for Digitask.
        </p>
        
        <div className="border-b pb-2 mb-6">
          <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Latest</span>
              <h3 className="text-lg font-medium ml-2">Battle System Improvements</h3>
              <span className="text-sm text-gray-500 ml-auto">April 16, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added tooltips to show Digimon names, types, and attributes in battle</li>
              <li>Improved battle option generation with better level scaling</li>
              <li>Battle options now persist between page refreshes</li>
              <li>Fixed issues with team selection and battle availability</li>
              <li>Improved the visual layout of battle cards</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium">Team Management</h3>
              <span className="text-sm text-gray-500 ml-auto">April 12, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added drag-and-drop team management</li>
              <li>Improved Digimon card design with more information</li>
              <li>Added experience progress bars</li>
              <li>Now supporting teams of up to 3 Digimon</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium">Initial Beta Release</h3>
              <span className="text-sm text-gray-500 ml-auto">April 8, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Launched Digitask beta with core task management</li>
              <li>Introduced Digimon raising system</li>
              <li>Added basic battle functionality</li>
              <li>Implemented Digimon evolution</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Upcoming Features</h2>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">In Development</span>
              <h3 className="text-lg font-medium ml-2">Enhanced Battle Rewards</h3>
            </div>
            <p className="text-gray-600 mb-2">
              We're working on improving the battle reward system to make battles more meaningful:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Scaled experience rewards based on battle difficulty</li>
              <li>Special item drops from battles</li>
              <li>Battle streak bonuses</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Planned</span>
              <h3 className="text-lg font-medium ml-2">Digimon Training</h3>
            </div>
            <p className="text-gray-600 mb-2">
              A new training system to improve your Digimon's stats:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Specialized training exercises for different stats</li>
              <li>Training mini-games</li>
              <li>Stat-boosting items</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Planned</span>
              <h3 className="text-lg font-medium ml-2">Social Features</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Connect with other Digimon trainers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Friend system</li>
              <li>Direct challenges</li>
              <li>Leaderboards</li>
              <li>Trading system</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-medium text-indigo-800 mb-2">Have a suggestion?</h3>
          <p className="text-indigo-700 text-sm mb-3">
            We're constantly improving Digitask based on user feedback. If you have ideas for new features or improvements, let us know!
          </p>
          <a 
            href="https://forms.gle/HrgybGG7BL1xj5wg6" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full transition-colors"
          >
            Submit Feedback
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatchNotes; 