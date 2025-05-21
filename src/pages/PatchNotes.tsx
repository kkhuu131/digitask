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
              <h3 className="text-lg font-medium ml-2">X-Antibody, Bokomon and Neemon!</h3>
              <span className="text-sm text-gray-500 ml-auto">May 20, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Introducing <b>X-Antibody Digimon</b>! These are mutated variants of the original Digimon, providing a 10% boost to all stats.</li>
            <li>Unlike digivolution, you can transform back and forth between the original and X-Antibody forms without losing levels.</li>
            <li>For now, you will be free to transform as much as you want, but expect there to be some requirement in the future.</li>
            <li>The X-Antibody Digimon added in this update are:</li>
            <ul>
              <li>Agumon X, Greymon X, MetalGreymon X, WarGreymon X</li>
              <li>Gabumon X, WereGarurumon X, MetalGarurumon X</li>
              <li>Omnimon X</li>
              <li>Guilmon X, Growlmon X, WarGrowlmon X, Megidramon X, Gallantmon X</li>
              <li>Dracomon X</li>
              <li>LadyDevimon X, BeelStarmon X</li>
              <li>Beelzemon X</li>
            </ul>
            <li>All X-Antibody Digimon can be achieved through their normal Digimon counterpart, or evolving an X-Antibody Digimon that usually evolves into the Digimon.</li>
            <li>BeelStarmon, a female counterpart to Beelzemon, has also been added.</li>
            <li>Added <b>Bokomon and Neemon</b> (from Digimon Frontier) as guides to the game! Sprites are from @otro_jorch on twitter</li>
            <li>Added an onboarding flow to the game to help new users get started!</li>
            <li>Removed Playground mode, until I can find a way for it to be more useful.</li>
            </ul>
        </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Animation Update</h3>
              <span className="text-sm text-gray-500 ml-auto">May 19, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Several Digimon sprites have gotten animations/new sprites (ex. idle animation, happy, sad, sleeping)</li>
            <li>Source: <a href="https://drive.google.com/drive/folders/1EgoXHwlXNiurD4X_9WEgoyzm9OuWf_tf" target="_blank" rel="noopener noreferrer">https://drive.google.com/drive/folders/1EgoXHwlXNiurD4X_9WEgoyzm9OuWf_tf</a></li>
            <li>Unfortunately, I couldn't find sprites for all Digimon, so many Digimon are still static.</li>
            <li>Due to influx of all these new sprites, I'll be able to add more Digimon to the game! Notably a lot of the X-Antibody Digimon!</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">UI Changes, 3 New Digimon</h3>
              <span className="text-sm text-gray-500 ml-auto">May 17, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Completed tasks that are recurring or daily can now still be edited.</li>
            <li>Improved Digimon team card UI.</li>
            <li>Added 3 new Digimon: BlitzGreymon, CresGarurumon, and Omnimon Alter-S</li>
            <li>BlitzGreymon are evolved through MetalGreymon (Blue), CresGarurumon from WereGarurumon, and Omnimon Alter-S from the fusion of the two.</li>
            <li>Made ABI Milestones easier to reach, especially earlier ones.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Big Update: Campaign Mode, Titles, and more</h3>
              <span className="text-sm text-gray-500 ml-auto">May 15, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li><b>Campaign mode is now available!</b> The first 60 stages are made and follows a similar journey to Digimon Adventure.</li>
            <li>This mode is just meant to be something you slowly do over time, or have something to work towards with the strength of your Digimon. Progress the stages at your own pace, and expect to be added in the future. </li>
            <li>Some stages offer multiple options (A, B, C, for example), and only clearing one is required to progress.</li>
            <li>⚠️NOTE: Any feedback on the difficulty of the campaign is welcome, please send it through the feedback form.</li>
            <li>You can now set the Battle Speed for turn animations (1x-4x)</li>
            <li><b>Titles are now available!</b> You can now earn titles by completing certain achievements such as campaign progression, discovering and evolving Digimon, and doing team battles.</li>
            <li>These titles can be displayed on your profile page for others to see (up to 3).</li>
            <li><b>Fusion (aka DNA Digivolution) is now possible!</b> This mechanic is used to evolve into certain Digimon such as Omnimon. These evolutions require another Digimon to fuse with and the process consumes them.</li>
            <li>⚠️NOTE: Fusion consumes the Digimon listed as the requirement, and not the current one. No, the bonus stats or ABI are not combined.</li>
            <li>HP Bonus is now effectively 10x what it was previously, so expect a lot more HP for your Digimon. The (+Number) displayed is just number of stat points into HP, but the effective increase is 10x that.</li>
            <li>In the future, some higher stage evolutions may also be locked behind a Campaign stage clear such as some of the Royal Knights or Ultra Digimon.</li>
            <li>Expect potential bugs and issues with these new features, please report any issues to the feedback form!</li>
            <li>Thank you to everyone who has been using the site and providing feedback, I appreciate it!</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Latest</span>
              <h3 className="text-lg font-medium ml-2">Minor Changes</h3>
              <span className="text-sm text-gray-500 ml-auto">May 9, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
            <li>Updated task list UI to be more compact on mobile.</li>
            <li>Final stat calculations fixed, bonus stats were being applied multiplicatively instead of additively.</li>
            <li>Users are now suggested a category in task creation, but can change it freely during creation.</li>
            <li>Campaign mode is in development, please send any suggestions for enemy teams or rewards through the feedback form!</li>
            <li>A preview of the new campaign mode is available if you go to <a className="text-blue-500" href="https://digitask-pi.vercel.app/campaign" rel="noopener noreferrer">https://digitask-pi.vercel.app/campaign</a>.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Minor Changes</h3>
              <span className="text-sm text-gray-500 ml-auto">May 7, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Digimon species data and evolution paths are saved locally, so should reduce the load on the server.</li>
              <li>Fixed rare battle bug where turn animations would get out of sync.</li>
              <li><b>Campaign mode is coming soon</b>, where you fight a series of progressively harder pre-made battles.</li>
              <li>Rewards will probably(?) just be titles or achievements, so it won't be required to complete the campaign.</li>
              <li>Let us know what you want to see in campaign mode in the feedback form!</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">ABI Rewards, Bug Fixes</h3>
              <span className="text-sm text-gray-500 ml-auto">May 6, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Digimon created before the update recieved ABI depending on their stage. Rookie: 5, Champion: 8, Ultimate: 15, Mega: 20</li>
              <li>Digimon with bonus stats that exceeded their ABI cap were granted the ABI needed to reach the cap (at most 25 ABI).</li>
              <li>Note: Digimon were not granted both of these ABI rewards, only whichever was higher.</li>
              <li>Fixed bug where Digimon did not recieve happiness from tasks</li>
              <li>Fixed bug where Digimon on Dashboard was not visually updated when task was completed</li>
              <li>Thank you for the suggestions, please continue to send in any feedback!</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">ABI System</h3>
              <span className="text-sm text-gray-500 ml-auto">May 5, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>ABI (or Ability) is now a stat that can be increased by evolving or devolving Digimon.</li>
              <li>ABI is used to calculate the cap of total bonus stats a Digimon can have (50 + ABI/2).</li>
              <li>You will not be able to allocate bonus stats to a Digimon once it has reached or past its cap, auto allocation will instead save the stats.</li>
              <li>Because of this new system, <b>tasks only give 1 bonus stat point</b>.</li>
              <li>Evolving and devolving will now give ABI based on experience instead of bonus stats (flat 1 ABI with an additional ABI / 5 levels for devolution, ABI / 10 levels for evolution).</li>
              <li>Reaching certain ABI thresholds will also give more Digimon, replacing task/daily quota milestones.</li>
              <li>Depending on how many Digimon you have, thresholds to claim the next Digimon will be different.
                <ul>
                  <li>In order: 5, 10, 25, 40, 60, 85, 115, 150, 200, 240, 300</li>
                </ul>
              </li>
              <li>ABI is also used as a stat requirement for some evolutions.</li>
              <li>Tasks now give all reserve Digimon 50% of the experience. (ex. active Digimon gets 100 exp, all reserve Digimon get 50 exp)</li>
              <li>The balancing of this system is still being tested, so expect changes in the future and give feedback if you have any suggestions.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Playground Mode and Personality System</h3>
              <span className="text-sm text-gray-500 ml-auto">April 26, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Playground mode is now available. Allows you to play and interact with all your Digimon.</li>
              <li>Mode is currently just cosmetic, and provides no benefits.</li>
              <li>Digimon are now randomly assigned a personality, each increasing one of their stats by 5% (applied after bonus stats).</li>
              <li>Personality can be Durable (HP), Lively (SP), Fighter (ATK), Defender (DEF), Brainy (INT), or Nimble (SPD).</li>
              <li>Max # of Digimon per user is increased to 12 (from 9).</li>
              <li>Stats displayed in Digimon details are now displayed like so: Total Stat # (+ Bonus Stat #). The total stat # already has the bonus stats and personality applied.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Enhanced Wild Encounter Generation</h3>
              <span className="text-sm text-gray-500 ml-auto">April 26, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Battle options now have a 33% chance to force a wild encounter even if there's a real opponent</li>
              <li>Wild encounters have a chance to all be the same Type, or same Attribute to add some variety.</li>
              <li>Wild encounters have a chance of being an Alpha + Minions, meaning one of the Digimon will be a higher stage and level than the others.</li>
              <li>Wild encounters now choose Digimon with stages that would match the level (ex. not level 5 Mega Digimon, or level 50 Baby Digimon)</li>
              <li>The battle teams of other players, will now be the Digimon on their team, instead of their 3 highest level Digimon.</li>
              <li>Evolving or devolving a Digimon will now play a short animation.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Digidex Graph Display</h3>
              <span className="text-sm text-gray-500 ml-auto">April 25, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added a new way to visualize Digidex data (only on desktop resolutions)</li>
              <li>Completing your daily quota will now reward the whole team with 100 EXP</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Recurring Tasks</h3>
              <span className="text-sm text-gray-500 ml-auto">April 24, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>New Task Type: Recurring. These are different from Daily tasks.</li>
              <li>You can set these to refresh on specific days of the week (every Sunday and Saturday, or every weekday, for example).</li>
              <li>They give the same rewards as Daily tasks, 50 EXP and 2 stat points.</li>
              <li>Made some changes to the Evolution/Devolution UI and Battle page for mobile users.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">Digivolution and De-digivolution Update</h3>
              <span className="text-sm text-gray-500 ml-auto">April 23, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Digivolving and De-digivolution will now reset the Digimon's level back to 1, but convert experience to bonus stats.</li>
              <li>Digivolving will reward +1 points to all stats per 1000 experience points.</li>
              <li>De-digivolution will reward +1 points to all stats per 1500 experince points.</li>
              <li>De-digivolution will only be possible if the Digimon has been discovered.</li>
              <li>These changes are still being experimented with, so any feedback on this system is welcome!</li>
              <li>Future changes: Asa a result of this update, EXP rewards may be increased in the future.</li>
            </ul>
          </div>
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-medium ml-2">De-digivolution, EXP Rework, UI Updates</h3>
              <span className="text-sm text-gray-500 ml-auto">April 22, 2025</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Added icons for Digimon Types and Attributes (credit to <a href="https://www.deviantart.com/sergiogransol/art/Digimon-Icons-Official-and-Fanmade-947832465" target="_blank" rel="noopener noreferrer">SergioGranSol</a>)</li>
              <li>De-digivolution is now possible, allowing Digimon to revert to a previously discovered Digimon, for now it will come at no costs. Future updates to this system will happen soon!</li>
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
              <li>Daily tasks give 2 stats pts, from 1. One-time tasks give 3.</li>
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
        
        {/* <div>
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
        </div> */}
        
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