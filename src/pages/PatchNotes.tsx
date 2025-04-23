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
              <h3 className="text-lg font-medium ml-2">De-digivolution, EXP Rework, UI Updates</h3>
              <span className="text-sm text-gray-500 ml-auto">April 22, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added icons for Digimon Types and Attributes (credit to <a href="https://www.deviantart.com/sergiogransol/art/Digimon-Icons-Official-and-Fanmade-947832465" target="_blank" rel="noopener noreferrer">SergioGranSol</a>)</li>
              <li>De-digivolution is now possible, allowing Digimon to revert to a previously discovered Digimon, for now it will come at now costs. Future updates to this system will happen soon!</li>
              <li>Future changes: Reworked EXP system</li>
              <li>Fixed a bug where user's couldn't login after signing up (sorry about that!)</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Task Updates</h3>
              <span className="text-sm text-gray-500 ml-auto">April 21, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Tasks can now have notes, to add additional details</li>
              <li>Tasks can now be edited after creation</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Reworks</h3>
              <span className="text-sm text-gray-500 ml-auto">April 20, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Removed health from Digimon; felt that it was too punishing when there's already incentive to do tasks</li>
              <li>Milestone rewards now give a selectable starter Digimon, rather than random</li>
              <li>Added report feature for inappropriate content</li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Profiles and Leaderboards</h3>
              <span className="text-sm text-gray-500 ml-auto">April 19, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added a profile page for each user, showing their Digimon and player stats</li>
              <li>Leaderboard page showing the top players based on battles and streaks</li>
              <li>A page to search and view other user profiles</li>
              <li>Avatar pictures, which can be set in the profile page and only for discovered Digimon</li>
              <li>Friends soon?</li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Reworked Stat Cap System</h3>
              <span className="text-sm text-gray-500 ml-auto">April 18, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Based on suggestion, the stats gained from tasks can now be automatically applied to active Digimon or saved for later use</li>
              <li>Stat cap isn't on a Digimon-by-Digimon basis anymore, but cumulative</li>
              <li>The stat cap is now 2 + 2 per Digimon you own</li>
              <li>Digivolution now requires a level check and stat check</li>
              <li>Not heavily tested, so expect some bugs</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
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
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Possible?</span>
              <h3 className="text-lg font-medium ml-2">More Activities?</h3>
            </div>
            <p className="text-gray-600 mb-2">
              More ways to interact with Digimon:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Co-op battles?</li>
              <li>Bosses?</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Possible?</span>
              <h3 className="text-lg font-medium ml-2">More Digimon Mechanics</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Hoping to introduce more mechanics from Cyber Sleuth games:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Abilities?</li>
              <li>Battle movesets?</li>
            </ul>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Possible?</span>
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