import { useCallback, useEffect, useRef, useState } from "react";

export type VoiceLang = "en" | "ny" | "tum" | "yao";

/** Browser speech locales. Malawian languages have no browser voice yet —
 *  we listen/speak in the closest supported locale while the AI replies in the chosen language. */
export const speechLocale: Record<VoiceLang, string> = {
  en: "en-US",
  ny: "en-ZA",
  tum: "en-ZA",
  yao: "en-ZA",
};

export const langLabels: Record<VoiceLang, string> = {
  en: "English",
  ny: "Chichewa",
  tum: "Tumbuka",
  yao: "Yao",
};

type SR = any;

export function useLiveVoice(lang: VoiceLang) {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SR | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => {});

  const supported =
    typeof window !== "undefined" &&
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = speechLocale[lang];
      u.rate = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  const stopListening = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  const startListening = useCallback(
    (onFinal: (text: string) => void) => {
      if (!supported) return false;
      stopSpeaking(); // voice interruption
      onFinalRef.current = onFinal;
      const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec: SR = new Ctor();
      rec.lang = speechLocale[lang];
      rec.interimResults = true;
      rec.continuous = false;
      rec.onresult = (e: any) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) {
            const text = res[0].transcript.trim();
            setTranscript(text);
            if (text) onFinalRef.current(text);
          } else {
            interim += res[0].transcript;
          }
        }
        if (interim) setTranscript(interim);
      };
      rec.onend = () => setListening(false);
      rec.onerror = () => setListening(false);
      recRef.current = rec;
      setTranscript("");
      try { rec.start(); setListening(true); return true; } catch { return false; }
    },
    [lang, supported, stopSpeaking],
  );

  useEffect(() => () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return { supported, listening, speaking, transcript, startListening, stopListening, speak, stopSpeaking };
}
