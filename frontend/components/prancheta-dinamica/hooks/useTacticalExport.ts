"use client";

import { useState, useCallback, useRef } from "react";

export interface TacticalExportOptions {
  fileNamePrefix?: string;
  fps?: number;
}

export function useTacticalExport(options: TacticalExportOptions = {}) {
  const { fileNamePrefix = "tacticplay", fps = 30 } = options;

  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setProgress(100);
  }, []);

  const startRecording = useCallback(
    (
      canvas: HTMLCanvasElement,
      durationMs: number,
      onComplete?: () => void
    ) => {
      if (isRecording || !canvas) return;

      if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
        alert("A gravação de vídeo não é suportada pelo teu navegador atual.");
        return;
      }

      setIsRecording(true);
      setProgress(0);
      recordedChunksRef.current = [];

      try {
        const stream = canvas.captureStream(fps);
        let mimeType = "video/webm;codecs=vp9";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }

        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (recordedChunksRef.current.length > 0) {
            const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            a.download = `${fileNamePrefix}_${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }, 100);
          }

          setIsRecording(false);
          setProgress(0);
          if (onComplete) onComplete();
        };

        recorder.start();

        const startTime = performance.now();
        const intervalTime = 100;
        timerRef.current = setInterval(() => {
          const elapsed = performance.now() - startTime;
          const currentProgress = Math.min(99, Math.round((elapsed / durationMs) * 100));
          setProgress(currentProgress);

          if (elapsed >= durationMs) {
            stopRecording();
          }
        }, intervalTime);
      } catch (err) {
        console.error("Erro ao iniciar gravação de vídeo:", err);
        setIsRecording(false);
        setProgress(0);
      }
    },
    [isRecording, fps, fileNamePrefix, stopRecording]
  );

  return {
    isRecording,
    progress,
    isSupported,
    setProgress,
    startRecording,
    stopRecording,
  };
}
