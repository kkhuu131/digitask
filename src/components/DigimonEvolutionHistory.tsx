import { useEffect, useState } from 'react';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { fetchDigimonHistory, type DigimonHistoryEntry } from '../lib/digimonHistory';
import DigimonSprite from './DigimonSprite';

interface Props {
  petId: string;
  speciesId: number;
}

const DigimonEvolutionHistory = ({ petId, speciesId }: Props) => {
  const [history, setHistory] = useState<DigimonHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setHistory([]);
    setSelectedId(null);
    setLoading(true);
    setError(false);
    fetchDigimonHistory(petId)
      .then((entries) => {
        if (!cancelled) setHistory(entries);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [petId, speciesId, retry]);

  const selected = history.find((entry) => entry.id === selectedId);
  const selectedSpecies = selected && DIGIMON_LOOKUP_TABLE[selected.digimon_id];

  return (
    <section className="mt-6" aria-label="Evolution history">
      <h4 className="ui-section-title mb-2">Evolution History</h4>
      {loading ? (
        <p className="text-sm text-gray-600 dark:text-gray-400" role="status">
          Loading history…
        </p>
      ) : error ? (
        <div className="text-sm text-gray-600 dark:text-gray-400" role="status">
          <p>Couldn’t load evolution history.</p>
          <button className="btn-secondary mt-2" onClick={() => setRetry((value) => value + 1)}>
            Retry
          </button>
        </div>
      ) : history.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">No history recorded yet.</p>
      ) : (
        <>
          <div
            className="max-h-48 overflow-y-auto overscroll-contain p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            tabIndex={0}
            role="region"
            aria-label="Full evolution history, oldest to newest"
          >
            <ol className="grid grid-cols-[repeat(auto-fill,minmax(44px,1fr))] gap-2">
              {history.map((entry, index) => {
                const species = DIGIMON_LOOKUP_TABLE[entry.digimon_id];
                const current = index === history.length - 1 && entry.digimon_id === speciesId;
                const label = `${index + 1}. ${species?.name ?? 'Unknown Digimon'} · #${species?.digimon_id ?? entry.digimon_id} · ${new Date(entry.recorded_at).toLocaleString()}${current ? ' · Current' : ''}`;
                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className="w-full min-h-[56px] flex flex-col items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                      aria-label={label}
                      aria-pressed={selectedId === entry.id}
                      title={label}
                      onClick={() => setSelectedId((id) => (id === entry.id ? null : entry.id))}
                    >
                      <DigimonSprite
                        digimonName={species?.name ?? ''}
                        fallbackSpriteUrl={species?.sprite_url ?? '/assets/pet/egg.svg'}
                        size="xs"
                        showHappinessAnimations={false}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        #{species?.digimon_id ?? entry.digimon_id}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
          {selected && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2" role="status">
              {selectedSpecies?.name ?? 'Unknown Digimon'} ·{' '}
              {selected.is_backfilled
                ? 'Tracking started'
                : selected.is_starting_point
                  ? 'Acquired'
                  : 'Species changed'}{' '}
              · {new Date(selected.recorded_at).toLocaleString()}
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default DigimonEvolutionHistory;
