import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTasks, FaHeart, FaFistRaised, FaTrophy, FaQuestion, FaChevronUp } from "react-icons/fa";
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

// Section component for consistent styling
const ManualSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button 
        className="w-full px-4 py-3 flex justify-between items-center bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-xl font-semibold text-blue-800">{title}</h3>
        <FaChevronUp className={`text-blue-800 transition-transform ${isOpen ? '' : 'transform rotate-180'}`} />
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div ref={contentRef} className="px-3 py-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Tutorial = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top of content when section changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeSection]);

  const sections = [
    { id: "intro", title: "Welcome", icon: <FaQuestion /> },
    { id: "tasks", title: "Task System", icon: <FaTasks /> },
    { id: "digimon", title: "Digimon Care", icon: <FaHeart /> },
    { id: "evolution", title: "Evolution", icon: <GiLevelEndFlag /> },
    { id: "battles", title: "Battles", icon: <FaFistRaised /> },
    { id: "milestones", title: "Milestones", icon: <FaTrophy /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "intro":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Welcome</h2>
                <p className="text-gray-600 italic">Your guide to the Digital World</p>
              </div>
            </div>
            
            <ManualSection title="What is Digitask?">
              <p className="mb-4">
                Digitask combines task management with virtual pet gameplay to make productivity fun!
              </p>
              <p className="mb-4">
                Complete tasks to care for your Digimon, help them evolve, and battle against other players.
              </p>
              <p>
                This guide will walk you through all the features and mechanics of Digitask to help you get started.
              </p>
            </ManualSection>
            
            <ManualSection title="Getting Started">
              <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                <div className="md:w-1/2">
                  <p className="mb-4">
                    You set your own tasks. You can set 1 active Digimon at a time. Your active Digimon will recieve full experience from completed tasks, and the rest of your Digimon will recieve half experience.
                  </p>
                  <p className="mb-4">
                    Keep your Digimon happy and healthy, earn experience points for your Digimon, complete your daily quota, and build a streak for increased experience points.
                  </p>
                  <p className="text-yellow-600 font-medium mb-4">
                    Missing your daily quota or any task will decrease your Digimon's happiness!
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
            </ManualSection>
          </motion.div>
        );

      case "tasks":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Task System</h2>
                <p className="text-gray-600 italic">Organize your productivity</p>
              </div>
            </div>
            
            <ManualSection title="Task Types">
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
                  })()} (8:00 UTC) and need to be completed before the next day.
                  </p>
                </div>
                <div className="md:w-1/2">
                  <h3 className="text-xl font-semibold mb-2">One-time Tasks</h3>
                  <p className="mb-4">
                    One-time tasks have a set date and time and provide slightly more rewards than daily and recurring tasks.
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
            </ManualSection>
            
            <ManualSection title="Task Categories & Stat Bonuses">
              <div className="mb-4">
                Each task is given a category that corresponds to a stat bonus (HP, ATK, etc.).
                These tasks are automatically given a category based on its description, but can be changed.
                When completed, the task will give that stat bonus, either to your active Digimon, or saved for later use.
                These stat bonuses can help you reach stat requirements for evolutions.
              </div>
              <div className="mb-4">
                There is also a cap to the amount of stat bonuses a Digimon can have at once, explained in the Digimon Care section.
              </div>
            </ManualSection>
            
            <ManualSection title="Daily Quota & Streaks">
              <div>
                <p className="mb-4">
                  Each day, you have a daily quota of 3 tasks. Completing your daily quota will reward your whole team with 100 experience points.
                  Continuing to complete your daily quota will build a streak, and will multiplicatively increase the experience points you earn up to 2.5x.
                </p>
                <p className="mb-4">
                  Missing your daily quota or any task will decrease your Digimon's happiness!
                </p>
              </div>
            </ManualSection>
          </motion.div>
        );

      case "digimon":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Digimon Care</h2>
                <p className="text-gray-600 italic">Nurture your digital companions</p>
              </div>
            </div>
            
            <ManualSection title="Happiness">
              <p className="mb-4">
                Happiness is a measure of how happy your Digimon is. A lower happiness will decrease the subsequent experience points you earn from tasks.
              </p>
            </ManualSection>

            <ManualSection title="Personality">
              <p className="mb-4">
                Each Digimon has a personality that marginally affects stats. Each personality type increases its corresponding stat by 5%.
              </p>
            

              <div className="flex flex-col gap-2 mb-4">
                <p className="mb-2">
                  The personality types are:
                </p>
              <ul>
                <li><b>Durable:</b> HP</li>
                <li><b>Lively:</b> SP</li>
                <li><b>Fighter:</b> ATK</li>
                <li><b>Defender:</b> DEF</li>
                <li><b>Brainy:</b> INT</li>
                <li><b>Nimble:</b> SPD</li>
              </ul>
              </div>
            </ManualSection>
            
            <ManualSection title="Stats & Growth">
              <p className="mb-4">
                Stats overall will increase as your Digimon levels up and from stat bonuses you receive from tasks.
              </p>
            </ManualSection>
            
            <ManualSection title="Managing Multiple Digimon">
              <p className="mb-4">
                You will gain the option to nurture multiple Digimon as you progress. You can manage multiple Digimon at once. You can set one Digimon as active, and the rest will be inactive.
              </p>
            </ManualSection>
          </motion.div>
        );

      case "evolution":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Evolution</h2>
                <p className="text-gray-600 italic">Help your Digimon grow stronger</p>
              </div>
            </div>
            
            <ManualSection title="Evolution Basics">
              <p className="mb-4">
                Evolution changes your Digimon's form, stats, types, and attributes. Evolutions typically require a minimum level, and some stat requirements (ex. 1000 HP).
              </p>
              <p className="mb-4">
                Many Digimon will have multiple branching evolutions, and you will typically not know which evolution you will get until after you evolve, unless you've discovered it already.
                You can still see the silhouettes of the evolutions, so you can get an idea of what you will get.
              </p>
              <p className="mb-4">
                Evolving or devolving your Digimon will always reset your level back to 1.
              </p>
            </ManualSection>

            <ManualSection title="ABI (Ability)">
              <p className="mb-4">
                In addition to the typical stats, each Digimon has a special stat called ABI or Ability. This stat is only earned from evolving, or devolving your Digimon.
              </p>
              <p className="mb-4">
                The amount gained is calculated by the formula:
                <br />
                <br />
                <span className="font-bold">
                  Amount for Digivolution = 1 + (Level / 10)
                </span>
                <br />
                <span className="font-bold">
                  Amount for De-Digivolution = 1 + (Level / 5)
                </span>
              </p>
              <p className="mb-4">
                ABI is used for several things, to calculate the cap of stat bonuses you can have, for some evolutions, and the milestone rewards (further explained in the Milestones section).
              </p>
              <p className="mb-4">
                The cap is calculated by the formula:
                <br />
                <br />
                <span className="font-bold">
                  Cap = 50 + (ABI / 2)
                </span>
                
              </p>
            </ManualSection>
            
            <ManualSection title="Evolution Stages">
              <p className="mb-4">
                Each Digimon has a stage, which basically just determines how far along the Digimon is in its evolution path.
              </p>
              <p className="mb-4">
                In order, the stages are: Baby, In-Training, Rookie, Champion, and Ultimate, Mega, and Ultra.
                Some special Digimon may have a different stage such as Armor or None.
              </p>
            </ManualSection>
            
            <ManualSection title="Evolution Requirements">
              <p className="mb-4">
                Evolution requirements are typically a minimum level, and multiple stat requirements.
              </p>
              <p className="mb-4">
                As mentioned before, some evolutions may require a minimum ABI.
              </p>
            </ManualSection>

            <ManualSection title="De-Digivolution">
              <p className="mb-4">
                As the name implies, de-digivolution is the process of de-evolving your Digimon.
              </p>

              <p className="mb-4">
                This is a beneficial process, as it gives more ABI than evolving. It also allows you to explore other paths that you may have missed.
              </p>
            </ManualSection>

            <ManualSection title="DNA Digivolution">
              <p className="mb-4">
                Lastly, there is a special kind of evolution called DNA Digivolution or Fusion. This requires a 2nd Digimon to fuse with the current.
                This consumes the 2nd Digimon, and won't transfer over the 2nd Digimon's bonus stats or ABI.
              </p>
            </ManualSection>
          </motion.div>
        );

      case "battles":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Battle System</h2>
                <p className="text-gray-600 italic">Test your Digimon's strength</p>
              </div>
            </div>
            
            <ManualSection title="Battle Basics">
              <p className="mb-4">
                Battles are 3v3 turn-based encounters where your Digimon team faces off against opponents. Success depends on your Digimon's stats, levels, and strategic use of Type and Attribute advantages.
              </p>
              
              <h4 className="font-semibold text-lg mb-2">Battle Modes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-1">Arena</h5>
                  <p className="text-sm mb-2">Battle against other players' Digimon teams.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Test your team against real players or wild Digimon</li>
                    <li>5 battles per day</li>
                    <li>Earn experience points</li>
                    <li>Climb the leaderboard rankings</li>
                  </ul>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <h5 className="font-medium text-green-700 mb-1">Campaign</h5>
                  <p className="text-sm mb-2">Progress through story-based encounters.</p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Battle against AI-controlled Digimon</li>
                    <li>Infinite attempts, but no experience ponts</li>
                    <li>Increasing difficulty levels</li>
                    <li>Unlock special rewards and Digimon</li>
                  </ul>
                </div>
              </div>
              
              <h4 className="font-semibold text-lg mb-2">Battle Flow</h4>
              <ol className="list-decimal pl-5 mb-4 space-y-2">
                <li>Digimon take turns based on their Speed (SPD) stat</li>
                <li>Each Digimon automatically attacks a random enemy</li>
                <li>Damage is calculated based on stats and type advantages</li>
                <li>Battle continues until one team is defeated</li>
                <li>Winning earns experience for all your Digimon</li>
              </ol>
            </ManualSection>
            
            <ManualSection title="Type Advantages">
              <p className="mb-4">
                Every Digimon has a Type that follows a rock-paper-scissors relationship:
              </p>
              
              <div className="flex flex-col space-y-4 mb-4 p-3 bg-gray-100 rounded-lg">
                {/* Main type cycle */}
                <div className="flex items-center justify-center space-x-2">
                  {allTypes.map((type, index) => (
                    <React.Fragment key={type}>
                      <div className="flex flex-col items-center text-center">
                        <TypeAttributeIcon type={type} attribute="Neutral" size="md" />
                        <span className="text-xs mt-1">{type}</span>
                      </div>
                      {index < allTypes.length - 1 && <span className="text-xl font-bold text-gray-500">&gt;</span>}
                    </React.Fragment>
                  ))}
                  {/* Closing the loop */}
                  <span className="text-xl font-bold text-gray-500">&gt;</span>
                  <div className="flex flex-col items-center text-center">
                    <TypeAttributeIcon type={allTypes[0]} attribute="Neutral" size="md" />
                    <span className="text-xs mt-1">{allTypes[0]}</span>
                  </div>
                </div>
                
                {/* Free type on its own row */}
                <div className="flex justify-center pt-4 border-t border-gray-300">
                  <div className="flex flex-col items-center text-center">
                    <TypeAttributeIcon type={"Free"} attribute="Neutral" size="md" />
                    <span className="text-xs mt-1">Free</span>
                  </div>
                </div>
              </div>
              
              <p className="mb-4">
                <span className="font-medium">Type advantage effects:</span>
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Advantageous type: 2x damage</li>
                <li>Disadvantageous type: 0.5x damage</li>
                <li>'Free' type has no advantages or disadvantages</li>
              </ul>
            </ManualSection>
            
            <ManualSection title="Attribute Advantages">
              <p className="mb-4">
                Attributes add another layer of strategy. Each Attribute is strong against another specific Attribute:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-100 rounded-lg">
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
              
              <p className="mb-4">
                <span className="font-medium">Attribute advantage effects:</span>
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Advantageous attribute: 1.5x damage</li>
                <li>Disadvantageous attribute: 1.0x damage</li>
                <li>'Neutral' attribute has no specific advantages or disadvantages</li>
              </ul>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <p className="text-sm">
                  <span className="font-bold">Tip:</span> Combining Type and Attribute advantages can result in up to 3x damage!
                </p>
              </div>
            </ManualSection>
            
            <ManualSection title="Stats in Battle">
              <p className="mb-4">
                Understanding how stats affect battle performance is crucial for building effective teams:
              </p>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border">Stat</th>
                      <th className="py-2 px-4 border">Battle Effect</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-red-700">HP</td>
                      <td className="py-2 px-4 border">Determines how much damage your Digimon can take before being defeated</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-orange-700">ATK</td>
                      <td className="py-2 px-4 border">Determines physical attack damage; blocked by opponent's DEF</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-green-700">DEF</td>
                      <td className="py-2 px-4 border">Reduces damage from physical attacks (ATK)</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-purple-700">INT</td>
                      <td className="py-2 px-4 border">Determines special attack damage and reduces special attack damage received</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-blue-700">SP</td>
                      <td className="py-2 px-4 border">Affects critical hit damage</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-4 border font-medium text-yellow-700">SPD</td>
                      <td className="py-2 px-4 border">Determines turn order in battles</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mb-4">
                <span className="font-medium">Important battle mechanics:</span>
              </p>
              <ul className="list-disc pl-5 mb-4">
                <li>Digimon automatically use their highest offensive stat (ATK or INT) when attacking</li>
                <li>Digimon will randomly attack one of the opponent's Digimon</li>
              </ul>
            </ManualSection>
            
            <ManualSection title="Battle Strategy Tips">
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="font-medium">Balanced team composition:</span> Try to build up a diverse team, so you can counter different types of opponents.
                </li>
                <li>
                  <span className="font-medium">Stat specialization:</span> Consider specializing some Digimon in ATK and others in INT for versatile offense.
                </li>
                <li>
                  <span className="font-medium">Speed advantage:</span> Faster Digimon attack first, potentially defeating opponents before they can act.
                </li>
                <li>
                  <span className="font-medium">Evolution planning:</span> Some evolutions have better Type/Attribute combinations for battles.
                </li>
                <li>
                  <span className="font-medium">Regular training:</span> Complete tasks consistently to keep your Digimon's happiness and stats high.
                </li>
              </ul>
            </ManualSection>
          </motion.div>
        );

      case "milestones":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">Progression</h2>
                <p className="text-gray-600 italic">Tracking your progress</p>
              </div>
            </div>
            
            <ManualSection title="ABI Milestone">
              <p className="mb-4">
                As your ABI across all your Digimon increases, you will be able to raise more Digimon at once:
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-5 mb-4">
                <div className="bg-blue-500 h-5 rounded-full" style={{ width: "40%" }}></div>
              </div>
              <p className="text-sm text-gray-600 mb-6">Example: ABI 4/10</p>
              
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Keep evolving and devolving your Digimon to increase your ABI</li>
                <li>Keep completing tasks and battles to level up your Digimon</li>
              </ul>
            </ManualSection>
            
            <ManualSection title="Claiming">
              <p className="mb-4">
                You can claim and view your milestone progress in the Your Digimon page.
              </p>
            
              <p className="mb-4">
                Claiming a Digimon will let you select a baby Digimon.
              </p>
            </ManualSection>

            <ManualSection title="Digidex">
              <p className="mb-4">
                The Digidex acts as an encyclopedia of all the Digimon you have discovered.
              </p>

              <p className="mb-4">
                You can view data about each Digimon by clicking on their icon in the Digidex.
              </p>
            </ManualSection>
            
            <ManualSection title="Titles">
              <p className="mb-4">
                As you progress, you will be able to unlock titles to display on your profile. There are different ways to unlock these:
              </p>
              
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>Discovering certain amounts of Digimon</li>
                <li>Winning certain amounts of arena battles</li>
                <li>Completing certain stages in the campaign</li>
                <li>Evolving Digimon to certain stages</li>
                <li>And more!</li>
              </ul>
            </ManualSection>
          </motion.div>
        );

      case "faq":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center mb-4">
              <img 
                src="/assets/digimon/bokomon.png" 
                alt="Bokomon" 
                className="h-20 object-contain mr-4"
                style={{ imageRendering: "pixelated" }}
              />
              <div>
                <h2 className="text-2xl font-bold">FAQ & Tips</h2>
                <p className="text-gray-600 italic">Common questions and helpful advice</p>
              </div>
            </div>
            
            <ManualSection title="Frequently Asked Questions">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg mb-1">What happens if I miss my daily quota?</h4>
                  <p>
                    Missing your daily quota will decrease your Digimon's happiness and reset your streak. This means you'll lose your XP multiplier bonus. Try to complete at least 3 tasks each day to maintain your streak.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-1">Can I have multiple active Digimon?</h4>
                  <p>
                    No, only one Digimon can be active at a time. Your active Digimon is the one that receives experience from completed tasks. You can switch your active Digimon at any time from the "Your Digimon" page.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-1">How do I evolve my Digimon?</h4>
                  <p>
                    When your Digimon reaches the required level and meets any specific stat requirements, evolution options will appear on your Digimon's profile. Click the "Evolve" button to choose an evolution path.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-1">What's the best way to allocate stat points?</h4>
                  <p>
                    It depends on your goals. For balanced growth, distribute points evenly. For specific evolutions, focus on the stats required for that evolution. For battle specialists, concentrate on either ATK or INT, plus SPD.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-1">How do I get more Digimon?</h4>
                  <p>
                    You can earn new Digimon by completing milestones (daily quota streak and task completion), progressing through campaign battles, and from special events.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-1">What time do daily tasks reset?</h4>
                  <p>
                    Daily tasks reset at 8:00 UTC each day, which is {(() => {
                      const resetTime = new Date();
                      resetTime.setUTCHours(8, 0, 0, 0);
                      return resetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    })()} in your local time.
                  </p>
                </div>
              </div>
            </ManualSection>
            
            <ManualSection title="Pro Tips">
              <ul className="list-disc pl-5 space-y-3">
                <li>
                  <span className="font-medium">Task Management:</span> Create a mix of daily, recurring, and one-time tasks to maintain a steady flow of rewards.
                </li>
                <li>
                  <span className="font-medium">Stat Allocation:</span> Save some stat points for when you need to meet specific evolution requirements.
                </li>
                <li>
                  <span className="font-medium">Battle Strategy:</span> Build a team with complementary Types and Attributes to counter various opponents.
                </li>
                <li>
                  <span className="font-medium">Evolution Planning:</span> Check the DigiDex to plan your evolution paths in advance.
                </li>
                <li>
                  <span className="font-medium">Happiness Management:</span> Complete at least one task daily to prevent happiness from dropping too low.
                </li>
                <li>
                  <span className="font-medium">Milestone Efficiency:</span> Claim milestone rewards as soon as they're available to start working toward the next one.
                </li>
                <li>
                  <span className="font-medium">Digimon Collection:</span> Rotate your active Digimon to level up multiple team members over time.
                </li>
              </ul>
            </ManualSection>
            
            <ManualSection title="Getting Help">
              <p className="mb-4">
                If you have questions or need assistance, there are several ways to get help:
              </p>
              
              <ul className="list-disc pl-5 mb-4 space-y-2">
                <li>
                  <span className="font-medium">This Manual:</span> Refer to the appropriate section for detailed information.
                </li>
                <li>
                  <span className="font-medium">Feedback Form:</span> Use the feedback button in the app to report issues or suggest improvements.
                </li>
                <li>
                  <span className="font-medium">Community:</span> Connect with other players to share tips and strategies.
                </li>
              </ul>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                <p className="text-sm">
                  <span className="font-bold">Remember:</span> Digitask is designed to help you be more productive while having fun. Use it in a way that works best for you!
                </p>
              </div>
            </ManualSection>
          </motion.div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p>Select a section from the menu to view its content.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Bokomon's Manual</h1>

      {/* Navigation Tabs */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <ul className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0">
            {sections.map((section) => (
              <li key={section.id} className="flex-shrink-0">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-2 rounded flex items-center space-x-3 ${
                    activeSection === section.id
                      ? "bg-primary-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="whitespace-nowrap">{section.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div 
          ref={contentRef}
          className="w-full md:w-3/4 bg-white p-4 md:p-6 rounded-lg shadow overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Tutorial; 