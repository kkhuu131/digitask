import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import DigimonSprite from '@/components/DigimonSprite';
import { Sword, Trophy, ShoppingBag, Zap, Users } from 'lucide-react';

const BattleHub: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [energy, setEnergy] = useState<{ current: number; max: number }>({ current: 0, max: 10 });

  // Fetch battle energy
  useEffect(() => {
    const fetchEnergy = async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('battle_energy, max_battle_energy')
        .eq('id', user.id)
        .single();
      if (profile) {
        setEnergy({ current: profile.battle_energy ?? 0, max: profile.max_battle_energy ?? 10 });
      }
    };
    fetchEnergy();
    const onEnergyUpdated = () => fetchEnergy();
    window.addEventListener('energy-updated', onEnergyUpdated);
    return () => window.removeEventListener('energy-updated', onEnergyUpdated);
  }, [user]);

  const battleModes = [
    {
      id: 'daily-ai',
      title: 'Daily AI Battles',
      description:
        'Battle against AI-generated teams to earn XP and Bits. New opponents every day.',
      icon: Sword,
      path: '/battle',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      features: [
        'Daily rotating AI opponents',
        'First win bonus (2x rewards)',
        'Win streak multipliers',
        '1 ticket per battle',
      ],
      sprite: 'Agumon (2006)',
      comingSoon: false,
    },
    {
      id: 'tournament',
      title: 'Weekly Tournament',
      description:
        'Compete in a weekly bracket tournament. Beat 3 opponents including a powerful boss to become Champion!',
      icon: Trophy,
      path: '/tournament',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      features: [
        'Unlock after 10 weekly tasks',
        '3-round single elimination',
        'Boss battle in Grand Final',
        'Placement prizes in Bits',
      ],
      sprite: 'Myotismon',
      comingSoon: false,
    },
    {
      id: 'store',
      title: "Neemon's Store",
      description:
        'Purchase stat boosters, utility items, and special upgrades to enhance your Digimon and account.',
      icon: ShoppingBag,
      path: '/store',
      color: 'from-amber-500 to-amber-600',
      hoverColor: 'hover:from-amber-600 hover:to-amber-700',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      borderColor: 'border-amber-200 dark:border-amber-800',
      features: ['Stat boosters', 'Evolution materials', 'Utility items', 'Special upgrades'],
      sprite: 'Neemon',
      comingSoon: false,
    },
    {
      id: 'pvp',
      title: 'Async PvP',
      description:
        'Challenge other tamers to asynchronous battles. Leave a team behind and see how you rank.',
      icon: Users,
      path: '/pvp',
      color: 'from-rose-500 to-rose-600',
      hoverColor: 'hover:from-rose-600 hover:to-rose-700',
      bgColor: 'bg-rose-50 dark:bg-rose-900/20',
      borderColor: 'border-rose-200 dark:border-rose-800',
      features: [
        "Battle real players' teams",
        'Seasonal rankings',
        'Defense team setup',
        'Rivalry challenges',
      ],
      sprite: 'Agumon (2006)',
      comingSoon: true,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-heading font-semibold dark:text-gray-100 mb-4"
        >
          Battle Hub
        </motion.h1>
      </div>

      {/* Energy Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 flex justify-center"
      >
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3">
          <Zap className="w-5 h-5 text-white" />
          <div className="text-white">
            <span className="font-bold text-xl">{energy.current}</span>
            <span className="text-amber-100 mx-1">/</span>
            <span className="text-amber-100">{energy.max}</span>
            <span className="text-sm ml-2 text-amber-100">Battle Tickets</span>
          </div>
        </div>
      </motion.div>

      {/* Battle Mode Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 items-stretch">
        {battleModes.map((mode, index) => {
          const Icon = mode.icon;
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => !mode.comingSoon && navigate(mode.path)}
              className={`group relative bg-white dark:bg-dark-300 rounded-2xl p-6 border-2 ${mode.borderColor} transition-all duration-300 ${mode.bgColor} flex flex-col h-full ${mode.comingSoon ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:scale-105'}`}
            >
              {/* Coming Soon badge */}
              {mode.comingSoon && (
                <div className="absolute top-3 right-3 z-20 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  Coming Soon
                </div>
              )}

              {/* Decorative gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon and Sprite */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${mode.color} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-16 h-16 flex items-center justify-center">
                    <DigimonSprite
                      digimonName={mode.sprite}
                      fallbackSpriteUrl={`/assets/digimon/${mode.sprite.toLowerCase()}.png`}
                      size="md"
                      showHappinessAnimations={false}
                    />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-heading font-semibold dark:text-gray-100 mb-2">
                  {mode.title}
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                  {mode.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-4 flex-1">
                  {mode.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${mode.color} flex-shrink-0`}
                      />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button - Always at bottom */}
                <div className={`mt-auto pt-4 border-t ${mode.borderColor}`}>
                  {mode.comingSoon ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold">
                      <span>Coming Soon</span>
                    </div>
                  ) : (
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${mode.color} ${mode.hoverColor} text-white font-semibold shadow-md group-hover:shadow-lg transition-all`}
                    >
                      <span>Enter</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BattleHub;
