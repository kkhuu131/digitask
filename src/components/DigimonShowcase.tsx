import React, { useState, useEffect } from 'react';

const DigimonShowcase: React.FC = () => {
  const [digimonImages, setDigimonImages] = useState<string[]>([]);
  
  useEffect(() => {
    // All available Digimon sprite URLs
    const allDigimonSprites = [
      "/assets/digimon/dot387.png", "/assets/digimon/dot437.png", "/assets/digimon/dot320.png",
      "/assets/digimon/dot062.png", "/assets/digimon/dot322.png", "/assets/digimon/dot438.png",
      "/assets/digimon/dot631.png", "/assets/digimon/dot325.png", "/assets/digimon/dot515.png",
      "/assets/digimon/dot510.png", "/assets/digimon/dot514.png", "/assets/digimon/dot388.png",
      "/assets/digimon/dot050.png", "/assets/digimon/dot143.png", "/assets/digimon/dot063.png",
      "/assets/digimon/dot081.png", "/assets/digimon/dot564.png", "/assets/digimon/dot582.png",
      "/assets/digimon/dot569.png", "/assets/digimon/dot151.png", "/assets/digimon/dot713.png",
      "/assets/digimon/dot053.png", "/assets/digimon/dot626.png", "/assets/digimon/dot595.png",
      "/assets/digimon/dot111.png", "/assets/digimon/dot709.png", "/assets/digimon/dot697.png",
      "/assets/digimon/dot728.png", "/assets/digimon/dot701.png", "/assets/digimon/dot303.png",
      "/assets/digimon/dot708.png", "/assets/digimon/dot208.png", "/assets/digimon/dot112.png",
      "/assets/digimon/dot009.png", "/assets/digimon/dot096.png", "/assets/digimon/dot307.png",
      "/assets/digimon/dot705.png", "/assets/digimon/dot042.png", "/assets/digimon/dot361.png",
      "/assets/digimon/dot389.png", "/assets/digimon/dot706.png", "/assets/digimon/dot607.png",
      "/assets/digimon/dot056.png", "/assets/digimon/dot390.png", "/assets/digimon/dot002.png",
      "/assets/digimon/dot750.png", "/assets/digimon/dot392.png", "/assets/digimon/dot730.png",
      "/assets/digimon/dot015.png", "/assets/digimon/dot676.png", "/assets/digimon/dot064.png",
      "/assets/digimon/dot344.png", "/assets/digimon/dot377.png", "/assets/digimon/dot680.png",
      "/assets/digimon/dot393.png", "/assets/digimon/dot365.png", "/assets/digimon/dot087.png",
      "/assets/digimon/dot394.png", "/assets/digimon/dot760.png", "/assets/digimon/dot068.png",
      "/assets/digimon/dot304.png", "/assets/digimon/dot710.png", "/assets/digimon/dot012.png",
      "/assets/digimon/dot714.png", "/assets/digimon/dot395.png", "/assets/digimon/dot630.png",
      "/assets/digimon/dot326.png", "/assets/digimon/dot712.png", "/assets/digimon/dot367.png",
      "/assets/digimon/dot399.png", "/assets/digimon/dot209.png", "/assets/digimon/dot113.png",
      "/assets/digimon/dot005.png", "/assets/digimon/dot030.png", "/assets/digimon/dot058.png",
      "/assets/digimon/dot347.png", "/assets/digimon/dot130.png", "/assets/digimon/dot313.png",
      "/assets/digimon/dot014.png", "/assets/digimon/dot091.png", "/assets/digimon/dot698.png",
      "/assets/digimon/dot755.png", "/assets/digimon/dot621.png", "/assets/digimon/dot363.png",
      "/assets/digimon/dot092.png", "/assets/digimon/dot093.png", "/assets/digimon/dot102.png",
      "/assets/digimon/dot396.png", "/assets/digimon/dot375.png", "/assets/digimon/dot070.png",
      "/assets/digimon/dot115.png", "/assets/digimon/dot013.png", "/assets/digimon/dot397.png",
      "/assets/digimon/dot752.png", "/assets/digimon/dot043.png", "/assets/digimon/dot314.png",
      "/assets/digimon/dot010.png", "/assets/digimon/dot369.png", "/assets/digimon/dot370.png",
      "/assets/digimon/dot025.png"
    ];
    
    // Shuffle array and pick 30 random images
    const shuffled = [...allDigimonSprites].sort(() => 0.5 - Math.random());
    const selectedImages = shuffled.slice(0, 30);
    
    setDigimonImages(selectedImages);
  }, []);
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-2 p-4 bg-white rounded-lg shadow-md">
      {digimonImages.map((image, index) => (
        <div 
          key={index} 
          className="flex items-center justify-center p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
        >
          <img 
            src={image} 
            alt={`Digimon ${index + 1}`} 
            className="h-12 w-12 object-contain"
            style={{ imageRendering: "pixelated" }}
            onError={(e) => {
              // If image fails to load, hide it
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DigimonShowcase; 