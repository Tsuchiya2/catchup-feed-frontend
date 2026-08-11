/**
 * AccessLogList Component — console timeline rows (放送卓改訂版).
 *
 * Chronological (newest first) list of feed accesses: when, which friend,
 * and what was fetched (feed.xml vs an episode mp3). Hairline-divided rows,
 * mono labels — no icons in boxes, no fills.
 */
import * as React from 'react';
import { formatRelativeTimeJa } from '@/lib/utils/relativeTimeJa';
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
      <p className="py-6 text-center text-[12.5px] text-console-ink-weak">
        アクセスはまだ記録されていません。
      </p>
    );
  }

  return (
    <ul className="divide-y divide-console-line-1" aria-label="アクセスログのタイムライン">
      {logs.map((log) => {
        const isEpisode = log.episode_id !== null;
        return (
          <li key={log.id} className="flex items-start gap-4 py-3">
            <span
              aria-hidden="true"
              className={`w-[44px] shrink-0 pt-0.5 font-mono text-[10.5px] tracking-[.12em] ${
                isEpisode ? 'text-console-violet' : 'text-console-ink-faint'
              }`}
            >
              {isEpisode ? 'MP3' : 'RSS'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-[1.7]">
                {!hideSubscriber && (
                  <span className="text-console-ink">{log.subscriber_name} </span>
                )}
                <span className="text-console-ink-weak">
                  {isEpisode ? (
                    <>
                      第<span className="font-mono text-[12px]">{log.episode_id}</span>
                      号をダウンロード
                    </>
                  ) : (
                    'フィードを取得'
                  )}
                </span>
              </p>
              {log.user_agent && (
                <p
                  className="truncate font-mono text-[10.5px] text-console-ink-ghost"
                  title={log.user_agent}
                >
                  {log.user_agent}
                </p>
              )}
            </div>
            <time
              className="shrink-0 font-mono text-[10.5px] text-console-ink-faint"
              dateTime={log.accessed_at}
              title={new Date(log.accessed_at).toLocaleString()}
            >
              {formatRelativeTimeJa(log.accessed_at)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
