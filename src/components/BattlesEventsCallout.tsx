import { Link } from 'react-router-dom';
import { Ticket, Trophy } from 'lucide-react';
import { useBattleReminders } from '../hooks/useBattleReminders';

export default function BattlesEventsCallout() {
  const { tickets, tournament, tournamentLoaded } = useBattleReminders();
  const hasTickets = tickets !== null && tickets.current > 0;
  const ticketsFull = hasTickets && tickets.max > 0 && tickets.current >= tickets.max;
  const tournamentAvailable = tournamentLoaded && (!tournament || tournament.status === 'active');

  if (!hasTickets && !tournamentAvailable) return null;

  const rowClass = (emphasized: boolean) =>
    `flex flex-wrap items-center gap-3 border-l-4 px-4 py-3 ${
      emphasized
        ? 'border-l-accent-500 bg-accent-50 dark:bg-accent-900/20'
        : 'border-l-gray-300 dark:border-l-gray-600'
    }`;

  return (
    <section className="ui-panel overflow-hidden" aria-labelledby="battles-events-heading">
      <h2 id="battles-events-heading" className="ui-section-title px-4 py-3">
        Battles &amp; Events
      </h2>
      <div className="divide-y divide-gray-200 dark:divide-dark-100">
        {hasTickets && (
          <div className={rowClass(ticketsFull)}>
            <Ticket
              className="h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 basis-48">
              <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">
                Arena
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {ticketsFull
                  ? 'Tickets maxed! Use some to make room for task rewards.'
                  : `You have ${tickets.current} battle ticket${tickets.current === 1 ? '' : 's'}. Battle to earn Bits.`}
              </p>
            </div>
            <Link to="/battle" className="btn-secondary text-sm">
              Go to Arena
            </Link>
          </div>
        )}
        {tournamentAvailable && (
          <div className={rowClass(true)}>
            <Trophy
              className="h-5 w-5 shrink-0 text-accent-600 dark:text-accent-400"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1 basis-48">
              <p className="text-sm font-heading font-semibold text-gray-900 dark:text-gray-100">
                Weekly Tournament
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tournament
                  ? `Your tournament is waiting: Round ${tournament.current_round}/3.`
                  : "This week's tournament is open. Entry is free!"}
              </p>
            </div>
            <Link to="/tournament" className="btn-secondary text-sm">
              {tournament ? 'Continue Tournament' : 'Enter Tournament'}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
