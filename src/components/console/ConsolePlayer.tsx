'use client';

import * as React from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ConsolePlayer — 放送卓(改訂版) §4 audio player.
 *
 * 34px circular play/pause button (violet, allowed circle exception), 3px
 * seekable hairline track, mono time readout. Playback position is persisted
 * to localStorage (`console-playback:{storageKey}`) and restored on mount.
 *
 * When `src` is absent (no episode audio API yet) the player renders its
 * hairline frame with `—` in the numeric positions and disabled controls —
 * no fabricated values (README ローディング spec).
 *
 * 前のコーナー / 次のコーナー jump to `segments` boundaries; without segment
 * data they stay disabled.
 */

interface ConsolePlayerProps {
  /** Audio URL; undefined = degraded frame (no audio source available). */
  src?: string;
  /** Stable key for localStorage position persistence. */
  storageKey: string;
  className?: string;
}

const POSITION_SAVE_INTERVAL_MS = 5_000;

function formatTime(seconds: number | null): string {
  if (seconds === null || !isFinite(seconds)) return '—';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function readSavedPosition(key: string): number | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number(raw);
    return isFinite(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function writeSavedPosition(key: string, seconds: number): void {
  try {
    window.localStorage.setItem(key, String(Math.floor(seconds)));
  } catch {
    // Storage unavailable (private mode etc.) — position simply isn't saved.
  }
}

export function ConsolePlayer({ src, storageKey, className }: ConsolePlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastSaveRef = React.useRef(0);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(0);
  const [duration, setDuration] = React.useState<number | null>(null);

  const storageKeyFull = `console-playback:${storageKey}`;
  const disabled = !src;
  const progressPct = duration ? Math.min(100, (position / duration) * 100) : 0;

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    const saved = readSavedPosition(storageKeyFull);
    if (saved !== null && saved < audio.duration - 2) {
      audio.currentTime = saved;
      setPosition(saved);
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setPosition(audio.currentTime);
    const now = Date.now();
    if (now - lastSaveRef.current >= POSITION_SAVE_INTERVAL_MS) {
      lastSaveRef.current = now;
      writeSavedPosition(storageKeyFull, audio.currentTime);
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      writeSavedPosition(storageKeyFull, audio.currentTime);
      setPlaying(false);
    } else {
      void audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    }
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    const value = Number(event.target.value);
    if (audio) {
      audio.currentTime = value;
    }
    setPosition(value);
    writeSavedPosition(storageKeyFull, value);
  };

  return (
    <div className={cn('border border-console-line-2 bg-console-panel', className)}>
      <div className="flex items-center gap-3.5 px-[18px] py-3.5">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={disabled}
          aria-label={playing ? '一時停止' : '再生'}
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-console-violet text-console-on-accent transition-colors duration-[120ms] ease-out disabled:opacity-40"
        >
          {playing ? (
            <Pause size={14} fill="currentColor" />
          ) : (
            <Play size={14} fill="currentColor" className="translate-x-px" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={duration ?? 0}
          step={1}
          value={position}
          onChange={handleSeek}
          disabled={disabled || !duration}
          aria-label="再生位置"
          className="console-range min-w-0 flex-1"
          style={{ '--console-range-pct': `${progressPct}%` } as React.CSSProperties}
        />
        <span className="shrink-0 font-mono text-[12px] text-console-ink-weak">
          {disabled ? '— / —' : `${formatTime(position)} / ${formatTime(duration)}`}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-console-line-1 px-[18px] py-2.5 font-mono text-[11px] text-console-ink-faint">
        <span>このセグメント —</span>
        <div className="flex gap-4">
          <button type="button" disabled className="disabled:opacity-60">
            前のコーナー
          </button>
          <button type="button" disabled className="disabled:opacity-60">
            次のコーナー
          </button>
        </div>
      </div>
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setPlaying(false)}
        />
      )}
    </div>
  );
}
