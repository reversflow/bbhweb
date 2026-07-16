import { useEffect, useState } from "react";

const KEY = "bbh:visitor-key";

export function useVisitorKey(): string | null {
  const [key, setKey] = useState<string | null>(null);
  useEffect(() => {
    let v = window.localStorage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      window.localStorage.setItem(KEY, v);
    }
    setKey(v);
  }, []);
  return key;
}
