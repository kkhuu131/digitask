import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const NeemonShopGreeting = ({ text }: { text: string }) => {
  const reducedMotion = useReducedMotion();
  const [visibleCharacters, setVisibleCharacters] = useState(0);

  useEffect(() => {
    setVisibleCharacters(0);
    if (reducedMotion) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const count = Math.min(text.length, Math.floor((Date.now() - startedAt) / 28));
      setVisibleCharacters(count);
      if (count === text.length) window.clearInterval(timer);
    }, 28);
    return () => window.clearInterval(timer);
  }, [text, reducedMotion]);

  return (
    <section aria-label="Neemon's greeting" className="ui-panel flex items-center gap-3 p-4 mb-6">
      <img
        src="/assets/digimon/neemon.png"
        alt=""
        className="h-16 w-16 shrink-0 object-contain"
        style={{ imageRendering: 'pixelated' }}
      />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Neemon
        </p>
        <p className="sr-only">{text}</p>
        <div aria-hidden="true" className="grid text-sm text-gray-600 dark:text-gray-300">
          <span className="invisible col-start-1 row-start-1">{text}</span>
          <span className="col-start-1 row-start-1">
            {reducedMotion ? text : text.slice(0, visibleCharacters)}
          </span>
        </div>
      </div>
    </section>
  );
};

export default NeemonShopGreeting;
