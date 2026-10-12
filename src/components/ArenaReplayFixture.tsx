import { useMemo, useState } from 'react';
import { simulateArena } from '../engine/arenaReplay';
import { convertToBattleDigimon } from '../utils/convertToBattleDigimon';
import ArenaBattle from './ArenaBattle';

const makeFighter = (id: number, team: 'user' | 'opponent') =>
  convertToBattleDigimon(
    {
      id: `${team}-${id}`,
      digimon_id: id,
      current_level: 25,
      hp_bonus: 0,
      atk_bonus: 0,
      def_bonus: 0,
      int_bonus: 0,
      sp_bonus: 0,
      spd_bonus: 0,
    },
    team === 'user'
  );

const ArenaReplayFixture = () => {
  const [playbackKey, setPlaybackKey] = useState(0);
  const userTeam = useMemo(() => [makeFighter(1, 'user'), makeFighter(18, 'user')], []);
  const opponentTeam = useMemo(
    () => [makeFighter(23, 'opponent'), makeFighter(24, 'opponent')],
    []
  );
  const replay = useMemo(
    () => simulateArena(userTeam, opponentTeam, ['balanced', 'balanced'], 20260921),
    [opponentTeam, userTeam]
  );

  return (
    <div className="space-y-3" data-arena-replay-fixture="true">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="ui-section-title">Deterministic arena replay</h3>
          <p className="ui-description mt-1">
            Account-free fixture using a fixed seed and saved playback state.
          </p>
        </div>
        <button
          className="btn-secondary"
          type="button"
          onClick={() => setPlaybackKey((key) => key + 1)}
        >
          Replay fixture
        </button>
      </div>
      <ArenaBattle key={playbackKey} replay={replay} onBattleComplete={() => undefined} />
    </div>
  );
};

export default ArenaReplayFixture;
