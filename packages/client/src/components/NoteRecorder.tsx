import { useRef, useState } from "react";
import { addAudioNote } from "../lib/apiClient";

export function NoteRecorder({ relicPlacementId }: { relicPlacementId: string }) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setUploading(true);
        try {
          await addAudioNote(relicPlacementId, blob);
        } catch {
          setError("Couldn't upload the recording.");
        } finally {
          setUploading(false);
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("Microphone access denied.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div>
      <button
        onClick={recording ? stopRecording : startRecording}
        disabled={uploading}
        className={`w-full rounded-xl px-4 py-2 text-sm font-semibold ${
          recording ? "bg-red-600 text-white" : "bg-black/30 text-gray-200"
        } disabled:opacity-40`}
      >
        {uploading ? "Uploading..." : recording ? "Stop Recording" : "🎤 Record a Voice Note"}
      </button>
      {error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
