import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { signMediaUrl } from "@/lib/media.functions";

export type PlayerTrack = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  cover_url?: string | null;
  audio_url?: string | null;
  duration_seconds?: number | null;
};

type PlayerState = {
  track: PlayerTrack | null;
  queue: PlayerTrack[];
  index: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: "off" | "one" | "all";
  loadingUrl: boolean;
  play: (track: PlayerTrack, queue?: PlayerTrack[], index?: number) => void;
  toggle: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  next: () => void;
  prev: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

const PlayerCtx = createContext<PlayerState | null>(null);

async function resolveAudioUrl(path?: string | null): Promise<string | null> {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  try {
    const res = await signMediaUrl({ data: { bucket: "song-audio", path } });
    return res.url;
  } catch {
    return null;
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.9);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "one" | "all">("off");
  const [loadingUrl, setLoadingUrl] = useState(false);

  // create audio element once (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const a = new Audio();
    a.preload = "metadata";
    audioRef.current = a;
    a.volume = volume;
    a.addEventListener("timeupdate", () => setCurrentTime(a.currentTime));
    a.addEventListener("durationchange", () => setDuration(a.duration || 0));
    a.addEventListener("play", () => setPlaying(true));
    a.addEventListener("pause", () => setPlaying(false));
    a.addEventListener("ended", () => {
      // handled in a separate effect that reads latest state via refs
      endedRef.current?.();
    });
    return () => {
      a.pause();
      a.src = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endedRef = useRef<() => void>(() => {});

  const play = useCallback(async (t: PlayerTrack, q?: PlayerTrack[], i?: number) => {
    setTrack(t);
    if (q) {
      setQueue(q);
      setIndex(i ?? q.findIndex((x) => x.id === t.id));
    }
    setLoadingUrl(true);
    const url = await resolveAudioUrl(t.audio_url);
    setLoadingUrl(false);
    const a = audioRef.current;
    if (!a || !url) return;
    a.src = url;
    a.play().catch(() => {});
  }, []);

  const toggle = useCallback(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }, [track]);

  const seek = useCallback((t: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    const a = audioRef.current;
    if (a) a.volume = v;
  }, []);

  const next = useCallback(() => {
    if (!queue.length) return;
    let i: number;
    if (shuffle) i = Math.floor(Math.random() * queue.length);
    else i = (index + 1) % queue.length;
    setIndex(i);
    void play(queue[i], queue, i);
  }, [queue, index, shuffle, play]);

  const prev = useCallback(() => {
    if (!queue.length) return;
    const i = (index - 1 + queue.length) % queue.length;
    setIndex(i);
    void play(queue[i], queue, i);
  }, [queue, index, play]);

  endedRef.current = () => {
    if (repeat === "one") {
      const a = audioRef.current;
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
      return;
    }
    if (repeat === "all" || queue.length > 1) next();
    else setPlaying(false);
  };

  // keyboard shortcuts
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!track) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight" && e.shiftKey) next();
      else if (e.code === "ArrowLeft" && e.shiftKey) prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [track, toggle, next, prev]);

  const value = useMemo<PlayerState>(
    () => ({
      track,
      queue,
      index,
      playing,
      currentTime,
      duration,
      volume,
      shuffle,
      repeat,
      loadingUrl,
      play,
      toggle,
      seek,
      setVolume,
      next,
      prev,
      toggleShuffle: () => setShuffle((s) => !s),
      cycleRepeat: () =>
        setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off")),
    }),
    [track, queue, index, playing, currentTime, duration, volume, shuffle, repeat, loadingUrl, play, toggle, seek, setVolume, next, prev],
  );

  return <PlayerCtx.Provider value={value}>{children}</PlayerCtx.Provider>;
}

export function usePlayer() {
  const c = useContext(PlayerCtx);
  if (!c) throw new Error("usePlayer must be used within PlayerProvider");
  return c;
}

export function formatTime(sec: number) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
