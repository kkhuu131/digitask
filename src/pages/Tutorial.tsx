import { useState } from "react";
import { motion } from "framer-motion";
import { FaTasks, FaHeart, FaFistRaised, FaTrophy, FaQuestion } from "react-icons/fa";
import { GiLevelEndFlag } from "react-icons/gi";
import TypeAttributeIcon from "../components/TypeAttributeIcon";
import { DigimonType, DigimonAttribute } from "../store/battleStore";

// Define the types and attributes for iteration
const allTypes: DigimonType[] = ['Vaccine', 'Virus', 'Data'];
const allAttributes: DigimonAttribute[] = ['Fire', 'Water', 'Plant', 'Electric', 'Wind', 'Earth', 'Light', 'Dark', 'Neutral'];

const attributeAdvantages: Record<DigimonAttribute, DigimonAttribute | null> = {
  Fire: 'Plant',
  Water: 'Fire',
  Plant: 'Water',
  Electric: 'Wind',
  Wind: 'Earth',
  Earth: 'Electric',
  Light: 'Dark',
  Dark: 'Light',
  Neutral: null,
};

const Tutorial = () => {
  const [activeSection, setActiveSection] = useState("tasks");

  const sections = [
    { id: "intro", title: "Welcome", icon: <FaQuestion /> },
    { id: "tasks", title: "Task System", icon: <FaTasks /> },
    { id: "digimon", title: "Digimon Care", icon: <FaHeart /> },
    { id: "evolution", title: "Evolution", icon: <GiLevelEndFlag /> },
    { id: "battles", title: "Battles", icon: <FaFistRaised /> },
    { id: "milestones", title: "Milestones & Rewards", icon: <FaTrophy /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "intro":
        return (
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
              <div className="md:w-1/2 flex justify-center flex-wrap gap-4">
                {(() => {
                  // Define all available Digimon images
                  const allDigimonImages = [
                    "dot002.png","dot003.png", "dot004.png", "dot005.png", "dot006.png", "dot009.png", "dot010.png", "dot011.png",
                    "dot012.png", "dot013.png", "dot014.png", "dot015.png", "dot016.png", "dot019.png", "dot020.png", "dot021.png",
                    "dot022.png", "dot023.png", "dot024.png", "dot025.png", "dot026.png", "dot027.png", "dot030.png", "dot031.png",
                  ];
                  
                  // Shuffle array and pick 6 random images
                  const shuffled = [...allDigimonImages].sort(() => 0.5 - Math.random());
                  const selectedImages = shuffled.slice(0, 5);
                  
                  // Return the random images
                  return selectedImages.map((image, index) => (
                    <img 
                      key={index}
                      src={`/assets/digimon/${image}`}
                      alt={`Digimon ${index + 1}`} 
                      className="h-20 w-20 object-contain"
                      style={{ imageRendering: "pixelated" }}
                    />
                  ));
                })()}
              </div>
            </div>
          </motion.div>
        );

      case "tasks":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Task System</h2>
            <p className="mb-4">
              You set your own tasks. You can set 1 active Digimon at a time. Only your active Digimon will be affected from tasks.
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>Keep your Digimon happy and healthy</li>
              <li>Earn experience points for your Digimon</li>
              <li>Complete your daily quota of 3 tasks</li>
              <li>Build a streak for increased experience points</li>
            </ul>
            <p className="text-yellow-600 font-medium mb-4">
              WARNING: Missing your daily quota or any task will decrease your Digimon's happiness!
            </p>
            
            {/* Condensed section about task categories and stat bonuses */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Task Categories & Stat Bonuses</h3>
              <p className="mb-3">
                Assign categories to tasks to boost your Digimon's corresponding stats. Each Digimon has a daily stat gain limit based on their evolution stage.
              </p>
              
              {/* Accordion for Categories */}
              <details className="mb-3 bg-white rounded shadow-sm">
                <summary className="p-3 cursor-pointer font-medium hover:bg-gray-50">
                  View Stat Categories
                </summary>
                <div className="p-3 py-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-md">
                    <div><span className="text-red-600 font-medium">HP:</span> Exercise, sleep</div>
                    <div><span className="text-blue-600 font-medium">SP:</span> Meditation, breaks</div>
                    <div><span className="text-orange-600 font-medium">ATK:</span> Work, productivity</div>
                    <div><span className="text-green-600 font-medium">DEF:</span> Self-care</div>
                    <div><span className="text-purple-600 font-medium">INT:</span> Learning, reading</div>
                    <div><span className="text-yellow-600 font-medium">SPD:</span> Errands, chores</div>
                  </div>
                </div>
              </details>
              
              {/* Accordion for Daily Caps */}
              <details className="bg-white rounded shadow-sm">
                <summary className="p-3 cursor-pointer font-medium hover:bg-gray-50">
                  View Daily Stat Caps
                </summary>
                <div className="p-3 py-4 border-t">
                    <div>You start with base 2 and gain an additional 2 per Digimon you own</div>
                </div>
              </details>
            </div>
            
            <p className="mb-4">
              There are 3 types of tasks: daily, recurring, and regular.
            </p>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Daily and Recurring Tasks</h3>
                <p className="mb-4">
                  These tasks reset each day (specific days each week, if recurring) at {(() => {
                  // Create a date object for 8:00 UTC
                  const resetTime = new Date();
                  resetTime.setUTCHours(8, 0, 0, 0);
                  
                  // Format the time in the user's local timezone
                  return resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                })()} (8:00 UTC) and need to be completed before the next day. They give 50 EXP and 2 stat points.
                </p>
              </div>
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Regular Tasks</h3>
                <p className="mb-4">
                  Regular tasks have due dates and provide larger rewards when completed. They give 75 EXP and 3 stat points.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Task Management Tips</h3>
              <ul className="list-disc pl-5">
                <li>Set realistic due dates for your tasks</li>
                <li>Stay consistent to complete your daily quota to build a streak</li>
                <li>You can cancel any task at no penalty</li>
              </ul>
            </div>
          </motion.div>
        );

      case "digimon":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Digimon Care</h2>
            <p className="mb-4">
              Your active Digimon needs care and attention to thrive. Only your active Digimon receives experience from completed tasks.
            </p>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-full">
                <h3 className="text-xl font-semibold mb-2">Happiness</h3>
                <p className="mb-4">
                  Happiness represents your Digimon's emotional state:
                </p>
                <ul className="list-disc pl-5 mb-4">
                  <li>Decreases when you miss your daily quota</li>
                  <li>Decreases when you miss due dates for regular tasks</li>
                  <li>Lower happiness = lower experience gain</li>
                  <li>Complete tasks to increase happiness</li>
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
                <li>Complete tasks regularly to keep your Digimon happy</li>
                <li>Meet your daily quota to maintain happiness</li>
                <li>You can have multiple Digimon, but only one can be active at a time</li>
                <li>Switch your active Digimon from the Digimon page</li>
              </ul>
            </div>
          </motion.div>
        );

      case "evolution":
        return (
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
                  <li>Some evolutions require specific stat levels</li>
                  <li>Digimon have multiple branching evolutions</li>
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
                <li>Focus on specific stat categories if aiming for a particular evolution</li>
                <li>Check evolution requirements in your dashboard or Digidex</li>
              </ul>
            </div>
          </motion.div>
        );

      case "battles":
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 className="text-xl font-semibold mb-3">Understanding Battles</h3>
            <p className="mb-4">
              Battles are turn-based encounters where your Digimon team faces off against opponents. Success depends on your Digimon's stats, levels, and strategic use of Type and Attribute advantages.
            </p>

            <h4 className="text-lg font-medium mb-2">Type Advantages</h4>
            <p className="mb-3">
              Every Digimon has a Type. Types follow a rock-paper-scissors cycle:
            </p>
            <div className="flex items-center justify-center space-x-2 mb-4 p-3 bg-gray-100 rounded-lg">
              {allTypes.map((type, index) => (
                <React.Fragment key={type}>
                  <div className="flex flex-col items-center text-center">
                    <TypeAttributeIcon type={type} attribute="Neutral" size="md" />
                    <span className="text-xs mt-1">{type}</span>
                  </div>
                  {index < allTypes.length -1 && <span className="text-xl font-bold text-gray-500">&gt;</span>}
                </React.Fragment>
              ))}
               {/* Closing the loop */}
               <span className="text-xl font-bold text-gray-500">&gt;</span>
               <div className="flex flex-col items-center text-center">
                 <TypeAttributeIcon type={allTypes[0]} attribute="Neutral" size="md" />
                 <span className="text-xs mt-1">{allTypes[0]}</span>
               </div>
            </div>
            <p className="text-sm mb-4">
              Using an advantageous / non-advantageous Type deals 2x / 0.5 more damage. 'Free' types have no advantages or disadvantages.
            </p>

            <h4 className="text-lg font-medium mb-2">Attribute Advantages</h4>
            <p className="mb-3">
              Attributes add another layer of strategy. Each Attribute is strong against another specific Attribute:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-100 rounded-lg">
              {allAttributes.filter(attr => attr !== 'Neutral').map((attribute) => {
                const strongAgainst = attributeAdvantages[attribute];
                return (
                  <div key={attribute} className="flex items-center space-x-2">
                    <TypeAttributeIcon type="Free" attribute={attribute} size="sm" />
                    <span className="text-sm font-medium">{attribute}</span>
                    {strongAgainst && (
                      <>
                        <span className="text-gray-500">&gt;</span>
                        <TypeAttributeIcon type="Free" attribute={strongAgainst} size="sm" />
                        <span className="text-sm">{strongAgainst}</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
             <p className="text-sm mb-4">
               Advantages cause 1.5x damage. 'Neutral' attribute has no specific advantages or disadvantages.
             </p>

            <h4 className="text-lg font-medium mb-2">Battle Flow</h4>
            <ul className="list-disc pl-5 mb-4">
              <li>Battles are turn-based, with turn order determined by Digimon Speed (SPD).</li>
              <li>DEF blocks ATK, INT blocks INT, SP is crit damage.</li>
              <li>On attack, Digimon will use the highest of their ATK/INT stat.</li>
              <li>Digimon will take turns randomly attacking an enemy.</li>
              <li>Winning battles grants Experience Points (EXP) to all your Digimon, depending on the difficulty.</li>
            </ul>
          </motion.div>
        );

      case "milestones":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-4">Milestones & Rewards</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-2">Daily Quota Completion</h3>
                <ul className="list-disc pl-5 mb-4">
                  <li>Complete your daily quota for 3 days to earn a new Digimon</li>
                  <li>Progress reset when you claim your reward</li>
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
        );

      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">How to Play</h1>

      {/* Navigation Tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <ul className="space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center space-x-3 ${
                    activeSection === section.id
                      ? "bg-primary-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/4 bg-white p-6 rounded-lg shadow">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export default Tutorial; 