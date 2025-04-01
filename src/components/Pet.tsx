import { motion } from 'framer-motion';
import { usePetStore, Pet as PetType } from '../store/petStore';

// Pet images using public URLs
const petImages = {
  egg: '/assets/pet/egg.svg',
  baby: '/assets/pet/baby.svg',
  child: '/assets/pet/child.svg',
  teen: '/assets/pet/teen.svg',
  adult: '/assets/pet/adult.svg',
};

interface PetProps {
  pet: PetType;
}

const Pet = ({ pet }: PetProps) => {
  // Get the appropriate image based on pet stage
  const petImage = petImages[pet.current_stage as keyof typeof petImages] || petImages.egg;
  
  // Calculate health and happiness percentages
  const healthPercentage = (pet.health / 100) * 100;
  const happinessPercentage = (pet.happiness / 100) * 100;
  
  return (
    <div className="card flex flex-col items-center">
      <h2 className="text-2xl font-bold text-center mb-4">{pet.name}</h2>
      
      <div className="relative mb-6">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-40 h-40 flex items-center justify-center"
        >
          <img src={petImage} alt={`${pet.name} - ${pet.current_stage}`} className="max-w-full max-h-full" />
        </motion.div>
        
        {/* Mood indicator */}
        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
          {pet.happiness > 80 ? (
            <span className="text-2xl">😄</span>
          ) : pet.happiness > 50 ? (
            <span className="text-2xl">🙂</span>
          ) : pet.happiness > 30 ? (
            <span className="text-2xl">😐</span>
          ) : (
            <span className="text-2xl">😢</span>
          )}
        </div>
      </div>
      
      <div className="w-full space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Health</span>
            <span>{pet.health}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: healthPercentage > 60 ? '#10b981' : healthPercentage > 30 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Happiness</span>
            <span>{pet.happiness}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="h-2.5 rounded-full" 
              style={{ 
                width: `${happinessPercentage}%`,
                backgroundColor: happinessPercentage > 60 ? '#10b981' : happinessPercentage > 30 ? '#f59e0b' : '#ef4444'
              }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Evolution Progress</span>
            <span>{pet.evolution_points}/{pet.current_stage === 'egg' ? 10 : pet.current_stage === 'baby' ? 30 : pet.current_stage === 'child' ? 60 : pet.current_stage === 'teen' ? 100 : '∞'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-secondary-500 h-2.5 rounded-full" 
              style={{ 
                width: `${(pet.evolution_points / (pet.current_stage === 'egg' ? 10 : pet.current_stage === 'baby' ? 30 : pet.current_stage === 'child' ? 60 : pet.current_stage === 'teen' ? 100 : 100)) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Age: {pet.age_days} days</p>
        <p>Stage: {pet.current_stage.charAt(0).toUpperCase() + pet.current_stage.slice(1)}</p>
      </div>
    </div>
  );
};

export default Pet; 