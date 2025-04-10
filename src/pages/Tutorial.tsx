import { useState } from "react";
import { motion } from "framer-motion";
import { FaTasks, FaHeart, FaFistRaised, FaTrophy, FaQuestion } from "react-icons/fa";
import { GiLevelEndFlag } from "react-icons/gi";

const Tutorial = () => {
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: "Welcome", icon: <FaQuestion /> },
    { id: "tasks", title: "Task System", icon: <FaTasks /> },
    { id: "digimon", title: "Digimon Care", icon: <FaHeart /> },
    { id: "evolution", title: "Evolution", icon: <GiLevelEndFlag /> },
    { id: "battles", title: "Battles", icon: <FaFistRaised /> },
    { id: "milestones", title: "Milestones & Rewards", icon: <FaTrophy /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">How to Play</h1>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              activeSection === section.id
                ? "bg-primary-600 text-white"
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            <span>{section.icon}</span>
            <span className="hidden sm:inline">{section.title}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeSection === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Welcome to Digitask!</h2>
            <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
              <div className="md:w-1/2">
                <p className="mb-4">
                  Digitask combines task management with virtual pet gameplay to make productivity fun!
                </p>
                <p className="mb-4">
                  Complete tasks to care for your Digimon, help them evolve, and battle against other players.
                </p>
                <p>
                  This guide will walk you through all the features and mechanics of Digitask to help you get started.
                </p>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img 
                  src="/assets/digimon/dot050.png" 
                  alt="Digitask Logo" 
                  className="h-48 w-48 object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "tasks" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Task System</h2>
            <p className="mb-4">
              Only your active Digimon will benefit from tasks.
            </p>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Daily Tasks</h3>
                <p className="mb-4">
                  Daily tasks reset each day at {(() => {
                  // Create a date object for 8:00 UTC
                  const resetTime = new Date();
                  resetTime.setUTCHours(8, 0, 0, 0);
                  
                  // Format the time in the user's local timezone
                  return resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                })()} (8:00 UTC) and contribute to your daily quota. Complete your daily quota to:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Keep your Digimon happy and healthy</li>
                  <li>Build a streak for milestone rewards</li>
                  <li>Earn experience points for your Digimon</li>
                </ul>
                <p className="text-yellow-600 font-medium">
                  WARNING: Missing your daily quota will decrease your Digimon's happiness!
                </p>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Regular Tasks</h3>
                <p className="mb-4">
                  Regular tasks have due dates and provide larger rewards when completed:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>More experience points for your Digimon</li>
                  <li>Progress toward task completion milestones</li>
                </ul>
                <p className="text-yellow-600 font-medium">
                  WARNING: Overdue tasks will decrease your Digimon's health!
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Task Management Tips</h3>
              <ul className="list-disc pl-5">
                <li>Set realistic due dates for your tasks</li>
                <li>Stay consistent to complete your daily quota</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeSection === "digimon" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Digimon Care</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Health</h3>
                <p className="mb-4">
                  Your Digimon's health represents their physical condition:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Decreases when tasks become overdue</li>
                  <li>If health reaches zero, your Digimon will die forever</li>
                </ul>
                <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                  <div className="bg-red-500 h-5 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-sm text-gray-600">Example: 75% Health</p>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Happiness</h3>
                <p className="mb-4">
                  Happiness represents your Digimon's emotional state:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Decreases when you miss your daily quota</li>
                  <li>Lower happiness = lower experience gain</li>
                </ul>
                <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                  <div className="bg-yellow-400 h-5 rounded-full" style={{ width: "90%" }}></div>
                </div>
                <p className="text-sm text-gray-600">Example: 90% Happiness</p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Digimon Care Tips</h3>
              <ul className="list-disc pl-5">
                <li>Complete your daily quota to maintain happiness</li>
                <li>Don't let regular tasks become overdue to protect health</li>
                <li>Check your Digimon's status regularly</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeSection === "evolution" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Evolution</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Experience & Levels</h3>
                <p className="mb-4">
                  Your Digimon gains experience points (XP) by:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Completing tasks (daily and regular)</li>
                  <li>Winning battles</li>
                  <li>Meeting milestones</li>
                </ul>
                <p className="mb-4">
                  As your Digimon gains XP, they will level up, becoming stronger and unlocking evolution potential.
                </p>
                <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                  <div className="bg-blue-500 h-5 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <p className="text-sm text-gray-600">Example: Level 5 (60% to Level 6)</p>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Digivolution</h3>
                <p className="mb-4">
                  When your Digimon reaches certain level thresholds, they can evolve to more powerful forms:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Each evolution increases base stats</li>
                  <li>Digimon have multiple branching evolutions. Pick the silhouette that you like the most</li>
                </ul>
                <div className="flex justify-center space-x-4 items-center">
                  <img 
                    src="/assets/digimon/dot322.png" 
                    alt="Rookie Digimon" 
                    className="h-16 w-16"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="text-2xl">→</span>
                  <img 
                    src="/assets/digimon/dot050.png" 
                    alt="Champion Digimon" 
                    className="h-16 w-16"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span className="text-2xl">→</span>
                  <img 
                    src="/assets/digimon/dot326.png" 
                    alt="Ultimate Digimon" 
                    className="h-16 w-16"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Evolution Tips</h3>
              <ul className="list-disc pl-5">
                <li>Complete tasks consistently to gain XP faster</li>
                <li>Battle regularly to accelerate leveling</li>
                <li>Check evolution requirements in your dashboard or Digidex</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeSection === "battles" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Battle System</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Team Battles</h3>
                <p className="mb-4">
                  Team battles pit your Digimon team against other players:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Select up to 3 Digimon for your battle team</li>
                  <li>Battles are turn-based with automatic actions</li>
                  <li>Type advantages and attributes affect damage</li>
                  <li>All your Digimon (including reserves) gain XP from battles</li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Battle Mechanics</h3>
                <p className="mb-4">
                  Understanding battle mechanics can help you build better teams:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li><strong>Types:</strong> Advantages/disadvantages can make an attack double or half damage</li>
                  <ul className="list-disc pl-5 mb-4">
                    <li>Virus &lt; Vaccine &lt; Data &lt; Virus</li>
                    <li>Free has not advantages or disadvantages</li>
                    </ul>
                  <li><strong>Attributes:</strong> Advantages make an attack do 50% more damage</li>
                    <ul className="list-disc pl-5 mb-4">
                    <li>Fire &lt; Water &lt; Plant &lt; Fire</li>
                    <li>Electric &lt; Earth &lt; Wind &lt; Electric</li>
                    <li>Light and Dark are effective against each other</li>
                    <li>Neutral have no advantages or disadvantages</li>
                    </ul>
                </ul>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Battle Tips</h3>
              <ul className="list-disc pl-5">
                <li>Build a balanced team with different types and attributes</li>
                <li>Consider type advantages when selecting opponents</li>
                <li>All Digimon in your collection gain XP from battles, even if they don't participate</li>
                <li>Battle daily to maximize XP gain and progress</li>
              </ul>
            </div>
          </motion.div>
        )}

        {activeSection === "milestones" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Milestones & Rewards</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Daily Quota Streak</h3>
                <p className="mb-4">
                  Building a streak of completed daily quotas:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Complete your daily quota for 3 days to earn a new Digimon</li>
                  <li>Streaks reset when you claim your reward</li>
                </ul>
                <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                  <div className="bg-blue-500 h-5 rounded-full" style={{ width: "66%" }}></div>
                </div>
                <p className="text-sm text-gray-600">Example: Daily Quota Streak 2/3</p>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Task Completion</h3>
                <p className="mb-4">
                  Completing tasks builds toward milestones:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Complete 10 tasks to earn a new Digimon</li>
                  <li>Counter resets when you claim your reward</li>
                  <li>Both daily and regular tasks count toward this milestone</li>
                </ul>
                <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                  <div className="bg-green-500 h-5 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <p className="text-sm text-gray-600">Example: Tasks Completed 4/10</p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Milestone Tips</h3>
              <ul className="list-disc pl-5">
                <li>Claim your reward as soon as you reach a milestone</li>
                <li>Stay consistent on your tasks</li>
                <li>New Digimon have a small chance to be special kind of Digimon</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Tutorial; 