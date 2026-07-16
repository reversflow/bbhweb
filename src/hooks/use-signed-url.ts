import { useEffect, useState } from "react";
import { signMediaUrl } from "@/lib/media.functions";

/** Resolves a private storage path to a signed URL. Client-safe. */
export function useSignedUrl(bucket: "song-artwork" | "artist-media" | "journal-media", path?: string | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    if (/^https?:\/\//.test(path)) {
      setUrl(path);
      return;
    }
    (async () => {
      try {
        const res = await signMediaUrl({ data: { bucket, path } });
        if (!cancelled) setUrl(res.url);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bucket, path]);
  return url;
}
