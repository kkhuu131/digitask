import { useReducedMotion } from 'framer-motion';
import DigimonSprite from './DigimonSprite';
import FighterIdentity from './DigimonCardIdentity';

export const ReadySprite = ({
  name,
  url,
  opponent = false,
}: {
  name: string;
  url: string;
  opponent?: boolean;
}) => {
  const reducedMotion = useReducedMotion();
  return (
    <div
      className="relative flex h-28 sm:h-32 w-full items-center justify-center overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute bottom-5 sm:bottom-6 h-3 w-16 rounded-[50%] bg-gray-200/70 dark:bg-dark-100/60" />
      <div className={`relative ${opponent ? '' : '-scale-x-100'}`}>
        <div className="scale-75 sm:scale-100">
          <DigimonSprite
            digimonName={name}
            fallbackSpriteUrl={url}
            size="md"
            showHappinessAnimations={!reducedMotion}
          />
        </div>
      </div>
    </div>
  );
};

const BattleFighterPreview = ({
  name,
  level,
  spriteUrl,
  type,
  attribute,
}: {
  name: string;
  level: number;
  spriteUrl: string;
  type?: string;
  attribute?: string;
}) => (
  <div className="min-w-0 rounded-xl border border-gray-200 dark:border-dark-100 bg-gray-50 dark:bg-dark-200 px-1 pb-3">
    <ReadySprite name={name} url={spriteUrl} opponent />
    <FighterIdentity name={name} level={level} type={type} attribute={attribute} />
  </div>
);

export default BattleFighterPreview;
