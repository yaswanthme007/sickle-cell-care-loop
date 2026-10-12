import { Language } from './types';

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public speak(
    text: string,
    lang: Language = 'en',
    onEnd?: () => void,
    onError?: () => void
  ): boolean {
    if (!this.synth) return false;

    // Stop any current voice output
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = lang === 'hi' ? 0.9 : 0.95; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      // Try selecting native language voice if loaded
      const voices = this.synth.getVoices();
      const targetLangPrefix = lang === 'hi' ? 'hi' : 'en';
      const matchedVoice = voices.find((v) => v.lang.startsWith(targetLangPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onend = () => {
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        this.currentUtterance = null;
        if (onError) onError();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Failed to initiate TTS:', err);
      return false;
    }
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }
}

export const speechService = new SpeechService();
