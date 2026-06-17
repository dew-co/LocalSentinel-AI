export type VoiceRuntimeStatus = "Ready" | "Listening" | "Thinking" | "Speaking";

export type VoiceTranscriptEntry = {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: string;
};

type ListenOptions = {
  onResult: (text: string) => void;
  onStatus?: (status: VoiceRuntimeStatus) => void;
  onError?: (message: string) => void;
  silenceTimeoutMs?: number;
};

type SpeakOptions = {
  enabled?: boolean;
  responseLength?: "brief" | "balanced" | "detailed";
  onStatus?: (status: VoiceRuntimeStatus) => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

function recognitionConstructor(): SpeechRecognitionCtor | null {
  return (window.SpeechRecognition || window.webkitSpeechRecognition || null) as SpeechRecognitionCtor | null;
}

function transcriptId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function trimForSpeech(text: string, responseLength: SpeakOptions["responseLength"] = "balanced") {
  const limit = responseLength === "brief" ? 500 : responseLength === "detailed" ? 1800 : 1000;
  return text.length > limit ? `${text.slice(0, limit)}. I can continue with more detail in chat.` : text;
}

export const voiceService = {
  isRecognitionSupported() {
    return Boolean(recognitionConstructor());
  },

  isSpeechSupported() {
    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  },

  createEntry(role: VoiceTranscriptEntry["role"], text: string): VoiceTranscriptEntry {
    return { id: transcriptId(), role, text, createdAt: new Date().toISOString() };
  },

  startListening(options: ListenOptions) {
    const Recognition = recognitionConstructor();
    if (!Recognition) {
      options.onError?.("Voice recognition is not supported in this browser. Text chat is still available.");
      options.onStatus?.("Ready");
      return { stop: () => undefined };
    }

    const recognition = new Recognition();
    const silenceTimeoutMs = options.silenceTimeoutMs ?? 5000;
    let finalTranscript = "";
    let interimTranscript = "";
    let lastSpeechAt = Date.now();
    let silenceTimer: ReturnType<typeof window.setTimeout> | null = null;
    let restartTimer: ReturnType<typeof window.setTimeout> | null = null;
    let manualStop = false;
    let submitted = false;
    let fatalError = false;

    const clearSilenceTimer = () => {
      if (silenceTimer) window.clearTimeout(silenceTimer);
      silenceTimer = null;
    };

    const clearRestartTimer = () => {
      if (restartTimer) window.clearTimeout(restartTimer);
      restartTimer = null;
    };

    const currentTranscript = () => `${finalTranscript} ${interimTranscript}`.replace(/\s+/g, " ").trim();

    const finish = () => {
      if (submitted) return;
      submitted = true;
      clearSilenceTimer();
      clearRestartTimer();
      const text = currentTranscript();
      if (text) options.onResult(text);
      options.onStatus?.("Ready");
    };

    const stopRecognition = () => {
      try {
        recognition.stop();
      } catch {
        // The browser may already have ended the recognition session.
      }
    };

    const scheduleFinishAfterSilence = () => {
      clearSilenceTimer();
      silenceTimer = window.setTimeout(() => {
        manualStop = true;
        finish();
        stopRecognition();
      }, silenceTimeoutMs);
    };

    const restartRecognition = () => {
      clearRestartTimer();
      restartTimer = window.setTimeout(() => {
        if (manualStop || submitted || fatalError) return;
        try {
          recognition.start();
          options.onStatus?.("Listening");
        } catch {
          finish();
        }
      }, 150);
    };

    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event) => {
      lastSpeechAt = Date.now();
      let nextInterim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript?.trim();
        if (!text) continue;
        if (result.isFinal) finalTranscript = `${finalTranscript} ${text}`.trim();
        else nextInterim = `${nextInterim} ${text}`.trim();
      }
      interimTranscript = nextInterim;
      scheduleFinishAfterSilence();
    };
    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      fatalError = true;
      clearSilenceTimer();
      clearRestartTimer();
      const partialText = currentTranscript();
      if (partialText) {
        finish();
        return;
      }
      options.onError?.("Speech recognition stopped before a transcript was captured.");
      options.onStatus?.("Ready");
    };
    recognition.onend = () => {
      if (submitted || fatalError) return;
      if (manualStop) {
        finish();
        return;
      }

      const quietFor = Date.now() - lastSpeechAt;
      const hasTranscript = Boolean(currentTranscript());
      if (quietFor < silenceTimeoutMs) {
        restartRecognition();
        return;
      }

      if (hasTranscript) finish();
      else options.onStatus?.("Ready");
    };
    recognition.start();
    options.onStatus?.("Listening");
    scheduleFinishAfterSilence();

    return {
      stop: () => {
        manualStop = true;
        finish();
        stopRecognition();
      }
    };
  },

  speak(text: string, options: SpeakOptions = {}) {
    if (options.enabled === false || !this.isSpeechSupported()) {
      options.onStatus?.("Ready");
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(trimForSpeech(text, options.responseLength));
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onstart = () => options.onStatus?.("Speaking");
      utterance.onend = () => {
        options.onStatus?.("Ready");
        resolve();
      };
      utterance.onerror = () => {
        options.onStatus?.("Ready");
        resolve();
      };
      window.speechSynthesis.speak(utterance);
    });
  },

  cancelSpeech() {
    if (this.isSpeechSupported()) window.speechSynthesis.cancel();
  }
};
