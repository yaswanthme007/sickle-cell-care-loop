import { Language } from './types';

class SpeechService {
  private audioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined';
  }

  public speak(
    text: string,
    lang: Language = 'en',
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (typeof window === 'undefined') return false;

    // Stop any active audio or speech first
    this.stop();

    const cleanText = text.replace(/[“”"]/g, '').trim();
    if (!cleanText) return false;

    try {
      // Primary: Play natural neural MP3 audio via our server-side /api/tts endpoint
      // Works on all browsers including Brave/Chromium on Linux where OS speech-dispatcher voices may be absent
      const ttsUrl = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(cleanText)}`;
      const audio = new Audio(ttsUrl);
      this.audioElement = audio;

      audio.onended = () => {
        this.audioElement = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        this.audioElement = null;
        // Fallback to browser Web Speech API if offline
        this.speakWithBrowserFallback(cleanText, lang, onEnd, onError);
      };

      audio.play().catch(() => {
        this.audioElement = null;
        this.speakWithBrowserFallback(cleanText, lang, onEnd, onError);
      });

      return true;
    } catch (err) {
      return this.speakWithBrowserFallback(cleanText, lang, onEnd, onError);
    }
  }

  private speakWithBrowserFallback(
    text: string,
    lang: Language,
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onError) onError();
      return false;
    }

    const synth = window.speechSynthesis;
    try {
      synth.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = lang === 'hi' ? 0.9 : 0.95;

        const voices = synth.getVoices();
        const targetPrefix = lang === 'hi' ? 'hi' : 'en';
        const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        utterance.onend = () => {
          this.currentUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onerror = () => {
          this.currentUtterance = null;
          if (onError) onError();
        };

        this.currentUtterance = utterance;
        synth.resume();
        synth.speak(utterance);
      }, 60);
      return true;
    } catch {
      if (onError) onError();
      return false;
    }
  }

  public stop(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch {
        // ignore
      }
      this.audioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
