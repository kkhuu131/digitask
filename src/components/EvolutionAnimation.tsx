import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EvolutionAnimationProps {
  oldSpriteUrl: string;
  newSpriteUrl: string;
  onComplete: () => void;
  isDevolution?: boolean;
  isDNAFusion?: boolean;
  dnaPartnerSpriteUrl?: string;
}

const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
  oldSpriteUrl,
  newSpriteUrl,
  onComplete,
  isDevolution = false,
  isDNAFusion = false,
  dnaPartnerSpriteUrl,
}) => {
  const [stage, setStage] = useState<"intro" | "pulse" | "transform" | "finale">("intro");
  const [showText, setShowText] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [currentSprite, setCurrentSprite] = useState(oldSpriteUrl);
  const [silhouette, setSilhouette] = useState(false);
  const sparklesRef = useRef<HTMLDivElement>(null);
  
  // Store the onComplete callback in a ref to avoid dependency changes
  const onCompleteRef = useRef(onComplete);
  
  // Update the ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  
  // Store the newSpriteUrl in a ref to avoid dependency changes
  const newSpriteUrlRef = useRef(newSpriteUrl);
  
  // Update the ref when newSpriteUrl changes
  useEffect(() => {
    newSpriteUrlRef.current = newSpriteUrl;
  }, [newSpriteUrl]);
  
  // Create sparkle elements
  const createSparkles = useCallback(() => {
    if (!sparklesRef.current) return;
    
    const container = sparklesRef.current;
    container.innerHTML = '';
    
    for (let i = 0; i < 40; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'absolute rounded-full';
      
      // Random size between 2-6px
      const size = Math.floor(Math.random() * 4) + 2;
      sparkle.style.width = `${size}px`;
      sparkle.style.height = `${size}px`;
      
      // Random position around the center
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      sparkle.style.left = `calc(50% + ${x}px)`;
      sparkle.style.top = `calc(50% + ${y}px)`;
      
      // Random color - white, yellow, light blue
      const colors = ['#ffffff', '#ffffaa', '#aaddff'];
      sparkle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      // Random animation duration
      const duration = Math.random() * 1.5 + 0.5;
      sparkle.style.animation = `sparkle ${duration}s infinite`;
      
      container.appendChild(sparkle);
    }
  }, []);

  // Run the animation sequence only once when the component mounts
  useEffect(() => {
    // Intro sequence
    const introTimer = setTimeout(() => {
      setShowText(true);
      
      // After text appears, start the pulse
      const pulseTimer = setTimeout(() => {
        setStage("pulse");
        setShowSparkles(true);
        createSparkles();
        
        // Start transformation sequence
        const transformTimer = setTimeout(() => {
          setStage("transform");
          setSilhouette(true);
          
          // Flash between sprites but keep silhouette
          let count = 0;
          const flashInterval = setInterval(() => {
            count++;
            if (count === 3) {
              // Switch to new sprite but keep as silhouette
              setCurrentSprite(newSpriteUrlRef.current);
            }
            if (count >= 5) {
              clearInterval(flashInterval);
              
              // Finale sequence
              const finaleTimer = setTimeout(() => {
                setStage("finale");
                setSilhouette(false);
                
                // Complete animation
                const completeTimer = setTimeout(() => {
                  onCompleteRef.current();
                }, 2000);
                
                return () => clearTimeout(completeTimer);
              }, 1000);
              
              return () => clearTimeout(finaleTimer);
            }
          }, 300);
          
          return () => clearInterval(flashInterval);
        }, 3000);
        
        return () => clearTimeout(transformTimer);
      }, 1500);
      
      return () => clearTimeout(pulseTimer);
    }, 500);
    
    return () => clearTimeout(introTimer);
  }, [createSparkles]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-2xl mx-auto">
        {/* Title text */}
        <AnimatePresence>
          {showText && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-0 right-0 text-center mb-8"
            >
              <h2 className="text-4xl font-bold text-white tracking-wider drop-shadow-lg">
                {isDevolution ? "DE-DIGIVOLUTION" : isDNAFusion ? "DNA DIGIVOLUTION" : "DIGIVOLUTION"}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sprite container */}
        <div className="relative flex justify-center items-center h-64 my-12">
          
          {/* Sparkles container */}
          <div 
            ref={sparklesRef} 
            className={`absolute inset-0 ${showSparkles ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          />
          
          {isDNAFusion ? (
            // DNA Fusion Animation
            <div className="relative w-full h-full flex items-center justify-center">
              {/* First Digimon (left) */}
              <motion.div
                className="absolute z-20 w-32 h-32 flex items-center justify-center"
                initial={{ x: -80, opacity: 1 }}
                animate={{
                  x: stage === "transform" ? 0 : -80,
                  opacity: stage === "transform" ? [1, 1, 0] : 1,
                  scale: stage === "pulse" ? [1, 1.1, 1] : 
                         stage === "transform" ? [1, 1.2, 0] : 1,
                  rotate: stage === "transform" ? [0, 10, 0] : 0,
                }}
                transition={{
                  duration: stage === "pulse" ? 1.5 : 
                            stage === "transform" ? 2 : 1,
                  times: stage === "transform" ? [0, 0.7, 1] : [0, 0.5, 1],
                  repeat: stage === "pulse" ? Infinity : 0,
                  repeatType: "loop"
                }}
              >
                <div className="relative w-full h-full">
                  <img 
                    src={oldSpriteUrl} 
                    alt="First Digimon"
                    className={`w-full h-full object-contain ${stage === "transform" && silhouette ? 'invisible' : 'visible'}`}
                    style={{ imageRendering: "pixelated" }}
                  />
                  
                  {/* Silhouette overlay */}
                  {stage === "transform" && silhouette && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={oldSpriteUrl} 
                        alt="Silhouette"
                        className="w-full h-full object-contain"
                        style={{ 
                          imageRendering: "pixelated",
                          filter: "brightness(0) invert(1)",
                          opacity: 0.8
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Second Digimon (right) - DNA Partner */}
              <motion.div
                className="absolute z-20 w-32 h-32 flex items-center justify-center"
                initial={{ x: 80, opacity: 1 }}
                animate={{
                  x: stage === "transform" ? 0 : 80,
                  opacity: stage === "transform" ? [1, 1, 0] : 1,
                  scale: stage === "pulse" ? [1, 1.1, 1] : 
                         stage === "transform" ? [1, 1.2, 0] : 1,
                  rotate: stage === "transform" ? [0, -10, 0] : 0,
                }}
                transition={{
                  duration: stage === "pulse" ? 1.5 : 
                            stage === "transform" ? 2 : 1,
                  times: stage === "transform" ? [0, 0.7, 1] : [0, 0.5, 1],
                  repeat: stage === "pulse" ? Infinity : 0,
                  repeatType: "loop"
                }}
              >
                <div className="relative w-full h-full">
                  <img 
                    src={dnaPartnerSpriteUrl} 
                    alt="Second Digimon"
                    className={`w-full h-full object-contain ${stage === "transform" && silhouette ? 'invisible' : 'visible'}`}
                    style={{ imageRendering: "pixelated" }}
                  />
                  
                  {/* Silhouette overlay */}
                  {stage === "transform" && silhouette && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img 
                        src={dnaPartnerSpriteUrl} 
                        alt="Silhouette"
                        className="w-full h-full object-contain"
                        style={{ 
                          imageRendering: "pixelated",
                          filter: "brightness(0) invert(1)",
                          opacity: 0.8
                        }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* Fusion Spiral Effect */}
              {stage === "transform" && (
                <motion.div
                  className="absolute z-10 w-40 h-40 rounded-full border-4 border-yellow-400 border-dashed"
                  animate={{
                    rotate: [0, 360],
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.8, 0]
                  }}
                  transition={{
                    duration: 2,
                    times: [0, 0.5, 1],
                    repeat: 1,
                    repeatType: "loop"
                  }}
                />
              )}
              
              {/* Result Digimon (center) */}
              <motion.div
                className="relative z-20 w-40 h-40 flex items-center justify-center"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: stage === "finale" ? [0, 1.5, 1] : 0,
                  opacity: stage === "finale" ? [0, 1] : 0,
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.7, 1],
                }}
              >
                <div className="relative w-full h-full">
                  <img 
                    src={newSpriteUrl} 
                    alt="Fused Digimon"
                    className="w-full h-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </motion.div>
            </div>
          ) : (
            // Regular Evolution Animation
            <motion.div
              className="relative z-20 w-40 h-40 flex items-center justify-center"
              style={{ transformOrigin: '50% 50%' }}
              animate={{
                scale: stage === "pulse" ? [1, 1.2, 1] : 
                       stage === "transform" ? [1, 1.5, 1.3, 1.6] : 
                       stage === "finale" ? [1.6, 1] : 1,
                rotate: stage === "transform" ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: stage === "pulse" ? 1.5 : 
                          stage === "transform" ? 2 : 
                          stage === "finale" ? 0.5 : 1,
                repeat: stage === "pulse" ? Infinity : 0,
                repeatType: "loop"
              }}
            >
              {/* Actual sprite image */}
              <div className="relative w-full h-full">
                <img 
                  src={currentSprite} 
                  alt="Evolving Digimon"
                  className={`w-full h-full object-contain ${silhouette ? 'invisible' : 'visible'}`}
                  style={{ imageRendering: "pixelated" }}
                />
                
                {/* Silhouette overlay */}
                {silhouette && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                      src={currentSprite} 
                      alt="Silhouette"
                      className="w-full h-full object-contain"
                      style={{ 
                        imageRendering: "pixelated",
                        filter: "brightness(0) invert(1)",
                        opacity: 0.8
                      }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Evolution/Devolution complete text */}
        {stage === "finale" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-8"
          >
            <h3 className="text-2xl font-bold text-white">
              {isDevolution ? "Devolution Successful!" : 
               isDNAFusion ? "DNA Fusion Complete!" : 
               "Evolution Complete!"}
            </h3>
          </motion.div>
        )}
      </div>
      
      {/* Add CSS for sparkle animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes sparkle {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
        `
      }} />
    </div>
  );
};

export default EvolutionAnimation;
