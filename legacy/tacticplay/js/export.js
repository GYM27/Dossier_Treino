/**
 * Inicia o processo de gravação da animação para exportar um ficheiro de vídeo (MP4/WebM).
 */
window.triggerVideoExport = function() {
        if (window.isRecording) return;
        if (!window.MediaRecorder || !window.canvas.captureStream)
          return alert("Não suportado no navegador.");
        window.isRecording = true;
        window.recordedChunks = [];
        document.getElementById("recording-dot").className =
          "relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 transition-colors duration-300";
        document.getElementById("recording-ping").className =
          "absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping";
        document.getElementById("export-overlay").classList.remove("hidden");

        const stream = window.canvas.captureStream(30);
        let options = { mimeType: "video/webm;codecs=vp9" };
        if (!MediaRecorder.isTypeSupported(options.mimeType))
          options = { mimeType: "video/webm" };
        window.mediaRecorder = new MediaRecorder(stream, options);
        window.mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) window.recordedChunks.push(e.data);
        };
        window.mediaRecorder.onstop = () => {
          const url = URL.createObjectURL(
            new Blob(window.recordedChunks, { type: "video/webm" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = `tacticplay_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          document.getElementById("recording-dot").className =
            "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 transition-colors duration-300";
          document.getElementById("recording-ping").className =
            "absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping";
          document.getElementById("export-overlay").classList.add("hidden");
          window.isRecording = false;
        };

        window.state.currentFrameIdx = 0;
        window.state.playbackStartTime = performance.now();
        window.state.isPlaying = true;
        updateTimelineUI();
        window.mediaRecorder.start();
        window.recordingDuration = window.state.activePath.length * window.state.transitionSpeed;
        const startT = performance.now();
        window.recordingTimer = setInterval(() => {
          const p = Math.min(
            100,
            Math.round(
              ((performance.now() - startT) / window.recordingDuration) * 100,
            ),
          );
          document.getElementById("export-progress-bar").style.width = p + "%";
          document.getElementById("export-percentage").textContent = p + "%";
          if (p >= 100) clearInterval(window.recordingTimer);
        }, 100);
      }

/**
 * Finaliza a gravação do vídeo e desencadeia o download do ficheiro resultante.
 */
window.stopVideoRecording = function() {
        if (window.recordingTimer) clearInterval(window.recordingTimer);
        if (window.mediaRecorder && window.mediaRecorder.window.state !== "inactive")
          window.mediaRecorder.stop();
      }

