/**
 * AccessLogList Component
 *
 * Chronological (newest first) list of feed accesses: when, which friend,
 * and what was fetched (feed.xml vs an episode mp3).
 */
import * as React from 'react';
import { Rss, AudioLines } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/formatDate';
import type { AccessLog } from '@/types/api';

interface AccessLogListProps {
  /** Log rows, newest first */
  logs: AccessLog[];
  /** Hide the subscriber name column (e.g. on a friend detail page) */
  hideSubscriber?: boolean;
}

/**
 * AccessLogList - timeline of feed fetches.
 */
export function AccessLogList({ logs, hideSubscriber = false }: AccessLogListProps) {
  if (logs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">No accesses recorded yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border/40" aria-label="Access log timeline">
      {logs.map((log) => {
        const isEpisode = log.episode_id !== null;
        return (
          <li key={log.id} className="flex items-start gap-3 px-1 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
              {isEpisode ? (
                <AudioLines className="h-4 w-4 text-primary" aria-hidden="true" />
              ) : (
                <Rss className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                {!hideSubscriber && <span className="font-medium">{log.subscriber_name} </span>}
                <span className="text-muted-foreground">
                  {isEpisode ? `downloaded episode #${log.episode_id}` : 'fetched the feed'}
                </span>
              </p>
              {log.user_agent && (
                <p className="truncate text-xs text-muted-foreground/70" title={log.user_agent}>
                  {log.user_agent}
                </p>
              )}
            </div>
            <time
              className="shrink-0 text-xs text-muted-foreground"
              dateTime={log.accessed_at}
              title={new Date(log.accessed_at).toLocaleString()}
            >
              {formatRelativeTime(log.accessed_at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
