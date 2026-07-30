import { useEffect, useState } from "react";
import { loadAudioNoteUrl } from "../lib/apiClient";

export function AudioNotePlayer({ audioPath }: { audioPath: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    loadAudioNoteUrl(audioPath).then((u) => {
      if (cancelled) {
        URL.revokeObjectURL(u);
        return;
      }
      objectUrl = u;
      setUrl(u);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [audioPath]);

  if (!url) return <p className="text-gray-500 text-xs">Loading recording...</p>;
  return <audio controls src={url} className="w-full h-8" />;
}
