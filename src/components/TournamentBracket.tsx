import React from 'react';
import { Crown, ChevronRight } from 'lucide-react';
import type { UserTournament, TournamentPlacement, RoundResult } from '../types/tournament';
import { getTournamentMatches } from '../utils/tournamentBracket';
import DigimonSprite from './DigimonSprite';

interface TournamentBracketProps {
  tournament: UserTournament | null;
  roundResults: RoundResult[];
  currentRound: number;
  finalPlacement: TournamentPlacement | null;
  isCompleted: boolean;
  userUsername?: string;
  userAvatarUrl?: string;
}
const PLACEMENTS = {
  qf_loss: 'Top 8',
  sf_loss: 'Top 4',
  gf_loss: 'Runner-Up',
  champion: 'Champion',
};

const TournamentBracket: React.FC<TournamentBracketProps> = ({
  tournament,
  roundResults,
  currentRound,
  finalPlacement,
  isCompleted,
  userUsername,
  userAvatarUrl,
}) => {
  const rounds = getTournamentMatches(tournament, roundResults);
  return (
    <div>
      {finalPlacement && (
        <div className="mb-4 flex items-center justify-center gap-2 font-bold text-accent-600 dark:text-accent-300">
          <Crown className="w-5 h-5" />
          {PLACEMENTS[finalPlacement]}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {rounds.map((matches, roundIndex) => (
          <section key={roundIndex} className="min-w-0 flex flex-col">
            <h3 className="ui-section-title mb-3 flex items-center gap-2">
              {['Quarterfinals', 'Semifinals', 'Grand Final'][roundIndex]}
              {tournament && !isCompleted && currentRound === roundIndex + 1 && (
                <span className="text-xs font-body text-accent-600 dark:text-accent-300">
                  Up next
                </span>
              )}
            </h3>
            <div className="flex-1 flex flex-col justify-around gap-4">
              {matches.map((match, index) => (
                <div
                  key={index}
                  className="ui-panel overflow-hidden divide-y divide-gray-200 dark:divide-dark-100"
                  aria-label={`${['Quarterfinal', 'Semifinal', 'Final'][roundIndex]} match ${index + 1}`}
                >
                  {match.teams.map((team, teamIndex) => {
                    const won = !!team && match.winner?.slot === team.slot;
                    const lost = !!team && !!match.winner && !won;
                    const name = team?.is_user
                      ? (userUsername ?? 'You')
                      : (team?.name ?? 'To be decided');
                    return (
                      <div
                        key={teamIndex}
                        className={`p-3 min-w-0 ${lost ? 'opacity-60' : ''} ${won ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {team?.is_user && userAvatarUrl && (
                            <img src={userAvatarUrl} alt="" className="w-5 h-5 rounded-full" />
                          )}
                          <span
                            className={`text-sm font-semibold truncate flex-1 ${lost ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}
                            title={name}
                          >
                            {name}
                          </span>
                          {match.winner && (
                            <span
                              className={`text-xs shrink-0 ${won ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                              {won ? (roundIndex === 2 ? 'Champion' : 'Advanced') : 'Defeated'}
                            </span>
                          )}
                          {won && roundIndex < 2 && (
                            <ChevronRight className="w-4 h-4 text-green-600 shrink-0" />
                          )}
                        </div>
                        {!!team?.team?.length && (
                          <div className="flex items-center gap-3 mt-2">
                            {team.team.slice(0, 3).map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
                              >
                                <DigimonSprite
                                  digimonName={member.name}
                                  fallbackSpriteUrl={member.sprite_url}
                                  size="xs"
                                  showHappinessAnimations={false}
                                />
                                <span>Lv. {member.current_level}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
export default TournamentBracket;
